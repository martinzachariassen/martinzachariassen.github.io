import type { OutputLine } from "../types.js";

export const testingLines: OutputLine[] = [
  {
    text: "",
    parts: [
      { text: "▸ ", tone: "cyan" },
      { text: "Testing", tone: "accent" },
    ],
  },
  {
    text: "",
    parts: [
      { text: "  JUnit", tone: "ok" },
      { text: "  ·  ", tone: "dim" },
      { text: "WireMock", tone: "ok" },
      { text: "  ·  ", tone: "dim" },
      { text: "Testcontainers", tone: "ok" },
    ],
  },
  { text: "" },
];

