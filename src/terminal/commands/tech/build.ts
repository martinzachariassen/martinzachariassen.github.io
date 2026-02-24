import type { OutputLine } from "../types.js";

export const buildLines: OutputLine[] = [
  {
    text: "",
    parts: [
      { text: "▸ ", tone: "cyan" },
      { text: "Build & Quality", tone: "accent" },
    ],
  },
  {
    text: "",
    parts: [
      { text: "  Maven", tone: "ok" },
      { text: "  ·  ", tone: "dim" },
      { text: "SonarQube", tone: "ok" },
    ],
  },
  { text: "" },
];

