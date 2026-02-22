import { useEffect, useRef, useState } from "react";

const KONAMI: string[] = [
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

interface UseKonamiOptions {
  enabled: boolean;
  onToggle?: (active: boolean) => void;
}

interface UseKonamiResult {
  active: boolean;
}

export function useKonami({ enabled, onToggle }: UseKonamiOptions): UseKonamiResult {
  const progressRef = useRef(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!enabled) {
      progressRef.current = 0;
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const expected = KONAMI[progressRef.current];

      if (key === expected) {
        progressRef.current += 1;
        if (progressRef.current === KONAMI.length) {
          progressRef.current = 0;
          setActive((prev) => {
            const next = !prev;
            onToggle?.(next);
            return next;
          });
        }
      } else {
        progressRef.current = key === KONAMI[0] ? 1 : 0;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, onToggle]);

  return { active };
}

