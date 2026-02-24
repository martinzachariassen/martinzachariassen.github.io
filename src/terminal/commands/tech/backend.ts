import type { OutputLine } from "../types.js";

export const backendLines: OutputLine[] = [
  {
    text: "",
    parts: [
      { text: "▸ ", tone: "cyan" },
      { text: "Backend & API", tone: "accent" },
    ],
  },
  {
    text: "",
    parts: [
      { text: "  Spring Boot", tone: "ok" },
      { text: "  ·  ", tone: "dim" },
      { text: "Ktor", tone: "ok" },
      { text: "  ·  ", tone: "dim" },
      { text: "OpenAPI", tone: "ok" },
    ],
  },
  {
    text: "",
    parts: [
      { text: "  Spring WebClient", tone: "ok" },
      { text: "  ·  ", tone: "dim" },
      { text: "Spring Data JPA", tone: "ok" },
      { text: "  ·  ", tone: "dim" },
      { text: "Hibernate", tone: "ok" },
    ],
  },
  {
    text: "",
    parts: [
      { text: "  SLF4J", tone: "ok" },
      { text: "  ·  ", tone: "dim" },
      { text: "Logback", tone: "ok" },
    ],
  },
  { text: "" },
];

