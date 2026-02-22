import { normalizeInput } from "./parseCommand.js";

export interface OutputLine {
  text: string;
  tone?: string;
  parts?: { text: string; tone?: string }[];
}

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

  handlers.set("ls", (args: string[] = []) => {
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
        { text: "about/       focus/        tech/",       tone: "indent" },
        { text: "experience/  contact/      links/",      tone: "indent" },
        { text: "secrets/",                               tone: "indent" },
        { text: "" },
        { text: "(hint: they're commands, not folders)", tone: "indent dim" },
      ],
    };
  });

  handlers.set("pwd", () => ({
    lines: [{ text: "/home/guest/somewhere-on-the-internet/mlz.no", tone: "ok" }],
  }));

  handlers.set("about", () => ({
    lines: [
      { text: "── About ─────────────────────────────────", tone: "section" },
      { text: "" },
      { text: "Back-end developer  ·  9 years of experience", tone: "accent" },
      { text: "" },
      {
        text: "",
        parts: [
          { text: "▸ ", tone: "cyan" },
          { text: "What I do", tone: "accent" },
        ],
      },
      { text: "  Architecture, integrations, and production", tone: "indent" },
      { text: "  services with high stability requirements.", tone: "indent" },
      { text: "" },
      {
        text: "",
        parts: [
          { text: "▸ ", tone: "cyan" },
          { text: "How I work", tone: "accent" },
        ],
      },
      { text: "  APIs and integrations — event-driven and", tone: "indent" },
      { text: "  scheduled batch jobs. Versioned contracts,", tone: "indent" },
      { text: "  predictable error handling, traceability.", tone: "indent" },
      { text: "" },
      {
        text: "",
        parts: [
          { text: "▸ ", tone: "cyan" },
          { text: "End-to-end ownership", tone: "accent" },
        ],
      },
      { text: "  Design → scoping → implementation →", tone: "indent" },
      { text: "  rollout → ops. Micro-services in prod", tone: "indent" },
      { text: "  with logging, metrics, and alerting.", tone: "indent" },
      { text: "" },
      {
        text: "",
        parts: [
          { text: "▸ ", tone: "cyan" },
          { text: "Teams", tone: "accent" },
        ],
      },
      { text: "  Agile, clear communication,", tone: "indent" },
      { text: "  continuous learning, shared goals.", tone: "indent" },
      { text: "" },
      { text: "→ Type 'focus' to see focus areas.", tone: "dim" },
    ],
  }));

  handlers.set("focus", () => ({
    lines: [
      { text: "── Areas of Focus ────────────────────────", tone: "section" },
      { text: "" },
      {
        text: "",
        parts: [
          { text: "▸ ", tone: "cyan" },
          { text: "Observability / SRE", tone: "accent" },
        ],
      },
      { text: "  Monitoring and alerting for stable ops and", tone: "indent" },
      { text: "  fast debugging. Working systematically", tone: "indent" },
      { text: "  towards SLIs and SLOs over time.", tone: "indent" },
      { text: "" },
      {
        text: "",
        parts: [
          { text: "▸ ", tone: "cyan" },
          { text: "Performance & Scaling", tone: "accent" },
        ],
      },
      { text: "  Measuring and improving performance by", tone: "indent" },
      { text: "  finding and removing bottlenecks in APIs,", tone: "indent" },
      { text: "  databases, and integrations.", tone: "indent" },
      { text: "" },
      {
        text: "",
        parts: [
          { text: "▸ ", tone: "cyan" },
          { text: "Event-Driven Integration & Contracts", tone: "accent" },
        ],
      },
      { text: "  Stable, versioned interfaces — tolerant of", tone: "indent" },
      { text: "  failures and retries without double-processing,", tone: "indent" },
      { text: "  and fully traceable in production.", tone: "indent" },
      { text: "" },
      {
        text: "",
        parts: [
          { text: "▸ ", tone: "cyan" },
          { text: "Automation / Developer Workflow", tone: "accent" },
        ],
      },
      { text: "  Automating build, test, and deploy.", tone: "indent" },
      { text: "  Standardising workflows to cut manual steps.", tone: "indent" },
      { text: "" },
    ],
  }));

  handlers.set("tech", () => ({
    lines: [
      { text: "── Tech & Tools ──────────────────────────", tone: "section" },
      { text: "" },
      {
        text: "",
        parts: [
          { text: "▸ ", tone: "cyan" },
          { text: "Backend & Build", tone: "accent" },
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
          { text: "  ·  ", tone: "dim" },
          { text: "Maven", tone: "ok" },
        ],
      },
      { text: "" },
      {
        text: "",
        parts: [
          { text: "▸ ", tone: "cyan" },
          { text: "Database", tone: "accent" },
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
          { text: "  Datadog", tone: "ok" },
          { text: "  ·  ", tone: "dim" },
          { text: "Grafana", tone: "ok" },
          { text: "  ·  ", tone: "dim" },
          { text: "Prometheus", tone: "ok" },
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
          { text: "Tooling", tone: "accent" },
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
      { text: "→ 9 yrs · Type 'focus' for focus areas.", tone: "dim" },
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

  handlers.set("open", (args: string[] = []) => {
    const target = args[0]?.toLowerCase();
    const targets: Record<string, { url: string; label: string }> = {
      github:   { url: "https://github.com/martinzachariassen",              label: "GitHub"   },
      linkedin: { url: "https://www.linkedin.com/in/martinzachariassen",    label: "LinkedIn" },
      homepage: { url: "https://mlz.no",                                     label: "mlz.no"  },
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

  handlers.set("sudo", (args: string[] = []) => {
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
  });

  handlers.set("coffee", () => ({
    lines: [
      { text: "      ( (",     tone: "warn"   },
      { text: "       ) )",    tone: "warn"   },
      { text: "    .______.",  tone: "accent" },
      { text: "    |      |]", tone: "accent" },
      { text: "    \\      /", tone: "accent" },
      { text: "     `----'",   tone: "accent" },
      { text: "" },
      { text: "  Essential dependency installed.", tone: "ok"  },
      { text: "  Productivity += 100.",            tone: "dim" },
    ],
  }));

  // rm and hack are intercepted with staggered animations in Terminal.tsx
  // when easter eggs are enabled. These are fallbacks for when they are off.
  handlers.set("rm", (args: string[] = []) => ({
    lines: [{ text: `rm: ${args.join(" ") || "missing operand"}`, tone: "err" }],
  }));

  handlers.set("hack", () => ({
    lines: [{ text: "hack: permission denied.", tone: "err" }],
  }));

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
