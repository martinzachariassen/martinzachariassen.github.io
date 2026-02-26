import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import "./Terminal.css";
import { createCommandRegistry } from "../../terminal/commands.js";
import OutputLineComponent from "./components/OutputLine.js";
import MatrixOverlay from "../../easter/MatrixOverlay.js";
import { useResize } from "./hooks/useResize.js";
import { terminalReducer, INITIAL_STATE } from "./state/terminalReducer.js";
import { useViewport } from "./hooks/useViewport.js";
import { useViewportEvents } from "./hooks/useViewportEvents.js";
import { useBanner } from "./hooks/useBanner.js";
import { useEasterEggs } from "./hooks/useEasterEggs.js";
import { useCommandRunner } from "./hooks/useCommandRunner.js";
import TerminalPrompt from "./components/TerminalPrompt.js";

export default function Terminal() {
  const registry = useMemo(() => createCommandRegistry(), []);
  const { height, onMouseDown: onResizeMouseDown } = useResize();

  const [state, dispatch] = useReducer(terminalReducer, INITIAL_STATE);

  const terminalRef = useRef<HTMLDivElement>(null);
  const outRef      = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  const motionQuery = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)"), []);
  const [reducedMotion, setReducedMotion] = useState(() => motionQuery.matches);
  useEffect(() => {
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener("change", handler);
    return () => motionQuery.removeEventListener("change", handler);
  }, [motionQuery]);

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

  const mobileQuery = useMemo(() => window.matchMedia("(max-width: 640px)"), []);
  const [isMobile, setIsMobile] = useState(() => mobileQuery.matches);
  useEffect(() => {
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mobileQuery.addEventListener("change", handler);
    return () => mobileQuery.removeEventListener("change", handler);
  }, [mobileQuery]);

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
          <div className="title" aria-label={state.hacked ? "agent at mlz, home directory" : "guest at mlz, home directory"}>
            <span className={state.hacked ? "title-user hacked" : "title-user"}>
              {state.hacked ? "agent" : "guest"}
            </span>
            <span className="title-at">@</span>
            <span className="title-host">mlz.no</span>
            <span className="title-sep">:</span>
            <span className="title-path">~</span>
          </div>
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

