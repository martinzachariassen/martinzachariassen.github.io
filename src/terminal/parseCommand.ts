export interface ParsedCommand {
  cmd: string;
  args: string[];
  raw: string;
}

export function normalizeInput(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function parseCommand(inputRaw: string): ParsedCommand {
  const input = inputRaw.trim();
  if (!input) return { cmd: "", args: [], raw: "" };
  const [cmd, ...args] = input.split(/\s+/);
  return { cmd: cmd.toLowerCase(), args, raw: inputRaw };
}

