export type TextPart = { text: string; tone?: string };

export interface OutputLine {
  text: string;
  tone?: string;
  parts?: TextPart[];
}

export type MatrixEffect = { type: "MATRIX"; mode: "on" | "off" | "toggle" };
export type EasterEffect = { type: "EASTER"; enabled: boolean };
export type CommandEffect = MatrixEffect | EasterEffect;

export interface CommandResult {
  lines: OutputLine[];
  effects?: CommandEffect[];
}

export type CommandHandler = (args: string[]) => CommandResult;

