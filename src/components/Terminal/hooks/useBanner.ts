import { useEffect, useRef } from "react";
import type { Dispatch } from "react";
import type { Action } from "../state/terminalReducer.js";

interface UseBannerOptions {
  dispatch: Dispatch<Action>;
  scrollToBottom: () => void;
  syncViewport: () => void;
  reducedMotion: boolean;
}

/**
 * Plays the boot sequence once on mount.
 * On mobile: shows a compact 4-line version instantly.
 * On desktop: animates the full sequence with delays.
 */
export function useBanner({
  dispatch,
  scrollToBottom,
  syncViewport,
  reducedMotion,
}: UseBannerOptions) {
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    shown.current = true;

    const now = new Date();
    const timestamp = now.toLocaleString("en-GB", {
      weekday: "short", year: "numeric", month: "short",
      day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
    });

    const isMobile = window.innerWidth <= 640;

    const sequence: [number, string, string?][] = isMobile
      ? [
          [0,   `mlz.no  ${__APP_VERSION__}`,                    "accent"],
          [0,   ""],
          [0,   `  ${timestamp}`,                                 "dim"  ],
          [0,   "  guest@mlz — welcome.",                         "ok"   ],
          [0,   ""],
          [0,   "  Type 'help' to see available commands.",        "dim"  ],
          [0,   ""],
        ]
      : [
          [0,    `mlz.no  ${__APP_VERSION__}`,               "accent"],
          [120,  ""],
          [240,  "  booting system...",                   "dim"   ],
          [520,  "  loading profile............  done",   "dim"   ],
          [820,  "  mounting filesystem............  ok", "dim"   ],
          [1020, "  starting shell.................  ok", "dim"   ],
          [1200, ""],
          [1320, `  ${timestamp}`,                        "dim"   ],
          [1420, "  guest@mlz - welcome back.",           "ok"    ],
          [1560, ""],
          [1660, "  Type 'help' to see available commands.", "dim"],
          [1760, ""],
        ];

    sequence.forEach(([delay, text, tone]) => {
      const ms = reducedMotion ? 0 : delay;
      setTimeout(() => {
        dispatch({ type: "append", lines: [{ text, tone }] });
        queueMicrotask(scrollToBottom);
      }, ms);
    });

    setTimeout(syncViewport, reducedMotion ? 0 : 2000);
  }, [dispatch, reducedMotion, scrollToBottom, syncViewport]);
}

