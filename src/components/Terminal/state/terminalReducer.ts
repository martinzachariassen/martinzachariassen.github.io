import type { OutputLine } from "../../../terminal/commands.js";

// ── Types ──────────────────────────────────────────────────────────────────

export interface TerminalLine extends OutputLine {
  id: string;
  parts?: { text: string; tone?: string }[];
}

export interface TerminalState {
  lines: TerminalLine[];
  easterEnabled: boolean;
  glitch: boolean;
  matrixRunning: boolean;
  hacked: boolean;
}

export type Action =
  | { type: "append"; lines: OutputLine[] }
  | { type: "clear" }
  | { type: "setEasterEnabled"; enabled: boolean }
  | { type: "setGlitch"; on: boolean }
  | { type: "setMatrixRunning"; running: boolean }
  | { type: "setHacked"; on: boolean };

// ── Helpers ────────────────────────────────────────────────────────────────

export function uid(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// ── Reducer ────────────────────────────────────────────────────────────────

export function terminalReducer(state: TerminalState, action: Action): TerminalState {
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

export const INITIAL_STATE: TerminalState = {
  lines: [],
  easterEnabled: true,
  glitch: false,
  matrixRunning: false,
  hacked: false,
};


