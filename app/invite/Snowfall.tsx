"use client";

import { useEffect, useRef } from "react";

type Flake = {
  x: number;
  y: number;
  depth: number; // 0 far away, 1 right in front of the viewer
  size: number;
  speed: number;
  sway: number;
  freq: number;
  phase: number;
};

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Full-page snow in three depths. Near flakes are larger, softer, faster and move
// more with the pointer. Also publishes the eased pointer position as --px/--py
// (-1..1) on <html> so other elements can join the parallax in CSS.
export default function Snowfall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    let flakes: Flake[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;
    let frame = 0;
    let last = performance.now();
    const start = last;
    const target = { x: 0, y: 0 };
    const pointer = { x: 0, y: 0 };

    const build = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);

      const rand = seeded(1012);
      const n = Math.round(clamp((w * h) / 9000, 60, 220));
      flakes = Array.from({ length: n }, () => {
        const depth = Math.pow(rand(), 1.8); // mostly distant flakes, a few close ones
        return {
          x: rand() * w,
          y: rand() * h,
          depth,
          size: 0.5 + depth * 2.6,
          speed: 12 + depth * 55 + rand() * 10,
          sway: 6 + rand() * 18 * (0.4 + depth),
          freq: 0.15 + rand() * 0.45,
          phase: rand() * Math.PI * 2,
        };
      });
    };

    const draw = (time: number, dt: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const fadeIn = still ? 1 : clamp((time - 1.2) / 2.5);

      for (const f of flakes) {
        f.y += f.speed * dt;
        if (f.y > h + 10) {
          f.y = -10;
          f.x = Math.random() * w;
        }
        const x = f.x + Math.sin(time * f.freq + f.phase) * f.sway - pointer.x * 28 * f.depth;
        const y = f.y - pointer.y * 14 * f.depth;
        const alpha = fadeIn * (0.25 + 0.55 * f.depth);
        const r = f.size * (f.depth > 0.6 ? 2.2 : 1);

        if (f.depth > 0.6) {
          // Close flakes are out of focus: soft glow instead of a hard dot
          const g = ctx.createRadialGradient(x, y, 0, x, y, r);
          g.addColorStop(0, `rgba(255,242,224,${alpha})`);
          g.addColorStop(0.4, `rgba(255,236,210,${alpha * 0.45})`);
          g.addColorStop(1, "rgba(255,236,210,0)");
          ctx.fillStyle = g;
        } else {
          ctx.fillStyle = `rgba(255,240,220,${alpha})`;
        }
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      pointer.x += (target.x - pointer.x) * 0.05;
      pointer.y += (target.y - pointer.y) * 0.05;
      root.style.setProperty("--px", pointer.x.toFixed(4));
      root.style.setProperty("--py", pointer.y.toFixed(4));
      draw((now - start) / 1000, dt);
      frame = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.x = (e.clientX / w) * 2 - 1;
      target.y = (e.clientY / h) * 2 - 1;
    };
    const onResize = () => {
      build();
      if (still) draw(0, 0);
    };

    build();
    if (still) draw(0, 0);
    else {
      frame = requestAnimationFrame(loop);
      window.addEventListener("pointermove", onMove);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      root.style.removeProperty("--px");
      root.style.removeProperty("--py");
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-10 h-full w-full"
    />
  );
}
