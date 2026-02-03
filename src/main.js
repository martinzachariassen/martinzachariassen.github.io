import "./style.css";

const COMMANDS = {
  help() {
    return [
      "Available commands:",
      "  help        - show commands",
      "  about       - who I am",
      "  stack       - what I work with",
      "  projects    - highlights",
      "  contact     - how to reach me",
      "  links       - GitHub/LinkedIn/etc",
      "  clear       - clear screen",
    ].join("\n");
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
    '<a href="$1" target="_blank" rel="noreferrer noopener">$1</a>'
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
    print("Invoice pipeline details:", "accent");
    print("  - Ingest XML/PDF -> immutable blob storage");
    print("  - Reconcile PDFs to invoices");
    print("  - Validate + transform to standard formats");
    print("  - Dispatch with windows/caps + receipts tracking");
    return;
  }

  const fn = COMMANDS[c];
  if (!fn) {
    print(`Command not found: ${c}`, "err");
    print("Type 'help' to list commands.", "dim");
    return;
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
