import type { CommandResult } from "./types.js";

export const tech = (): CommandResult => ({
  lines: [
    { text: "── Tech & Tools ──────────────────────────", tone: "section" },
    { text: "" },
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
    {
      text: "",
      parts: [
        { text: "▸ ", tone: "cyan" },
        { text: "Data & Messaging", tone: "accent" },
      ],
    },
    {
      text: "",
      parts: [
        { text: "  Kafka", tone: "ok" },
      ],
    },
    { text: "" },
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
  ],
});

