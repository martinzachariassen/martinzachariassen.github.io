import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_HEIGHT_VH = 75; // initial fill — 75% of viewport height
const MIN_HEIGHT_VH     = 40; // never shrink below 40vh when dragging
const MAX_HEIGHT_VH     = 92; // never exceed 92vh

const STORAGE_KEY = "terminal-height";

function calcDefault() {
  return Math.round((window.innerHeight * DEFAULT_HEIGHT_VH) / 100);
}

function calcMin() {
  return Math.round((window.innerHeight * MIN_HEIGHT_VH) / 100);
}

function readStored(): number | null {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY);
    return v ? Number(v) : null;
  } catch { return null; }
}

function writeStored(h: number) {
  try { sessionStorage.setItem(STORAGE_KEY, String(h)); } catch { /* ignore */ }
}

export function useResize(_defaultHeight?: number) {
  const [height, setHeight] = useState<number>(() => readStored() ?? calcDefault());
  const dragging = useRef(false);
  const startY = useRef(0);
  const startH = useRef(0);

  const isMobile = useCallback(
    () => window.matchMedia("(max-width: 640px)").matches,
    []
  );

  // Re-fit when the window is resized (e.g. browser zoom, new window size)
  // but only if the user hasn't manually set a height this session
  useEffect(() => {
    const onResize = () => {
      if (!dragging.current && !isMobile() && !readStored()) {
        setHeight(calcDefault());
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isMobile]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile()) return;
      e.preventDefault();
      dragging.current = true;
      startY.current = e.clientY;
      startH.current = height;
      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";
    },
    [height, isMobile]
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const delta = e.clientY - startY.current;
      const maxH = Math.round((window.innerHeight * MAX_HEIGHT_VH) / 100);
      const next = Math.min(maxH, Math.max(calcMin(), startH.current + delta));
      setHeight(next);
    };

    const onMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      // Persist so height survives navigation within the session
      setHeight((h) => { writeStored(h); return h; });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return { height, onMouseDown };
}
