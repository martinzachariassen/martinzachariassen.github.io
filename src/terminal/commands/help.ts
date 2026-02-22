import type { CommandHandler } from "./types.js";

export function linesFromStrings(arr: string[], tone?: string) {
  return arr.map((text) => ({ text, tone }));
}

export const helpHandler = (): CommandHandler =>
  (args: string[] = []) => {
    const wantsSecret = args.some(
      (a) => a.toLowerCase() === "--secret" || a.toLowerCase() === "secret"
    );

    const base = [
      "Available commands:",
      "  help        - show this list",
      "  whoami      - who is this?",
      "  about       - who I am",
      "  focus       - professional focus areas",
      "  tech        - tools & technologies",
      "  experience  - work history",
      "  contact     - how to reach me",
      "  links       - GitHub / LinkedIn / etc",
      "  open        - open a link  (e.g. open github)",
      "  clear       - clear the screen",
    ];

    if (!wantsSecret) {
      base.push("", "Tip: try  help --secret");
      return { lines: linesFromStrings(base) };
    }

    const secret = [
      "",
      "Secret-ish stuff:",
      "  matrix      - a short rain of characters",
      "  hack        - i'm in",
      "  coffee      - essential dependency",
      "  sudo        - nice try",
      "  rm -rf /    - please don't",
      "  secrets off - disable easter eggs",
      "  secrets on  - enable easter eggs",
      "",
      "Also: try the classic Konami code while focused here.",
    ];

    return { lines: linesFromStrings(base.concat(secret)) };
  };


