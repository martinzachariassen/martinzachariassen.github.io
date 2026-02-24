import { useCallback, useRef, useState } from "react";
import type { Dispatch, RefObject } from "react";
import { parseCommand } from "../../../terminal/parseCommand.js";
import type { CommandEffect, CommandRegistry, CommandResult } from "../../../terminal/commands.js";
import type { Action, TerminalState } from "../state/terminalReducer.js";

interface UseCommandRunnerOptions {
  state: TerminalState;
  dispatch: Dispatch<Action>;
  registry: CommandRegistry;
  inputRef: RefObject<HTMLInputElement | null>;
  scrollToBottom: () => void;
  syncViewport: () => void;
  applyEffects: (effects: CommandEffect[]) => void;
  startGlitch: (ms?: number) => void;
}

export function useCommandRunner({
  state,
  dispatch,
  registry,
  inputRef,
  scrollToBottom,
  syncViewport,
  applyEffects,
  startGlitch,
}: UseCommandRunnerOptions) {
  const [inputValue, setInputValue] = useState("");
  const historyRef = useRef<{ list: string[]; idx: number }>({ list: [], idx: 0 });
  const pointerMoved = useRef(false);

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
          [3600, "  Welcome, agent. You're in.",                       "dim"    ],
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
  }, [applyEffects, dispatch, registry, scrollToBottom, state.easterEnabled, state.hacked]);

  // ── Submit & history ─────────────────────────────────────────────────────

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
  }, [inputRef]);

  const historyNext = useCallback(() => {
    const h = historyRef.current;
    if (!h.list.length) return;
    h.idx = Math.min(h.list.length, h.idx + 1);
    setInputValue(h.idx === h.list.length ? "" : (h.list[h.idx] ?? ""));
    queueMicrotask(() => {
      const el = inputRef.current;
      if (el) el.setSelectionRange(el.value.length, el.value.length);
    });
  }, [inputRef]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter")     { e.preventDefault(); onSubmit();    return; }
    if (e.key === "ArrowUp")   { e.preventDefault(); historyPrev(); }
    if (e.key === "ArrowDown") { e.preventDefault(); historyNext(); }
  }, [historyNext, historyPrev, onSubmit]);

  // ── Pointer / focus ──────────────────────────────────────────────────────

  const focusCmd = useCallback(({ scroll = true } = {}) => {
    const input = inputRef.current;
    if (!input) return;
    input.focus({ preventScroll: !scroll });
    if (scroll) input.scrollIntoView({ block: "nearest" });
  }, [inputRef]);

  const onScreenPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement && e.target.closest("a,button,input")) return;
    pointerMoved.current = false;
  }, []);

  const onScreenPointerMove = useCallback(() => {
    pointerMoved.current = true;
  }, []);

  const onScreenPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement && e.target.closest("a,button,input")) return;
    if (!pointerMoved.current) focusCmd();
  }, [focusCmd]);

  // ── Dot easter egg ───────────────────────────────────────────────────────

  const dotsProgressRef = useRef(0);

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
  }, [dispatch, startGlitch, state.easterEnabled]);

  return {
    inputValue,
    setInputValue,
    onSubmit,
    onKeyDown,
    focusCmd,
    onScreenPointerDown,
    onScreenPointerMove,
    onScreenPointerUp,
    onDotActivate,
  };
}

