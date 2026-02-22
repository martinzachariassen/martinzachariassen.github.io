# mlz-homepage

Terminal-style personal homepage.

## Dev

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

## Structure

- `src/App.jsx` – app shell
- `src/components/Terminal/Terminal.jsx` – terminal UI + state (history, output, effects)
- `src/terminal/commands.js` – command registry (UI-agnostic)
- `src/easter/*` – easter eggs (Konami + Matrix overlay)

## Notes

- Commands are rendered as plain text; URLs become clickable links.
- Matrix/Konami/Dots effects can be disabled with `secrets off`.

