import { useEffect } from "react";
import type { RefObject } from "react";

interface UseViewportEventsOptions {
  terminalRef: RefObject<HTMLDivElement | null>;
  syncViewport: () => void;
}

/**
 * Registers visualViewport resize/scroll and orientationchange listeners.
 * Runs syncViewport once on mount to set the initial height correctly.
 */
export function useViewportEvents({ terminalRef, syncViewport }: UseViewportEventsOptions) {
  useEffect(() => {
    const vv = window.visualViewport;

    const onOrientationChange = () => {
      // Snap to full window height immediately so the CSS transition
      // starts from the right place after rotation.
      if (terminalRef.current && window.innerWidth <= 640) {
        terminalRef.current.style.height = `${window.innerHeight}px`;
      }
      setTimeout(syncViewport, 100);
    };

    if (vv) {
      vv.addEventListener("resize", syncViewport);
      vv.addEventListener("scroll", syncViewport);
    }
    window.addEventListener("orientationchange", onOrientationChange);

    // Set initial height
    syncViewport();

    return () => {
      if (vv) {
        vv.removeEventListener("resize", syncViewport);
        vv.removeEventListener("scroll", syncViewport);
      }
      window.removeEventListener("orientationchange", onOrientationChange);
    };
  }, [terminalRef, syncViewport]);
}

