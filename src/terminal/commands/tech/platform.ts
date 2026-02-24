import type { OutputLine } from "../types.js";

export const platformLines: OutputLine[] = [
  {
    text: "",
    parts: [
      { text: "▸ ", tone: "cyan" },
      { text: "Platform & Delivery", tone: "accent" },
    ],
  },
  {
    text: "",
    parts: [
      { text: "  Docker", tone: "ok" },
      { text: "  ·  ", tone: "dim" },
      { text: "Kubernetes", tone: "ok" },
      { text: "  ·  ", tone: "dim" },
      { text: "GitHub Actions", tone: "ok" },
      { text: "  ·  ", tone: "dim" },
      { text: "Helm", tone: "ok" },
    ],
  },
  { text: "" },
];

