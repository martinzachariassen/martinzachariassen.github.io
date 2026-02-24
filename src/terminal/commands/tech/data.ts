import type { OutputLine } from "../types.js";

export const databaseLines: OutputLine[] = [
  {
    text: "",
    parts: [
      { text: "▸ ", tone: "cyan" },
      { text: "Database & Migration", tone: "accent" },
    ],
  },
  {
    text: "",
    parts: [
      { text: "  PostgreSQL", tone: "ok" },
      { text: "  ·  ", tone: "dim" },
      { text: "Flyway", tone: "ok" },
      { text: "  ·  ", tone: "dim" },
      { text: "Redis", tone: "ok" },
    ],
  },
  { text: "" },
];

export const messagingLines: OutputLine[] = [
  {
    text: "",
    parts: [
      { text: "▸ ", tone: "cyan" },
      { text: "Data & Messaging", tone: "accent" },
    ],
  },
  {
    text: "",
    parts: [{ text: "  Kafka", tone: "ok" }],
  },
  { text: "" },
];

