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
  const resizeHandlerRef = useRef<(() => void) | null>(null);

  const reducedMotion = useMemo(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false,
    []
  );

  useEffect(() => {
    const stop = () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      timerRef.current = null;
      rafRef.current = 0;
      if (resizeHandlerRef.current) {
        window.removeEventListener("resize", resizeHandlerRef.current);
        resizeHandlerRef.current = null;
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      onStop?.();
    };

    if (!enabled || !running || reducedMotion) {
      stop();
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const letters = "abcdefghijklmnopqrstuvwxyz0123456789#$%&*+@";
    const fontSize = 14;
    const { width, height } = canvas.getBoundingClientRect();
    const columns = Math.max(1, Math.floor(width / fontSize));
    const drops = Array.from({ length: columns }, () => Math.random() * height);

    const tick = () => {
      const rect = canvas.getBoundingClientRect();

      ctx.fillStyle = "rgba(26, 27, 38, 0.20)";
      ctx.fillRect(0, 0, rect.width, rect.height);

      ctx.font = `${fontSize}px JetBrains Mono, monospace`;
      ctx.fillStyle = "rgba(158, 206, 106, 0.85)";

      for (let i = 0; i < drops.length; i++) {
        const x = i * fontSize;
        const y = drops[i];
        const ch = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(ch, x, y);

        drops[i] = y + fontSize;
        if (drops[i] > rect.height && Math.random() > 0.975) drops[i] = 0;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    tick();

    resizeHandlerRef.current = () => resize();
    window.addEventListener("resize", resizeHandlerRef.current, { passive: true });

    timerRef.current = window.setTimeout(stop, durationMs);

    return stop;
  }, [durationMs, enabled, onStop, reducedMotion, running]);

  return <canvas id="matrix" ref={canvasRef} />;
}

