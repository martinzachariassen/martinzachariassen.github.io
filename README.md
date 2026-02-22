# mlz.no

> Personal portfolio site - built as an interactive terminal.

Live at **[mlz.no](https://mlz.no)**

---

## About

A terminal-style personal homepage for Martin Zachariassen. Instead of a traditional portfolio layout, everything is navigated through typed commands - `about`, `experience`, `skills`, `links`, and more.

Built with React, TypeScript and Vite. Styled with a [Tokyo Night](https://github.com/enkia/tokyo-night-vscode-theme) colour palette.

---

## Getting started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type-check
npm run typecheck

# Production build
npm run build
```

---

## Commands

Type `help` in the terminal to see all available commands.

| Command | Description |
|---|---|
| `help` | Show available commands (`help --secret` for more) |
| `about` | Who I am |
| `skills` | Areas of focus & interests |
| `experience` | Work history |
| `contact` | How to reach me |
| `links` | GitHub, LinkedIn, homepage |
| `open <target>` | Open a link — `github`, `linkedin`, `homepage` |
| `whoami` | Who is this? |
| `ls` / `ls -la` | List "files" |
| `pwd` | Print working directory |
| `clear` | Clear the screen |
| `matrix` | 👀 |

---

## Project structure

```
src/
├── App.tsx
├── main.tsx
├── vite-env.d.ts
├── components/
│   └── Terminal/
│       ├── Terminal.tsx       # Main terminal component + command runner
│       ├── Terminal.css
│       ├── OutputLine.tsx     # Renders a single output line
│       ├── OutputLine.css
│       └── useResize.ts       # Drag-to-resize hook (desktop only)
├── easter/
│   ├── MatrixOverlay.tsx      # Matrix rain canvas effect
│   ├── MatrixOverlay.css
│   └── useKonami.ts           # Konami code listener
├── styles/
│   └── global.css             # Design tokens, reset, global styles
└── terminal/
    ├── commands.ts            # Command registry & all command handlers
    ├── parseCommand.ts        # Input parser
    └── text.ts                # Linkify utility

public/
├── favicon.ico / favicon*.png # All favicon sizes
├── apple-touch-icon.png
├── icon-192.png / icon-512.png
├── site.webmanifest
├── robots.txt
├── sitemap.xml
└── .nojekyll

scripts/
└── generate-favicons.mjs      # Generates all favicon sizes from favicon.png
```

---

## Tech stack

| | |
|---|---|
| **Framework** | [React 19](https://react.dev) |
| **Language** | TypeScript |
| **Build tool** | [Vite 7](https://vitejs.dev) |
| **Styling** | Plain CSS with design tokens (no framework) |
| **Font** | [JetBrains Mono](https://www.jetbrains.com/lp/mono/) via Google Fonts |
| **Hosting** | GitHub Pages |
| **Analytics** | [Umami](https://umami.is) (cookieless, GDPR-compliant) |

---

## Deployment

Deployments are triggered by publishing a GitHub Release. The workflow:

1. Checks out `main`
2. Sets `VITE_APP_VERSION` from the release tag
3. Fetches the latest Umami analytics script
4. Builds with Vite
5. Deploys to GitHub Pages via `actions/deploy-pages`

Manual deploys are also possible from the **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**.

```
git tag v1.0.0
# Then: GitHub → Releases → Draft new release → select tag → Publish
```

---

## Favicons

All favicon sizes are generated from `public/favicon.png`:

```bash
npm run generate-favicons
```

Re-run this whenever `favicon.png` is updated.

---

## Accessibility & performance

- WCAG AA colour contrast throughout
- Skip-to-content link for keyboard users
- `role="log"` + `aria-live="polite"` on terminal output
- All interactive elements have descriptive `aria-label`
- `:focus-visible` styles for keyboard navigation
- Non-blocking font loading (`media="print"` swap)
- Vendor chunk splitting for better cache utilisation
- Self-hosted Umami script (no third-party DNS lookup)
- `color-scheme: dark` to prevent flash of white on load

---

## License

[MIT](./LICENSE) © 2026 Martin Zachariassen

