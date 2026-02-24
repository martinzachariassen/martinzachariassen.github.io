import { useCallback, useRef } from "react";
import type { RefObject } from "react";

interface UseViewportOptions {
  terminalRef: RefObject<HTMLDivElement | null>;
  scrollToBottom: () => void;
}

export function useViewport({ terminalRef, scrollToBottom }: UseViewportOptions) {
  const scrollScheduled = useRef(false);

  const syncViewport = useCallback(() => {
    const vv = window.visualViewport;
    const isMobile = window.innerWidth <= 640;

    // Keyboard inset — works on both mobile and desktop
    const kbd = vv
      ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      : 0;
    document.documentElement.style.setProperty("--kbd", `${Math.round(kbd)}px`);

    if (isMobile && terminalRef.current) {
      const viewH = vv ? Math.round(vv.height) : window.innerHeight;
      // Subtract the NameHeader so the terminal doesn't push off screen
      const header = document.querySelector(".name-header");
      const headerH = header ? header.getBoundingClientRect().height : 0;
      const termH = Math.max(200, viewH - Math.round(headerH));
      terminalRef.current.style.height = `${termH}px`;
    }

    // Defer scroll until after the 120ms CSS transition on .terminal height
    if (!scrollScheduled.current) {
      scrollScheduled.current = true;
      setTimeout(() => {
        scrollScheduled.current = false;
        scrollToBottom();
      }, 130);
    }
  }, [terminalRef, scrollToBottom]);

  return { syncViewport };
}

