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

    if (isMobile && terminalRef.current) {
      const h = vv ? Math.round(vv.height) : window.innerHeight;
      terminalRef.current.style.height = `${h}px`;
    } else if (!isMobile) {
      const kbd = vv
        ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
        : 0;
      document.documentElement.style.setProperty("--kbd", `${Math.round(kbd)}px`);
    }

    // Defer scroll until after the 120ms CSS transition on .terminal height
    // so we don't scroll to a stale position mid-animation.
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

