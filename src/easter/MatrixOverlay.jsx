import { useEffect, useMemo, useRef } from "react";

export default function MatrixOverlay({ enabled, running, onStop, durationMs = 9000 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const timerRef = useRef(0);
  const resizeHandlerRef = useRef(null);

  const reducedMotion = useMemo(() => {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  useEffect(() => {
    const stop = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      timerRef.current = 0;
      rafRef.current = 0;
      if (resizeHandlerRef.current) {
        window.removeEventListener("resize", resizeHandlerRef.current);
        resizeHandlerRef.current = null;
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext?.("2d");
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      onStop?.();
    };

    if (!enabled || !running) {
      stop();
      return;
    }

    if (reducedMotion) {
      // Nothing to animate; let the terminal print text instead.
      stop();
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext?.("2d");
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
    const rect = canvas.getBoundingClientRect();
    const columns = Math.max(1, Math.floor(rect.width / fontSize));
    const drops = Array.from({ length: columns }, () => Math.random() * rect.height);

    const tick = () => {
      const { width, height } = canvas.getBoundingClientRect();

      ctx.fillStyle = "rgba(26, 27, 38, 0.20)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px JetBrains Mono, monospace`;
      ctx.fillStyle = "rgba(158, 206, 106, 0.85)";

      for (let i = 0; i < drops.length; i++) {
        const x = i * fontSize;
        const y = drops[i];
        const ch = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(ch, x, y);

        drops[i] = y + fontSize;
        if (drops[i] > height && Math.random() > 0.975) drops[i] = 0;
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

