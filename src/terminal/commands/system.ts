import type { CommandResult } from "./types.js";

export const whoami = (): CommandResult => ({
  lines: [
    {
      text: "",
      parts: [
        { text: "guest", tone: "accent" },
        { text: " - but you already knew that.", tone: "dim" },
      ],
    },
    { text: "The real question is: who am I?", tone: "dim" },
    { text: "" },
    { text: "Try 'about' to find out.", tone: "dim" },
  ],
});

export const ls = (args: string[] = []): CommandResult => {
  const detailed = args.some((a) => a.includes("l"));

  if (detailed) {
    return {
      lines: [
        { text: "── ~/ ────────────────────────────────────", tone: "section" },
        { text: "" },
        { text: "drwxr-xr-x  guest  staff   about/",      tone: "indent" },
        { text: "drwxr-xr-x  guest  staff   focus/",      tone: "indent" },
        { text: "drwxr-xr-x  guest  staff   tech/",       tone: "indent" },
        { text: "drwxr-xr-x  guest  staff   experience/", tone: "indent" },
        { text: "drwxr-xr-x  guest  staff   contact/",    tone: "indent" },
        { text: "drwxr-xr-x  guest  staff   links/",      tone: "indent" },
        { text: "drwx------  guest  staff   secrets/",    tone: "indent warn" },
        { text: "" },
        { text: "(hint: they're commands, not folders)", tone: "indent dim" },
      ],
    };
  }

  return {
    lines: [
      { text: "── ~/", tone: "section" },
      { text: "" },
      { text: "about/       focus/        tech/",   tone: "indent" },
      { text: "experience/  contact/      links/",  tone: "indent" },
      { text: "secrets/",                           tone: "indent" },
      { text: "" },
      { text: "(hint: they're commands, not folders)", tone: "indent dim" },
    ],
  };
};

export const pwd = (): CommandResult => ({
  lines: [{ text: "/home/guest/somewhere-on-the-internet/mlz.no", tone: "ok" }],
});

export const echo = (args: string[] = []): CommandResult => {
  const text = args.join(" ").trim();
  if (!text) return { lines: [{ text: "" }] };
  return { lines: [{ text }] };
};

export const sudo = (args: string[] = []): CommandResult => {
  const cmd = args.join(" ");
  if (cmd.toLowerCase().includes("make me a sandwich")) {
    return { lines: [{ text: "Okay.", tone: "ok" }] };
  }
  return {
    lines: [
      { text: "Permission denied.", tone: "err" },
      { text: "This incident will be reported.", tone: "dim" },
    ],
  };
};

