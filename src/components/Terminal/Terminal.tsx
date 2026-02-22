import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import "./Terminal.css";
import { createCommandRegistry } from "../../terminal/commands.js";
import OutputLineComponent from "./OutputLine.js";
import MatrixOverlay from "../../easter/MatrixOverlay.js";
import { useResize } from "./useResize.js";
import { terminalReducer, INITIAL_STATE } from "./terminalReducer.js";
import { useViewport } from "./useViewport.js";
import { useViewportEvents } from "./useViewportEvents.js";
import { useBanner } from "./useBanner.js";
import { useEasterEggs } from "./useEasterEggs.js";
import { useCommandRunner } from "./useCommandRunner.js";
import TerminalPrompt from "./TerminalPrompt.js";

export default function Terminal() {
  const registry = useMemo(() => createCommandRegistry(), []);
  const { height, onMouseDown: onResizeMouseDown } = useResize(580);

  const [state, dispatch] = useReducer(terminalReducer, INITIAL_STATE);

  const terminalRef = useRef<HTMLDivElement>(null);
  const outRef      = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  const reducedMotion = useMemo(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false,
    []
  );

  // ── Scroll ───────────────────────────────────────────────────────────────

  const scrollToBottom = useCallback(() => {
    const out = outRef.current;
    if (out) out.scrollTop = out.scrollHeight;
  }, []);

  // ── Viewport ─────────────────────────────────────────────────────────────

  const { syncViewport } = useViewport({ terminalRef, scrollToBottom });
  useViewportEvents({ terminalRef, syncViewport });

  // ── Banner ───────────────────────────────────────────────────────────────

  useBanner({ dispatch, scrollToBottom, syncViewport, reducedMotion });
  useEffect(() => { scrollToBottom(); }, [scrollToBottom, state.lines.length]);

  // ── Easter eggs ──────────────────────────────────────────────────────────

  const { startGlitch, applyEffects } = useEasterEggs({ state, dispatch, reducedMotion });

  // ── Command runner & input ───────────────────────────────────────────────

  const {
    inputValue,
    setInputValue,
    onKeyDown,
    onScreenPointerDown,
    onScreenPointerMove,
    onScreenPointerUp,
    onDotActivate,
  } = useCommandRunner({
    state, dispatch, registry, inputRef,
    scrollToBottom, syncViewport, applyEffects, startGlitch,
  });

  // ── Render ───────────────────────────────────────────────────────────────

  const isMobile = window.innerWidth <= 640;

  return (
    <div className="terminal-wrapper">
      <div
        ref={terminalRef}
        className="terminal"
        aria-label="Terminal style homepage"
        style={isMobile ? undefined : { height: `${height}px` }}
      >
        <div className="titlebar">
          <div className="dots" role="group" aria-label="Window controls">
            {(["Close", "Minimise", "Maximise"] as const).map((label, i) => (
              <button
                key={i}
                type="button"
                className="dot"
                aria-label={label}
                onClick={() => onDotActivate(i)}
              />
            ))}
          </div>
          <div className="title">mlz.no — terminal</div>
        </div>

        <div
          id="screen"
          className="screen"
          tabIndex={0}
          onPointerDown={onScreenPointerDown}
          onPointerMove={onScreenPointerMove}
          onPointerUp={onScreenPointerUp}
        >
          <div
            id="out"
            ref={outRef}
            className={`output${state.glitch ? " glitch" : ""}`}
            role="log"
            aria-label="Terminal output"
            aria-live="polite"
          >
            {state.lines.map((l) => (
              <OutputLineComponent key={l.id} line={l} />
            ))}
          </div>

          <MatrixOverlay
            enabled={state.easterEnabled}
            running={state.matrixRunning}
            onStop={() => dispatch({ type: "setMatrixRunning", running: false })}
          />

          <TerminalPrompt
            hacked={state.hacked}
            isMobile={isMobile}
            inputValue={inputValue}
            inputRef={inputRef}
            onKeyDown={onKeyDown}
            onFocus={() => { syncViewport(); queueMicrotask(scrollToBottom); }}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus={!isMobile}
          />

          <div className="hint">
            Try: <span className="accent">help</span>,{" "}
            <span className="accent">about</span>,{" "}
            <span className="accent">experience</span>,{" "}
            <span className="accent">open github</span>
          </div>
        </div>
      </div>

      {/* Resize handle — desktop only via CSS */}
      <div
        className="resize-handle"
        onMouseDown={onResizeMouseDown}
        aria-hidden="true"
      >
        <span className="resize-dots" />
      </div>
      <div className="resize-hint" aria-hidden="true">
        drag to resize ↕
      </div>
    </div>
  );
}

