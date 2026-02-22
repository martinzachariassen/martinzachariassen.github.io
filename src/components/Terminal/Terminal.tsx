import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import "./Terminal.css";
import { createCommandRegistry } from "../../terminal/commands.js";
import type { CommandEffect, CommandResult, OutputLine } from "../../terminal/commands.js";
import { parseCommand } from "../../terminal/parseCommand.js";
import OutputLineComponent from "./OutputLine.js";
import MatrixOverlay from "../../easter/MatrixOverlay.js";
import { useKonami } from "../../easter/useKonami.js";
import { useResize } from "./useResize.js";

// ── Types ──────────────────────────────────────────────────────────────────

interface TerminalLine extends OutputLine {
  id: string;
  parts?: { text: string; tone?: string }[];
}

interface TerminalState {
  lines: TerminalLine[];
  easterEnabled: boolean;
  glitch: boolean;
  matrixRunning: boolean;
}

type Action =
  | { type: "append"; lines: OutputLine[] }
  | { type: "clear" }
  | { type: "setEasterEnabled"; enabled: boolean }
  | { type: "setGlitch"; on: boolean }
  | { type: "setMatrixRunning"; running: boolean };

// ── Helpers ────────────────────────────────────────────────────────────────

function uid(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function terminalReducer(state: TerminalState, action: Action): TerminalState {
  switch (action.type) {
    case "append":
      return {
        ...state,
        lines: state.lines.concat(
          action.lines.map((l) => ({
            id: uid(),
            tone: l.tone ?? "",
            text: l.text ?? "",
            ...(l.parts ? { parts: l.parts } : {}),
          }))
        ),
      };
    case "clear":
      return { ...state, lines: [] };
    case "setEasterEnabled":
      return { ...state, easterEnabled: action.enabled };
    case "setGlitch":
      return { ...state, glitch: action.on };
    case "setMatrixRunning":
      return { ...state, matrixRunning: action.running };
  }
}

const INITIAL_STATE: TerminalState = {
  lines: [],
  easterEnabled: true,
  glitch: false,
  matrixRunning: false,
};

// ── Component ──────────────────────────────────────────────────────────────

export default function Terminal() {
  const registry = useMemo(() => createCommandRegistry(), []);
  const { height, onMouseDown: onResizeMouseDown } = useResize(480);

  const [state, dispatch] = useReducer(terminalReducer, INITIAL_STATE);
  const [inputValue, setInputValue] = useState("");
  const historyRef = useRef<{ list: string[]; idx: number }>({ list: [], idx: 0 });

  const screenRef = useRef<HTMLDivElement>(null);
  const outRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dotsProgressRef = useRef(0);
  const bannerShownRef = useRef(false);

  const reducedMotion = useMemo(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false,
    []
  );

  // ── Scroll / viewport ───────────────────────────────────────────────────

  const scrollToBottom = useCallback(() => {
    const out = outRef.current;
    if (out) out.scrollTop = out.scrollHeight;
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
    const kbd = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    document.documentElement.style.setProperty("--kbd", `${Math.round(kbd)}px`);
    scrollToBottom();
  }, [scrollToBottom]);

  // ── Initial banner ──────────────────────────────────────────────────────

  useEffect(() => {
    if (bannerShownRef.current) return;
    bannerShownRef.current = true;

    const now = new Date();
    const timestamp = now.toLocaleString("en-GB", {
      weekday: "short", year: "numeric", month: "short",
      day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
    });

    // Boot sequence: [delay in ms, text, tone?]
    const sequence: [number, string, string?][] = [
      [0,    `mlz.no  ${__APP_VERSION__}`,              "accent"],
      [120,  ""],
      [240,  "  booting system...",                  "dim"   ],
      [520,  "  loading profile............  done",  "dim"   ],
      [820,  "  mounting filesystem............  ok","dim"   ],
      [1020, "  starting shell.................  ok","dim"   ],
      [1200, ""],
      [1320, `  ${timestamp}`,                       "dim"   ],
      [1420, "  guest@mlz - welcome back.",          "ok"    ],
      [1560, ""],
      [1660, "  Type 'help' to see available commands.", "dim"],
      [1760, ""],
    ];

    sequence.forEach(([delay, text, tone]) => {
      const ms = reducedMotion ? 0 : delay;
      setTimeout(() => {
        dispatch({ type: "append", lines: [{ text, tone }] });
        queueMicrotask(scrollToBottom);
      }, ms);
    });

    setTimeout(syncViewport, reducedMotion ? 0 : 2000);
  }, [scrollToBottom, syncViewport]);

  useEffect(() => { scrollToBottom(); }, [scrollToBottom, state.lines.length]);

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

  // ── Easter eggs ─────────────────────────────────────────────────────────

  const setBodyClass = useCallback((cls: string, on: boolean) => {
    document.body.classList.toggle(cls, on);
  }, []);

  const startGlitch = useCallback((ms = 1200) => {
    if (!state.easterEnabled || reducedMotion) return;
    dispatch({ type: "setGlitch", on: true });
    window.setTimeout(() => dispatch({ type: "setGlitch", on: false }), ms);
  }, [reducedMotion, state.easterEnabled]);

  useKonami({
    enabled: state.easterEnabled,
    onToggle: (next) => {
      setBodyClass("konami", next);
      dispatch({
        type: "append",
        lines: [{ text: next ? "Konami mode: ON" : "Konami mode: OFF", tone: "ok" }],
      });
    },
  });

  useEffect(() => {
    if (!state.easterEnabled) {
      setBodyClass("konami", false);
      setBodyClass("matrix", false);
      dispatch({ type: "setMatrixRunning", running: false });
      dispatch({ type: "setGlitch", on: false });
    }
  }, [setBodyClass, state.easterEnabled]);

  useEffect(() => {
    setBodyClass("matrix", state.matrixRunning);
  }, [setBodyClass, state.matrixRunning]);

  // ── Effect dispatcher ────────────────────────────────────────────────────

  const applyEffects = useCallback((effects: CommandEffect[]) => {
    for (const eff of effects) {
      if (eff.type === "EASTER") {
        dispatch({ type: "setEasterEnabled", enabled: eff.enabled });
        continue;
      }

      if (eff.type === "MATRIX") {
        if (!state.easterEnabled) continue;

        if (reducedMotion) {
          dispatch({ type: "append", lines: [
            { text: "(matrix) Reduced motion is on; printing vibes instead of animation.", tone: "info" },
            { text: "01001101 01100001 01110100 01110010 01101001 01111000", tone: "ok" },
            { text: "Wake up, Neo.", tone: "ok" },
          ]});
          continue;
        }

        if (eff.mode === "off") dispatch({ type: "setMatrixRunning", running: false });
        else if (eff.mode === "on") dispatch({ type: "setMatrixRunning", running: true });
        else dispatch({ type: "setMatrixRunning", running: !state.matrixRunning });
      }
    }
  }, [reducedMotion, state.easterEnabled, state.matrixRunning]);

  // ── Command runner ───────────────────────────────────────────────────────

  const runCommand = useCallback((raw: string) => {
    const { cmd, args } = parseCommand(raw);

    dispatch({ type: "append", lines: [{ text: `guest@mlz:~$ ${raw}`, tone: "dim" }] });

    if (cmd === "clear") { dispatch({ type: "clear" }); return; }
    if (!cmd) return;

    const normalized = registry.normalizeInput(raw);
    if (state.easterEnabled) {
      if (normalized === "sudo rm -rf /" || normalized === "rm -rf /") {
        startGlitch();
        dispatch({ type: "append", lines: [{ text: "Nice try.", tone: "warn" }] });
      }
      if (normalized === "make me a sandwich") {
        dispatch({ type: "append", lines: [{ text: "No. (But you can have a cookie.)", tone: "em" }] });
      }
    }

    if (!registry.has(cmd)) {
      dispatch({ type: "append", lines: [
        { text: `Command not found: ${cmd}`, tone: "err" },
        { text: "Type 'help' to list commands.", tone: "dim" },
      ]});
      return;
    }

    const res: CommandResult = registry.run(cmd, args);
    if (res.lines.length) dispatch({ type: "append", lines: res.lines });
    if (res.effects?.length) applyEffects(res.effects);
  }, [applyEffects, registry, startGlitch, state.easterEnabled]);

  // ── Input handlers ───────────────────────────────────────────────────────

  const onSubmit = useCallback(() => {
    const value = inputValue;
    if (value.trim()) {
      historyRef.current.list.push(value);
      historyRef.current.idx = historyRef.current.list.length;
    }
    runCommand(value);
    setInputValue("");
    syncViewport();
  }, [inputValue, runCommand, syncViewport]);

  const historyPrev = useCallback(() => {
    const h = historyRef.current;
    if (!h.list.length) return;
    h.idx = Math.max(0, h.idx - 1);
    setInputValue(h.list[h.idx] ?? "");
    queueMicrotask(() => {
      const el = inputRef.current;
      if (el) el.setSelectionRange(el.value.length, el.value.length);
    });
  }, []);

  const historyNext = useCallback(() => {
    const h = historyRef.current;
    if (!h.list.length) return;
    h.idx = Math.min(h.list.length, h.idx + 1);
    setInputValue(h.idx === h.list.length ? "" : (h.list[h.idx] ?? ""));
    queueMicrotask(() => {
      const el = inputRef.current;
      if (el) el.setSelectionRange(el.value.length, el.value.length);
    });
  }, []);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); onSubmit(); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); historyPrev(); }
    if (e.key === "ArrowDown") { e.preventDefault(); historyNext(); }
  }, [historyNext, historyPrev, onSubmit]);

  const onScreenPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement && e.target.closest("a,button,input")) return;
    focusCmd();
  }, [focusCmd]);

  const onDotActivate = useCallback((index: number) => {
    if (!state.easterEnabled) return;
    const expected = dotsProgressRef.current;
    if (index === expected) {
      dotsProgressRef.current += 1;
      if (dotsProgressRef.current === 3) {
        dotsProgressRef.current = 0;
        dispatch({ type: "append", lines: [
          { text: "Window controls engaged...", tone: "dim" },
          { text: "Minimizing... just kidding.", tone: "ok" },
        ]});
        startGlitch(800);
      }
    } else {
      dotsProgressRef.current = index === 0 ? 1 : 0;
    }
  }, [startGlitch, state.easterEnabled]);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="terminal-wrapper">
      <div
        className="terminal"
        aria-label="Terminal style homepage"
        style={{ height: `${height}px` }}
      >
      <div className="titlebar">
        <div className="dots" role="group" aria-label="Window controls">
          {([0, 1, 2] as const).map((i) => (
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
          className={`output${state.glitch ? " glitch" : ""}`}
          role="log"
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

        <div className="promptRow">
          <div className="prompt" aria-hidden="true">
            <span className="p-user">guest</span>
            <span className="p-at">@</span>
            <span className="p-host">mlz</span>
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
            onFocus={() => { syncViewport(); queueMicrotask(scrollToBottom); }}
          />
        </div>

        <div className="hint">
          Try: <span className="accent">help</span>,{" "}
          <span className="accent">about</span>,{" "}
          <span className="accent">experience</span>,{" "}
          <span className="accent">open github</span>
        </div>
      </div>
      {/* closes .terminal */}
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

