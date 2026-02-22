import { useEffect, useMemo, useRef } from "react";
import "./MatrixOverlay.css";

interface MatrixOverlayProps {
  enabled: boolean;
  running: boolean;
  onStop?: () => void;
  durationMs?: number;
}

export default function MatrixOverlay({
  enabled,
  running,
  onStop,
  durationMs = 9000,
}: MatrixOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  // Mutable state that survives resize without re-triggering the effect
  const dropsRef = useRef<number[]>([]);
  const dimsRef = useRef({ columns: 0, width: 0, height: 0 });

  const reducedMotion = useMemo(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false,
    []
  );

  useEffect(() => {
    if (!enabled || !running || reducedMotion) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const fontSize = 14;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const letters = "abcdefghijklmnopqrstuvwxyz0123456789#$%&*+@";

    // Tokyo Night palette
    const colorHead  = "rgba(125, 207, 255, 0.95)"; // --cyan:    leading char
    const colorMid   = "rgba(122, 162, 247, 0.70)"; // --accent:  mid trail
    const colorTail  = "rgba(187, 154, 247, 0.35)"; // --magenta: fading tail
    const colorFade  = "rgba(26,  27,  38,  0.18)"; // --bg:      fade overlay

    // Track age of each drop for colour graduation
    const ageRef = { current: new Array<number>(0) };

    // Resize canvas + rebuild drops if column count changed
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const newCols = Math.max(1, Math.floor(rect.width / fontSize));
      if (newCols !== dimsRef.current.columns) {
        const old = dropsRef.current;
        const oldAge = ageRef.current;
        dropsRef.current = Array.from({ length: newCols }, (_, i) =>
          i < old.length ? old[i] : Math.random() * rect.height
        );
        ageRef.current = Array.from({ length: newCols }, (_, i) =>
          i < oldAge.length ? oldAge[i] : 0
        );
      }
      dimsRef.current = { columns: newCols, width: rect.width, height: rect.height };
    };

    resize();

    const tick = () => {
      const { width, height } = dimsRef.current;
      const drops = dropsRef.current;
      const ages  = ageRef.current;

      ctx.fillStyle = colorFade;
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px JetBrains Mono, monospace`;

      for (let i = 0; i < drops.length; i++) {
        const ch  = letters[Math.floor(Math.random() * letters.length)];
        const age = ages[i] ?? 0;

        // Leading character is always bright cyan
        ctx.fillStyle = age < 2 ? colorHead : age < 8 ? colorMid : colorTail;
        ctx.fillText(ch, i * fontSize, drops[i]);

        drops[i] += fontSize;
        ages[i]   = age + 1;

        if (drops[i] > height && Math.random() > 0.975) {
          drops[i] = 0;
          ages[i]  = 0;
        }
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    tick();

    const onResize = () => resize();
    window.addEventListener("resize", onResize, { passive: true });

    // Auto-stop after durationMs — call onStop ONLY once via the timer
    timerRef.current = window.setTimeout(() => {
      onStop?.();
    }, durationMs);

    return () => {
      // Teardown: cancel animation + timer + listener, clear canvas
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      window.removeEventListener("resize", onResize);
      const c = canvasRef.current;
      if (c) {
        const cx = c.getContext("2d");
        if (cx) cx.clearRect(0, 0, c.width, c.height);
      }
      // Reset drops so next run starts fresh
      dropsRef.current = [];
      ageRef.current   = [];
      dimsRef.current  = { columns: 0, width: 0, height: 0 };
    };
  }, [durationMs, enabled, onStop, reducedMotion, running]);

  return <canvas id="matrix" ref={canvasRef} />;
}
