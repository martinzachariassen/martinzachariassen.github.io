import { normalizeInput } from "./parseCommand.js";

export interface OutputLine {
  text: string;
  tone?: string;
  parts?: { text: string; tone?: string }[];
}

// Side-effects that commands can request from the UI layer
export type MatrixEffect = { type: "MATRIX"; mode: "on" | "off" | "toggle" };
export type EasterEffect = { type: "EASTER"; enabled: boolean };
export type CommandEffect = MatrixEffect | EasterEffect;

export interface CommandResult {
  lines: OutputLine[];
  effects?: CommandEffect[];
}

type CommandHandler = (args: string[]) => CommandResult;

function linesFromStrings(arr: string[], tone?: string): OutputLine[] {
  return arr.map((text) => ({ text, tone }));
}

export interface CommandRegistry {
  has(cmd: string): boolean;
  run(cmd: string, args: string[]): CommandResult;
  normalizeInput(s: string): string;
}

export function createCommandRegistry(): CommandRegistry {
  const handlers = new Map<string, CommandHandler>();

  handlers.set("help", (args: string[] = []) => {
    const wantsSecret = args.some(
      (a) => a.toLowerCase() === "--secret" || a.toLowerCase() === "secret"
    );

    const base = [
      "Available commands:",
      "  help        - show this list",
      "  whoami      - who is this?",
      "  about       - who I am",
      "  skills      - areas of focus & interests",
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
      "  secrets off - disable easter eggs",
      "  secrets on  - enable easter eggs",
      "",
      "Also: try the classic Konami code while focused here.",
    ];

    return { lines: linesFromStrings(base.concat(secret)) };
  });

  handlers.set("whoami", () => ({
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
  }));

  handlers.set("ls", () => ({
    lines: [
      { text: "── ~/", tone: "section" },
      { text: "" },
      { text: "about/       skills/       experience/", tone: "indent" },
      { text: "contact/     links/        secrets/", tone: "indent" },
      { text: "" },
      { text: "(hint: they're commands, not folders)", tone: "indent dim" },
    ],
  }));

  handlers.set("pwd", () => ({
    lines: [
      { text: "/home/guest/somewhere-on-the-internet/mlz.no", tone: "ok" },
    ],
  }));

  handlers.set("about", () => ({
    lines: [
      { text: "── About ─────────────────────────────────", tone: "section" },
      { text: "" },
      { text: "Back-end developer, 9 years of experience." },
      { text: "Architecture, integrations, production services." },
      { text: " ", tone: "br" },
      { text: "I build and maintain APIs and event-/" },
      { text: "queue-based workflows — stream and batch." },
      { text: "Robust contracts, idempotency, traceability." },
      { text: " ", tone: "br" },
      { text: "End-to-end ownership from design to prod." },
      { text: "CI/CD, Kubernetes, micro-services in prod," },
      { text: "with focus on operability & observability." },
      { text: " ", tone: "br" },
      { text: "Agile teams, clear communication," },
      { text: "continuous learning, shared goals." },
      { text: "" },
      { text: "→ Type 'skills' to see focus areas.", tone: "dim" },
    ],
  }));

  handlers.set("skills", () => ({
    lines: [
      { text: "── Skills & Interests ────────────────────", tone: "section" },
      { text: "" },
      { text: "Observability / SRE", tone: "accent indent" },
      { text: "Metrics, tracing, alerts, SLI/SLO.", tone: "indent" },
      { text: "" },
      { text: "Performance & Scaling", tone: "accent indent" },
      { text: "Profiling, load tests, caching,", tone: "indent" },
      { text: "indexing, queue/batch strategies.", tone: "indent" },
      { text: "" },
      { text: "Event-Driven Integration", tone: "accent indent" },
      { text: "Robust contracts, idempotency,", tone: "indent" },
      { text: "retries, DLQ, traceability.", tone: "indent" },
      { text: "" },
      { text: "Data Modelling & System Design", tone: "accent indent" },
      { text: "Clear concepts, clean interfaces,", tone: "indent" },
      { text: "stable API contracts.", tone: "indent" },
      { text: "" },
      { text: "Automation / Dev Productivity", tone: "accent indent" },
      { text: "Build, test, deploy automation.", tone: "indent" },
      { text: "Tools and scripts to reduce friction.", tone: "indent" },
      { text: "" },
    ],
  }));

  handlers.set("experience", () => ({
    lines: [
      { text: "── Experience ────────────────────────────", tone: "section" },
      { text: "" },
      { text: "Back-End Developer", tone: "accent indent" },
      { text: "Storebrand · 05/2025–Present · Oslo", tone: "indent" },
      { text: "" },
      { text: "─────────────────────────────────────────", tone: "section" },
      { text: "" },
      { text: "Back-End Developer", tone: "accent indent" },
      { text: "BLDNG.ai AS · 04/2021–05/2025 · Oslo", tone: "indent" },
      { text: "fmr. Telenor Smarte Bygg", tone: "indent dim" },
      { text: "" },
      { text: "─────────────────────────────────────────", tone: "section" },
      { text: "" },
      { text: "Full Stack Developer", tone: "accent indent" },
      { text: "Telenor · 01/2021–04/2021 · Oslo", tone: "indent" },
      { text: "" },
      { text: "─────────────────────────────────────────", tone: "section" },
      { text: "" },
      { text: "Consultant – Full Stack Developer", tone: "accent indent" },
      { text: "Netlight · 03/2019–12/2020 · Oslo", tone: "indent" },
      { text: "" },
      { text: "─────────────────────────────────────────", tone: "section" },
      { text: "" },
      { text: "Full Stack Developer", tone: "accent indent" },
      { text: "Schjærven · 11/2017–02/2019 · Oslo", tone: "indent" },
      { text: "" },
      { text: "─────────────────────────────────────────", tone: "section" },
      { text: "" },
      { text: "Full Stack Developer", tone: "accent indent" },
      { text: "M7Dev · 12/2016–11/2017 · Bergen", tone: "indent" },
      { text: "" },
      { text: "→ 9 yrs · Type 'skills' for focus areas.", tone: "dim" },
    ],
  }));

  handlers.set("contact", () => ({
    lines: [
      { text: "── Contact ───────────────────────────────", tone: "section" },
      { text: "" },
      { text: "Email     zachariassen@hey.com", tone: "indent" },
      { text: "Location  Norway", tone: "indent" },
      { text: "" },
    ],
  }));

  handlers.set("links", () => ({
    lines: [
      { text: "── Links ─────────────────────────────────", tone: "section" },
      { text: "" },
      { text: "GitHub    → https://github.com/martinzachariassen", tone: "indent" },
      { text: "LinkedIn  → https://www.linkedin.com/in/martinzachariassen", tone: "indent" },
      { text: "Homepage  → https://mlz.no", tone: "indent" },
      { text: "" },
      { text: "(links are clickable)", tone: "indent dim" },
      { text: "" },
    ],
  }));

  handlers.set("open", (args: string[] = []) => {
    const target = args[0]?.toLowerCase();
    const targets: Record<string, { url: string; label: string }> = {
      github:   { url: "https://github.com/martinzachariassen",                  label: "GitHub" },
      linkedin: { url: "https://www.linkedin.com/in/martinzachariassen",         label: "LinkedIn" },
      homepage: { url: "https://mlz.no",                                          label: "mlz.no" },
    };

    if (!target || !targets[target]) {
      return {
        lines: [
          { text: "Usage: open <target>", tone: "warn" },
          { text: "" },
          { text: "  Targets:  github  ·  linkedin  ·  homepage", tone: "dim" },
        ],
      };
    }

    const { url, label } = targets[target];
    window.open(url, "_blank", "noopener,noreferrer");
    return {
      lines: [
        { text: `Opening ${label}...`, tone: "ok" },
        { text: url, tone: "dim" },
      ],
    };
  });

  handlers.set("echo", (args: string[] = []) => {
    const text = args.join(" ").trim();
    if (!text) return { lines: [{ text: "" }] };
    return { lines: [{ text }] };
  });

  handlers.set("matrix", (args: string[] = []) => {
    const v = args[0]?.toLowerCase();
    if (v === "off")
      return { lines: [{ text: "(matrix) off" }], effects: [{ type: "MATRIX" as const, mode: "off" as const }] };
    if (v === "on")
      return { lines: [{ text: "(matrix) on" }], effects: [{ type: "MATRIX" as const, mode: "on" as const }] };
    return {
      lines: [{ text: "(matrix) toggled" }],
      effects: [{ type: "MATRIX" as const, mode: "toggle" as const }],
    };
  });

  handlers.set("secrets", (args: string[] = []) => {
    const v = args[0]?.toLowerCase();
    if (v !== "on" && v !== "off") return { lines: [{ text: "Usage: secrets on|off" }] };
    return {
      lines: [{ text: v === "on" ? "Easter eggs enabled." : "Easter eggs disabled." }],
      effects: [{ type: "EASTER" as const, enabled: v === "on" }],
    };
  });

  return {
    has(cmd: string): boolean {
      return handlers.has(cmd);
    },
    run(cmd: string, args: string[]): CommandResult {
      const h = handlers.get(cmd);
      if (!h) return { lines: [] };
      return h(args);
    },
    normalizeInput,
  };
}
