import "./style.css";

const EASTER = {
  enabled: true,
  missStreak: 0,
  konamiProgress: 0,
  dotsProgress: 0,
  matrixTimer: null,
  matrixRunning: false,
  matrixRaf: 0,
  matrixResizeHandler: null,
  reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false,
};

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

function hashString(s) {
  // small deterministic hash (not crypto)
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickDeterministic(list, seedStr) {
  const idx = hashString(seedStr) % list.length;
  return list[idx];
}

function normalizeInput(s) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function outInfo(s) {
  print(s, "info");
}
function outOk(s) {
  print(s, "ok");
}

function toggleClassOnBody(cls, { on } = {}) {
  const next = on ?? !document.body.classList.contains(cls);
  document.body.classList.toggle(cls, next);
  return next;
}

function startGlitch(ms = 1200) {
  if (!EASTER.enabled) return;
  if (EASTER.reducedMotion) return;
  out.classList.add("glitch");
  window.setTimeout(() => out.classList.remove("glitch"), ms);
}

function ensureMatrixCanvas() {
  let canvas = document.querySelector("#matrix");
  if (canvas) return canvas;

  canvas = document.createElement("canvas");
  canvas.id = "matrix";

  // Scope the overlay to the terminal screen only.
  const screenEl = document.querySelector("#screen");
  screenEl?.appendChild(canvas);

  return canvas;
}

function stopMatrix() {
  // Always attempt to stop/cleanup, even if flags got out of sync.
  if (EASTER.matrixTimer) {
    window.clearTimeout(EASTER.matrixTimer);
    EASTER.matrixTimer = null;
  }
  if (EASTER.matrixRaf) {
    window.cancelAnimationFrame(EASTER.matrixRaf);
    EASTER.matrixRaf = 0;
  }
  if (EASTER.matrixResizeHandler) {
    window.removeEventListener("resize", EASTER.matrixResizeHandler);
    EASTER.matrixResizeHandler = null;
  }

  EASTER.matrixRunning = false;
  document.body.classList.remove("matrix");

  const canvas = document.querySelector("#matrix");
  if (canvas) {
    const ctx = canvas.getContext?.("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function startMatrix({ durationMs = 9000 } = {}) {
  if (!EASTER.enabled) return;

  // Reset any existing run so repeated `matrix` calls don't stack.
  stopMatrix();

  if (EASTER.reducedMotion) {
    outInfo("(matrix) Reduced motion is on; printing vibes instead of animation.");
    print("01001101 01100001 01110100 01110010 01101001 01111000", "ok");
    print("Wake up, Neo.", "ok");
    return;
  }

  const canvas = ensureMatrixCanvas();
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  document.body.classList.add("matrix");
  EASTER.matrixRunning = true;

  const dpr = Math.max(1, window.devicePixelRatio || 1);

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);

    // Use CSS pixel coordinates in drawing calls.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();

  const letters = "abcdefghijklmnopqrstuvwxyz0123456789#$%&*+@";
  const fontSize = 14;
  const rect = canvas.getBoundingClientRect();
  const columns = Math.max(1, Math.floor(rect.width / fontSize));
  const drops = Array.from({ length: columns }, () => Math.random() * rect.height);

  const tick = () => {
    if (!EASTER.matrixRunning) return;

    const { width, height } = canvas.getBoundingClientRect();

    // fade previous frame
    ctx.fillStyle = "rgba(26, 27, 38, 0.20)";
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${fontSize}px JetBrains Mono, monospace`;
    ctx.fillStyle = "rgba(158, 206, 106, 0.85)";

    for (let i = 0; i < drops.length; i++) {
      const x = i * fontSize;
      const y = drops[i];
      const ch = letters[Math.floor(Math.random() * letters.length)];
      ctx.fillText(ch, x, y);

      drops[i] = y + fontSize;
      if (drops[i] > height && Math.random() > 0.975) drops[i] = 0;
    }

    EASTER.matrixRaf = window.requestAnimationFrame(tick);
  };

  tick();

  // Keep canvas in sync if viewport changes during the effect.
  EASTER.matrixResizeHandler = () => {
    if (!EASTER.matrixRunning) return;
    resize();
  };
  window.addEventListener("resize", EASTER.matrixResizeHandler, { passive: true });

  EASTER.matrixTimer = window.setTimeout(() => {
    stopMatrix();
  }, durationMs);
}

const COMMANDS = {
  help(args = []) {
    const wantsSecret = args.some((a) => a.toLowerCase() === "--secret" || a.toLowerCase() === "secret");

    const base = [
      "Available commands:",
      "  help        - show commands",
      "  about       - who I am",
      "  stack       - what I work with",
      "  projects    - highlights",
      "  contact     - how to reach me",
      "  links       - GitHub/LinkedIn/etc",
      "  clear       - clear screen",
    ];

    if (!wantsSecret) {
      base.push("", "Tip: help --secret");
      return base.join("\n");
    }

    const secret = [
      "",
      "Secret-ish stuff:",
      "  8ball <q>   - ask the terminal",
      "  matrix      - a short rain of characters",
      "  fortune     - a tiny fortune",
      "  secrets off - disable easter eggs",
      "  secrets on  - enable easter eggs",
      "",
      "Also: try the classic Konami code while focused here.",
    ];

    return base.concat(secret).join("\n");
  },

  about() {
    return [
      "Martin (mlz) — backend developer.",
      "",
      "I build reliable, observable services and batch pipelines.",
      "Bias: correctness, explicit boundaries, and boring operations.",
      "",
      "Type 'stack' or 'projects'.",
    ].join("\n");
  },

  stack() {
    return [
      "Current stack (typical):",
      "  - Java / Spring Boot",
      "  - SQL (Postgres), Flyway/Liquibase",
      "  - Messaging (Pub/Sub / queues), outbox patterns",
      "  - CI/CD, Docker",
      "  - Observability: logs/metrics/tracing",
    ].join("\n");
  },

  projects() {
    return [
      "Highlights:",
      "  - Invoice ingestion + validation + transformation pipeline",
      "  - Idempotent schedulers and reconciliation jobs",
      "  - Blob storage immutability + audit trails",
      "",
      "Ask for details: type 'projects invoice'.",
    ].join("\n");
  },

  contact() {
    return [
      "Contact:",
      "  email: you@example.com",
      "  location: Norway",
      "",
      "Replace this with your real email.",
    ].join("\n");
  },

  links() {
    return [
      "Links:",
      "  GitHub:   https://github.com/<your-handle>",
      "  LinkedIn: https://www.linkedin.com/in/<your-handle>/",
      "  Blog:     https://mlz.no (this site)",
    ].join("\n");
  },

  // Easter egg commands
  fortune() {
    const fortunes = [
      "Fortune: Your next refactor will be small and satisfying.",
      "Fortune: The bug is in the assumptions.",
      "Fortune: Green tests, calm mind.",
      "Fortune: Make state explicit; future you will smile.",
      "Fortune: Delete code. (After you write the test.)",
      "Fortune: Ship it. Then observe it.",
    ];
    // use time to keep it fresh
    return fortunes[Math.floor(Math.random() * fortunes.length)];
  },

  "8ball"(args = []) {
    const q = args.join(" ").trim();
    if (!q) return "Usage: 8ball <your question>";

    const answers = [
      "It is certain.",
      "It is decidedly so.",
      "Without a doubt.",
      "Yes — definitely.",
      "You may rely on it.",
      "As I see it, yes.",
      "Most likely.",
      "Outlook good.",
      "Yes.",
      "Signs point to yes.",
      "Reply hazy, try again.",
      "Ask again later.",
      "Better not tell you now.",
      "Cannot predict now.",
      "Concentrate and ask again.",
      "Don't count on it.",
      "My reply is no.",
      "My sources say no.",
      "Outlook not so good.",
      "Very doubtful.",
    ];

    const a = pickDeterministic(answers, `8ball:${q}`);
    return [`Q: ${q}`, `A: ${a}`].join("\n");
  },

  matrix(args = []) {
    const v = args[0]?.toLowerCase();
    if (v === "off") {
      stopMatrix();
      return "(matrix) off";
    }
    if (v === "on") {
      startMatrix();
      return "(matrix) on";
    }

    // Default: toggle
    if (EASTER.matrixRunning) {
      stopMatrix();
      return "(matrix) off";
    }
    startMatrix();
    return "(matrix) on";
  },

  secrets(args = []) {
    const v = args[0]?.toLowerCase();
    if (v !== "on" && v !== "off") return "Usage: secrets on|off";
    EASTER.enabled = v === "on";
    if (!EASTER.enabled) {
      stopMatrix();
      document.body.classList.remove("konami");
      out.classList.remove("glitch");
    }
    return EASTER.enabled ? "Easter eggs enabled." : "Easter eggs disabled.";
  },
};

function parse(inputRaw) {
  const input = inputRaw.trim();
  if (!input) return { cmd: "", args: [] };
  const [cmd, ...args] = input.split(/\s+/);
  return { cmd: cmd.toLowerCase(), args };
}

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function toHtml(text) {
  // Make URLs clickable without pulling deps
  const escaped = escapeHtml(text);
  return escaped.replace(
    /(https?:\/\/[^\s]+)/g,
    (m) => `<a href="${m}" target="_blank" rel="noreferrer noopener">${m}</a>`
  );
}

const state = {
  history: [],
  idx: 0,
};

function appTemplate() {
  return `
    <div class="terminal" aria-label="Terminal style homepage">
      <div class="titlebar">
        <div class="dots" aria-hidden="true">
          <div class="dot"></div><div class="dot"></div><div class="dot"></div>
        </div>
        <div class="title">mlz.no — terminal</div>
      </div>

      <div id="screen" class="screen" tabindex="0">
        <div id="out" class="output" role="log" aria-live="polite"></div>

        <div class="promptRow">
          <div class="prompt" aria-hidden="true">
            <span class="p-user">mlz</span><span class="p-at">@</span><span class="p-host">oslo</span><span class="p-colon">:</span><span class="p-path">~</span><span class="p-sym">$</span>
          </div>
          <input
            id="cmd"
            aria-label="Command input"
            autocomplete="off"
            spellcheck="false"
            autocapitalize="none"
            autocorrect="off"
            inputmode="text"
            enterkeyhint="send"
            autofocus
          />
        </div>

        <div class="hint">Try: <span class="accent">help</span>, <span class="accent">about</span>, <span class="accent">links</span></div>
      </div>
    </div>
  `;
}

document.querySelector("#app").innerHTML = appTemplate();

const screen = document.querySelector("#screen");
const out = document.querySelector("#out");
const cmd = document.querySelector("#cmd");

function scrollToBottom() {
  out.scrollTop = out.scrollHeight;
}

function focusCmd({ scroll = true } = {}) {
  cmd.focus({ preventScroll: !scroll });
  if (scroll) cmd.scrollIntoView({ block: "nearest" });
}

function syncViewport() {
  const vv = window.visualViewport;
  if (!vv) {
    document.documentElement.style.setProperty("--kbd", "0px");
    return;
  }

  // Approximate keyboard overlap.
  const innerH = window.innerHeight;
  const kbd = Math.max(0, innerH - vv.height - vv.offsetTop);
  document.documentElement.style.setProperty("--kbd", `${Math.round(kbd)}px`);
  scrollToBottom();
}

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", syncViewport);
  window.visualViewport.addEventListener("scroll", syncViewport);
}
window.addEventListener("orientationchange", syncViewport);

// Tap anywhere in the screen to start typing (but don't steal taps from links/buttons).
screen.addEventListener("pointerdown", (e) => {
  const t = e.target;
  if (t instanceof HTMLElement) {
    if (t.closest("a,button,input")) return;
  }
  focusCmd();
});

cmd.addEventListener("focus", () => {
  syncViewport();
  queueMicrotask(scrollToBottom);
});

function print(line, klass = "") {
  const div = document.createElement("div");
  div.className = `line ${klass}`.trim();
  div.innerHTML = toHtml(line);
  out.appendChild(div);
  scrollToBottom();
}

function banner() {
  print("Welcome.", "dim");
  print("Type 'help' to see commands.", "dim");
  print("");
  print("about  |  stack  |  projects  |  links  |  contact", "dim");
  print("");
}

function runCommand(input) {
  const { cmd: c, args } = parse(input);

  // echo the command
  print(`mlz@oslo:~$ ${escapeHtml(input)}`, "dim");

  if (c === "clear") {
    out.innerHTML = "";
    return;
  }
  if (!c) return;

  // simple "subcommand" example: projects invoice
  if (c === "projects" && args[0]?.toLowerCase() === "invoice") {
    EASTER.missStreak = 0;
    print("Invoice pipeline details:", "accent");
    print("  - Ingest XML/PDF -> immutable blob storage");
    print("  - Reconcile PDFs to invoices");
    print("  - Validate + transform to standard formats");
    print("  - Dispatch with windows/caps + receipts tracking");
    return;
  }

  const fn = COMMANDS[c];
  if (!fn) {
    EASTER.missStreak += 1;

    // Fortune-on-misses easter egg
    if (EASTER.enabled && EASTER.missStreak >= 3) {
      EASTER.missStreak = 0;
      print(`Command not found: ${c}`, "err");
      print(pickDeterministic([
        "Hint: try 'help'.",
        "Hint: 'links' is a good start.",
        "Hint: 'help --secret' (if you like surprises).",
        "Fortune: The command you seek is the one you didn't type.",
      ], `miss:${c}:${Date.now()}`), "dim");
      return;
    }

    print(`Command not found: ${c}`, "err");
    print("Type 'help' to list commands.", "dim");
    return;
  }

  EASTER.missStreak = 0;

  // Fun phrase triggers
  const normalized = normalizeInput(input);
  if (EASTER.enabled && (normalized === "sudo rm -rf /" || normalized === "rm -rf /")) {
    startGlitch();
    print("Nice try.", "warn");
  }
  if (EASTER.enabled && normalized === "make me a sandwich") {
    print("No. (But you can have a cookie.)", "em");
  }

  const result = fn(args);
  for (const line of result.split("\n")) print(line);
}

function historyPrev() {
  if (state.history.length === 0) return;
  state.idx = Math.max(0, state.idx - 1);
  cmd.value = state.history[state.idx] ?? "";
  queueMicrotask(() => cmd.setSelectionRange(cmd.value.length, cmd.value.length));
}

function historyNext() {
  if (state.history.length === 0) return;
  state.idx = Math.min(state.history.length, state.idx + 1);
  cmd.value = state.idx === state.history.length ? "" : (state.history[state.idx] ?? "");
  queueMicrotask(() => cmd.setSelectionRange(cmd.value.length, cmd.value.length));
}

// (removed touch control buttons)

cmd.addEventListener("keydown", (e) => {
  // Konami sequence (while typing in terminal)
  if (EASTER.enabled) {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const expected = KONAMI[EASTER.konamiProgress];
    if (key === expected) {
      EASTER.konamiProgress += 1;
      if (EASTER.konamiProgress === KONAMI.length) {
        EASTER.konamiProgress = 0;
        const on = toggleClassOnBody("konami");
        outOk(on ? "Konami mode: ON" : "Konami mode: OFF");
      }
    } else {
      EASTER.konamiProgress = key === KONAMI[0] ? 1 : 0;
    }
  }

  if (e.key === "Enter") {
    e.preventDefault();
    const value = cmd.value;
    if (value.trim().length) {
      state.history.push(value);
      state.idx = state.history.length;
    }
    runCommand(value);
    cmd.value = "";
    syncViewport();
    return;
  }

  // history navigation
  if (e.key === "ArrowUp") {
    e.preventDefault();
    historyPrev();
  }

  if (e.key === "ArrowDown") {
    e.preventDefault();
    historyNext();
  }
});

banner();
syncViewport();

// Titlebar dots sequence easter egg (click / keyboard).
(function wireDotsEasterEgg() {
  const dots = document.querySelector(".dots");
  if (!dots) return;

  // Convert dots into buttons for accessibility.
  dots.setAttribute("role", "group");
  dots.setAttribute("aria-label", "Window controls");

  const dotEls = Array.from(dots.querySelectorAll(".dot"));
  for (const [i, el] of dotEls.entries()) {
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("aria-label", `Dot ${i + 1}`);

    const activate = () => {
      if (!EASTER.enabled) return;
      const expected = EASTER.dotsProgress;

      // Require pressing 1, then 2, then 3.
      if (i === expected) {
        EASTER.dotsProgress += 1;
        if (EASTER.dotsProgress === 3) {
          EASTER.dotsProgress = 0;
          print("Window controls engaged...", "dim");
          print("Minimizing... just kidding.", "ok");
          startGlitch(800);
        }
      } else {
        EASTER.dotsProgress = i === 0 ? 1 : 0;
      }
    };

    el.addEventListener("click", activate);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activate();
      }
    });
  }
})();
