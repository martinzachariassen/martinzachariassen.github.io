import type { OutputLine } from "../types.js";

export const observabilityLines: OutputLine[] = [
  {
    text: "",
    parts: [
      { text: "▸ ", tone: "cyan" },
      { text: "Observability", tone: "accent" },
    ],
  },
  {
    text: "",
    parts: [
      { text: "  OpenTelemetry", tone: "ok" },
      { text: "  ·  ", tone: "dim" },
      { text: "Prometheus", tone: "ok" },
      { text: "  ·  ", tone: "dim" },
      { text: "Grafana", tone: "ok" },
      { text: "  ·  ", tone: "dim" },
      { text: "Datadog", tone: "ok" },
    ],
  },
  { text: "" },
];

export const securityLines: OutputLine[] = [
  {
    text: "",
    parts: [
      { text: "▸ ", tone: "cyan" },
      { text: "Security", tone: "accent" },
    ],
  },
  {
    text: "",
    parts: [
      { text: "  OAuth2/OIDC", tone: "ok" },
      { text: "  ·  ", tone: "dim" },
      { text: "JWT", tone: "ok" },
      { text: "  ·  ", tone: "dim" },
      { text: "Spring Security", tone: "ok" },
    ],
  },
  { text: "" },
];

export const workToolsLines: OutputLine[] = [
  {
    text: "",
    parts: [
      { text: "▸ ", tone: "cyan" },
      { text: "Work Tools", tone: "accent" },
    ],
  },
  {
    text: "",
    parts: [
      { text: "  Jira", tone: "ok" },
      { text: "  ·  ", tone: "dim" },
      { text: "Confluence", tone: "ok" },
    ],
  },
  { text: "" },
];

