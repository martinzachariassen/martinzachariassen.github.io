import { useCallback, useEffect, useRef, useState } from "react";

const MIN_HEIGHT_PX = 400; // never shrink below this
const MAX_HEIGHT_VH = 92;  // never exceed 92vh

export function useResize(defaultHeight: number) {
  const [height, setHeight] = useState<number>(defaultHeight);
  const dragging = useRef(false);
  const startY = useRef(0);
  const startH = useRef(0);

  const isMobile = useCallback(
    () => window.matchMedia("(max-width: 640px)").matches,
    []
  );

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
      const maxH = (window.innerHeight * MAX_HEIGHT_VH) / 100;
      const next = Math.min(maxH, Math.max(MIN_HEIGHT_PX, startH.current + delta));
      setHeight(next);
    };

    const onMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
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

