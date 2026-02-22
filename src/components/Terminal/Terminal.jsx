import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { createCommandRegistry } from "../../terminal/commands.js";
import { parseCommand } from "../../terminal/parseCommand.js";
import OutputLine from "./OutputLine.jsx";
import MatrixOverlay from "../../easter/MatrixOverlay.jsx";
import { useKonami } from "../../easter/useKonami.js";

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function terminalReducer(state, action) {
  switch (action.type) {
    case "append": {
      return {
        ...state,
        lines: state.lines.concat(
          action.lines.map((l) => ({ id: uid(), tone: l.tone ?? "", text: l.text ?? "" }))
        ),
      };
    }
    case "clear":
      return { ...state, lines: [] };
    case "setEasterEnabled":
      return { ...state, easterEnabled: action.enabled };
    case "setGlitch":
      return { ...state, glitch: action.on };
    case "setMatrixRunning":
      return { ...state, matrixRunning: action.running };
    default:
      return state;
  }
}

export default function Terminal() {
  const registry = useMemo(() => createCommandRegistry(), []);

  const [state, dispatch] = useReducer(terminalReducer, {
    lines: [],
    easterEnabled: true,
    glitch: false,
    matrixRunning: false,
    missStreak: 0,
  });

  const [inputValue, setInputValue] = useState("");
  const historyRef = useRef({ list: [], idx: 0 });

  const screenRef = useRef(null);
  const outRef = useRef(null);
  const inputRef = useRef(null);

  const reducedMotion = useMemo(() => {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  const scrollToBottom = useCallback(() => {
    const out = outRef.current;
    if (!out) return;
    out.scrollTop = out.scrollHeight;
  }, []);

  const focusCmd = useCallback(({ scroll = true } = {}) => {
    const input = inputRef.current;
    if (!input) return;
    input.focus({ preventScroll: !scroll });
    if (scroll) input.scrollIntoView({ block: "nearest" });
  }, []);

  const syncViewport = useCallback(() => {
    const vv = window.visualViewport;
    if (!vv) {
      document.documentElement.style.setProperty("--kbd", "0px");
      return;
    }

    const innerH = window.innerHeight;
    const kbd = Math.max(0, innerH - vv.height - vv.offsetTop);
    document.documentElement.style.setProperty("--kbd", `${Math.round(kbd)}px`);
    scrollToBottom();
  }, [scrollToBottom]);

  // Initial banner
  useEffect(() => {
    dispatch({
      type: "append",
      lines: [
        { text: "Welcome.", tone: "dim" },
        { text: "Type 'help' to see commands.", tone: "dim" },
        { text: "" },
        { text: "about  |  stack  |  projects  |  links  |  contact", tone: "dim" },
        { text: "" },
      ],
    });

    syncViewport();
    queueMicrotask(scrollToBottom);
  }, [scrollToBottom, syncViewport]);

  // keep scrolled as content grows
  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom, state.lines.length]);

  // viewport listeners
  useEffect(() => {
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", syncViewport);
      window.visualViewport.addEventListener("scroll", syncViewport);
    }
    window.addEventListener("orientationchange", syncViewport);
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", syncViewport);
        window.visualViewport.removeEventListener("scroll", syncViewport);
      }
      window.removeEventListener("orientationchange", syncViewport);
    };
  }, [syncViewport]);

  const startGlitch = useCallback((ms = 1200) => {
    if (!state.easterEnabled) return;
    if (reducedMotion) return;
    dispatch({ type: "setGlitch", on: true });
    window.setTimeout(() => dispatch({ type: "setGlitch", on: false }), ms);
  }, [reducedMotion, state.easterEnabled]);

  const setBodyClass = useCallback((cls, on) => {
    document.body.classList.toggle(cls, !!on);
  }, []);

  useKonami({
    enabled: state.easterEnabled,
    onToggle: (next) => {
      setBodyClass("konami", next);
      dispatch({ type: "append", lines: [{ text: next ? "Konami mode: ON" : "Konami mode: OFF", tone: "ok" }] });
    },
  });

  // Ensure turning off easter eggs clears effects
  useEffect(() => {
    if (!state.easterEnabled) {
      setBodyClass("konami", false);
      setBodyClass("matrix", false);
      dispatch({ type: "setMatrixRunning", running: false });
      dispatch({ type: "setGlitch", on: false });
    }
  }, [setBodyClass, state.easterEnabled]);

  // matrix body class
  useEffect(() => {
    setBodyClass("matrix", state.matrixRunning);
  }, [setBodyClass, state.matrixRunning]);

  const applyEffects = useCallback((effects = []) => {
    for (const eff of effects) {
      if (eff.type === "EASTER") {
        dispatch({ type: "setEasterEnabled", enabled: !!eff.enabled });
      }

      if (eff.type === "MATRIX") {
        if (!state.easterEnabled) continue;
        if (eff.mode === "off") dispatch({ type: "setMatrixRunning", running: false });
        else if (eff.mode === "on") dispatch({ type: "setMatrixRunning", running: true });
        else dispatch({ type: "setMatrixRunning", running: !state.matrixRunning });

        if (reducedMotion) {
          dispatch({ type: "append", lines: [{ text: "(matrix) Reduced motion is on; printing vibes instead of animation.", tone: "info" }] });
          dispatch({ type: "append", lines: [{ text: "01001101 01100001 01110100 01110010 01101001 01111000", tone: "ok" }] });
          dispatch({ type: "append", lines: [{ text: "Wake up, Neo.", tone: "ok" }] });
          dispatch({ type: "setMatrixRunning", running: false });
        }
      }
    }
  }, [reducedMotion, state.easterEnabled, state.matrixRunning]);

  const runCommand = useCallback((raw) => {
    const { cmd, args } = parseCommand(raw);

    dispatch({ type: "append", lines: [{ text: `mlz@oslo:~$ ${raw}`, tone: "dim" }] });

    if (cmd === "clear") {
      dispatch({ type: "clear" });
      return;
    }
    if (!cmd) return;

    // phrase triggers
    const normalized = registry.normalizeInput(raw);
    if (state.easterEnabled && (normalized === "sudo rm -rf /" || normalized === "rm -rf /")) {
      startGlitch();
      dispatch({ type: "append", lines: [{ text: "Nice try.", tone: "warn" }] });
    }
    if (state.easterEnabled && normalized === "make me a sandwich") {
      dispatch({ type: "append", lines: [{ text: "No. (But you can have a cookie.)", tone: "em" }] });
    }

    if (!registry.has(cmd)) {
      // miss streak fortune-ish hint
      dispatch({ type: "append", lines: [{ text: `Command not found: ${cmd}`, tone: "err" }] });
      dispatch({ type: "append", lines: [{ text: "Type 'help' to list commands.", tone: "dim" }] });
      return;
    }

    const res = registry.run(cmd, args);
    if (res?.lines?.length) dispatch({ type: "append", lines: res.lines });
    if (res?.effects?.length) applyEffects(res.effects);
  }, [applyEffects, registry, startGlitch, state.easterEnabled]);

  const onSubmit = useCallback(() => {
    const value = inputValue;
    if (value.trim().length) {
      historyRef.current.list.push(value);
      historyRef.current.idx = historyRef.current.list.length;
    }

    runCommand(value);
    setInputValue("");
    syncViewport();
  }, [inputValue, runCommand, syncViewport]);

  const historyPrev = useCallback(() => {
    const h = historyRef.current;
    if (h.list.length === 0) return;
    h.idx = Math.max(0, h.idx - 1);
    setInputValue(h.list[h.idx] ?? "");
    queueMicrotask(() => {
      const el = inputRef.current;
      if (!el) return;
      el.setSelectionRange(el.value.length, el.value.length);
    });
  }, []);

  const historyNext = useCallback(() => {
    const h = historyRef.current;
    if (h.list.length === 0) return;
    h.idx = Math.min(h.list.length, h.idx + 1);
    setInputValue(h.idx === h.list.length ? "" : (h.list[h.idx] ?? ""));
    queueMicrotask(() => {
      const el = inputRef.current;
      if (!el) return;
      el.setSelectionRange(el.value.length, el.value.length);
    });
  }, []);

  const onKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit();
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      historyPrev();
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      historyNext();
    }
  }, [historyNext, historyPrev, onSubmit]);

  const onScreenPointerDown = useCallback((e) => {
    const t = e.target;
    if (t instanceof HTMLElement) {
      if (t.closest("a,button,input")) return;
    }
    focusCmd();
  }, [focusCmd]);

  const dotsProgressRef = useRef(0);
  const onDotActivate = useCallback((index) => {
    if (!state.easterEnabled) return;
    const expected = dotsProgressRef.current;

    if (index === expected) {
      dotsProgressRef.current += 1;
      if (dotsProgressRef.current === 3) {
        dotsProgressRef.current = 0;
        dispatch({ type: "append", lines: [{ text: "Window controls engaged...", tone: "dim" }, { text: "Minimizing... just kidding.", tone: "ok" }] });
        startGlitch(800);
      }
    } else {
      dotsProgressRef.current = index === 0 ? 1 : 0;
    }
  }, [startGlitch, state.easterEnabled]);

  return (
    <div className="terminal" aria-label="Terminal style homepage">
      <div className="titlebar">
        <div className="dots" role="group" aria-label="Window controls">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              type="button"
              className="dot"
              aria-label={`Dot ${i + 1}`}
              onClick={() => onDotActivate(i)}
            />
          ))}
        </div>
        <div className="title">mlz.no — terminal</div>
      </div>

      <div
        id="screen"
        ref={screenRef}
        className="screen"
        tabIndex={0}
        onPointerDown={onScreenPointerDown}
      >
        <div
          id="out"
          ref={outRef}
          className={`output ${state.glitch ? "glitch" : ""}`.trim()}
          role="log"
          aria-live="polite"
        >
          {state.lines.map((l) => (
            <OutputLine key={l.id} line={l} />
          ))}
        </div>

        <MatrixOverlay
          enabled={state.easterEnabled}
          running={state.matrixRunning}
          onStop={() => dispatch({ type: "setMatrixRunning", running: false })}
        />

        <div className="promptRow">
          <div className="prompt" aria-hidden="true">
            <span className="p-user">mlz</span>
            <span className="p-at">@</span>
            <span className="p-host">oslo</span>
            <span className="p-colon">:</span>
            <span className="p-path">~</span>
            <span className="p-sym">$</span>
          </div>
          <input
            id="cmd"
            ref={inputRef}
            aria-label="Command input"
            autoComplete="off"
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            inputMode="text"
            enterKeyHint="send"
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => {
              syncViewport();
              queueMicrotask(scrollToBottom);
            }}
          />
        </div>

        <div className="hint">
          Try: <span className="accent">help</span>, <span className="accent">about</span>,{" "}
          <span className="accent">links</span>
        </div>
      </div>
    </div>
  );
}

