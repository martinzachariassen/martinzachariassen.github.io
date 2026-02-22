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
  hacked: boolean;
}

type Action =
  | { type: "append"; lines: OutputLine[] }
  | { type: "clear" }
  | { type: "setEasterEnabled"; enabled: boolean }
  | { type: "setGlitch"; on: boolean }
  | { type: "setMatrixRunning"; running: boolean }
  | { type: "setHacked"; on: boolean };

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
    case "setHacked":
      return { ...state, hacked: action.on };
  }
}

const INITIAL_STATE: TerminalState = {
  lines: [],
  easterEnabled: true,
  glitch: false,
  matrixRunning: false,
  hacked: false,
};

// ── Component ──────────────────────────────────────────────────────────────

export default function Terminal() {
  const registry = useMemo(() => createCommandRegistry(), []);
  const { height, onMouseDown: onResizeMouseDown } = useResize(580);

  const [state, dispatch] = useReducer(terminalReducer, INITIAL_STATE);
  const [inputValue, setInputValue] = useState("");
  const historyRef = useRef<{ list: string[]; idx: number }>({ list: [], idx: 0 });

  const terminalRef = useRef<HTMLDivElement>(null);
  const scrollScheduled = useRef(false);
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
    const isMobile = window.innerWidth <= 640;

    if (isMobile && terminalRef.current) {
      const h = vv ? Math.round(vv.height) : window.innerHeight;
      terminalRef.current.style.height = `${h}px`;
    } else if (!isMobile) {
      const kbd = vv
        ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
        : 0;
      document.documentElement.style.setProperty("--kbd", `${Math.round(kbd)}px`);
    }

    // Defer scroll until after the 120 ms CSS transition on .terminal height
    // so we don't scroll to a stale position mid-animation.
    if (!scrollScheduled.current) {
      scrollScheduled.current = true;
      setTimeout(() => {
        scrollScheduled.current = false;
        scrollToBottom();
      }, 130);
    }
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

    const isMobile = window.innerWidth <= 640;

    // Boot sequence: [delay in ms, text, tone?]
    // On mobile: run instantly and show a shorter message to save space
    const sequence: [number, string, string?][] = isMobile
      ? [
          [0, `mlz.no  ${__APP_VERSION__}`, "accent"],
          [0, ""],
          [0, "  guest@mlz — welcome.", "ok"],
          [0, "  Type 'help' to get started.", "dim"],
          [0, ""],
        ]
      : [
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
    const vv = window.visualViewport;

    const onOrientationChange = () => {
      // Reset height immediately to full window so the transition starts
      // from the right place after rotation.
      if (terminalRef.current && window.innerWidth <= 640) {
        terminalRef.current.style.height = `${window.innerHeight}px`;
      }
      setTimeout(syncViewport, 100);
    };

    if (vv) {
      vv.addEventListener("resize", syncViewport);
      vv.addEventListener("scroll", syncViewport);
    }
    window.addEventListener("orientationchange", onOrientationChange);

    // Run once on mount to set the initial height correctly
    syncViewport();

    return () => {
      if (vv) {
        vv.removeEventListener("resize", syncViewport);
        vv.removeEventListener("scroll", syncViewport);
      }
      window.removeEventListener("orientationchange", onOrientationChange);
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

    const user = state.hacked ? "agent" : "guest";
    dispatch({ type: "append", lines: [{ text: `${user}@mlz:~$ ${raw}`, tone: "dim" }] });

    if (cmd === "clear") {
      dispatch({ type: "clear" });
      dispatch({ type: "setHacked", on: false });
      return;
    }
    if (!cmd) return;

    const normalized = registry.normalizeInput(raw);
    if (state.easterEnabled) {
      if (normalized === "sudo rm -rf /" || normalized === "rm -rf /") {
        const seq: [number, string, string?][] = [
          [0,    "rm: /: seriously?",                               "err"  ],
          [400,  "",                                                        ],
          [600,  "  [░░░░░░░░░░░░░░░░░░░░]  0%   preparing...",    "warn" ],
          [900,  "  [████░░░░░░░░░░░░░░░░]  20%  scanning...",     "warn" ],
          [1200, "  [████████░░░░░░░░░░░░]  40%  deleting /usr...", "err"  ],
          [1500, "  [████████████░░░░░░░░]  60%  deleting /etc...", "err"  ],
          [1800, "  [████████████████░░░░]  80%  deleting /home..", "err"  ],
          [2100, "  [████████████████████]  100% done.",            "err"  ],
          [2400, "",                                                        ],
          [2600, "just kidding. nice try though.",                  "dim"  ],
        ];
        seq.forEach(([delay, text, tone]) => {
          setTimeout(() => {
            dispatch({ type: "append", lines: [{ text, tone }] });
            queueMicrotask(scrollToBottom);
          }, delay as number);
        });
        return;
      }

      if (normalized === "hack") {
        const seq: [number, string, string?][] = [
          [0,    "initialising hack sequence...",                       "dim"    ],
          [300,  "",                                                              ],
          [500,  "  [██░░░░░░░░░░░░░░░░░░]  scanning target...",       "warn"   ],
          [900,  "  [██████░░░░░░░░░░░░░░]  bypassing firewall...",    "warn"   ],
          [1300, "  [██████████░░░░░░░░░░]  decrypting mainframe...",  "accent" ],
          [1700, "  [██████████████░░░░░░]  injecting payload...",     "accent" ],
          [2100, "  [██████████████████░░]  extracting root token...", "accent" ],
          [2500, "  [████████████████████]  done.",                    "ok"     ],
          [2800, "",                                                              ],
          [3000, "  ██████████████████████████████", "ok"],
          [3100, "  █  ACCESS GRANTED            █", "ok"],
          [3200, "  ██████████████████████████████", "ok"],
          [3400, "",                                                              ],
          [3600, "  Welcome, agent. You're in.",                        "dim"   ],
        ];
        seq.forEach(([delay, text, tone]) => {
          setTimeout(() => {
            dispatch({ type: "append", lines: [{ text, tone }] });
            queueMicrotask(scrollToBottom);
          }, delay as number);
        });
        setTimeout(() => dispatch({ type: "setHacked", on: true }), 3700);
        return;
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

  const pointerMoved = useRef(false);

  const onScreenPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement && e.target.closest("a,button,input")) return;
    pointerMoved.current = false;
  }, []);

  const onScreenPointerMove = useCallback(() => {
    pointerMoved.current = true;
  }, []);

  const onScreenPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement && e.target.closest("a,button,input")) return;
    // Only focus (and open keyboard) if the finger didn't scroll
    if (!pointerMoved.current) focusCmd();
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

  // Only apply the drag-resize height on desktop; on mobile syncViewport
  // sets the height directly on terminalRef so we must not override it here.
  const isMobileViewport = window.innerWidth <= 640;

  return (
    <div className="terminal-wrapper">
      <div
        ref={terminalRef}
        className="terminal"
        aria-label="Terminal style homepage"
        style={isMobileViewport ? undefined : { height: `${height}px` }}
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

        <div className="promptRow">
          <label htmlFor="cmd" className="sr-only">Enter a command</label>
          <div className="prompt" aria-hidden="true">
            {isMobileViewport ? (
              <span className={state.hacked ? "p-sym hacked" : "p-sym"}>$</span>
            ) : (
              <>
                <span className={state.hacked ? "p-user hacked" : "p-user"}>
                  {state.hacked ? "agent" : "guest"}
                </span>
                <span className="p-at">@</span>
                <span className="p-host">mlz</span>
                <span className="p-colon">:</span>
                <span className="p-path">~</span>
                <span className="p-sym">$</span>
              </>
            )}
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
            autoFocus={!isMobileViewport}
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

