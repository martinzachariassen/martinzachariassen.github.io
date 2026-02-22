export function normalizeInput(s) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function parseCommand(inputRaw) {
  const input = inputRaw.trim();
  if (!input) return { cmd: "", args: [], raw: "" };
  const [cmd, ...args] = input.split(/\s+/);
  return { cmd: cmd.toLowerCase(), args, raw: inputRaw };
}

