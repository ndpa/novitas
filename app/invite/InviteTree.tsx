"use client";

import { useEffect, useRef } from "react";

type RGB = [number, number, number];

type Streak = { offset: number; scale: number; alpha: number };

type Row = {
  t: number; // 0 at the tip, 1 at the base
  y: number;
  half: number;
  alpha: number;
  phase: number;
  speed: number;
  gradient: CanvasGradient;
  streaks: Streak[];
};

type Particle = {
  x: number;
  y: number;
  vy: number;
  sway: number;
  freq: number;
  size: number;
  phase: number;
};

// Tip to base: pale gold, gold, copper, deep copper - sampled from the invitation.
const STOPS: [number, RGB][] = [
  [0, [255, 238, 200]],
  [0.18, [247, 214, 142]],
  [0.42, [240, 190, 112]],
  [0.7, [222, 146, 104]],
  [1, [186, 98, 80]],
];

const INTRO_START = 0.2;
const INTRO_SPREAD = 1.5;
const INTRO_GROW = 1.2;
const LIVE_AT = 2.6;
const SWEEP_PERIOD = 7;

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const smooth = (a: number, b: number, x: number) => {
  const k = clamp((x - a) / (b - a));
  return k * k * (3 - 2 * k);
};

function colorAt(t: number): RGB {
  for (let i = 1; i < STOPS.length; i++) {
    const [t1, c1] = STOPS[i];
    const [t0, c0] = STOPS[i - 1];
    if (t <= t1) {
      const k = (t - t0) / (t1 - t0);
      return [0, 1, 2].map((j) => Math.round(c0[j] + (c1[j] - c0[j]) * k)) as RGB;
    }
  }
  return STOPS[STOPS.length - 1][1];
}

// Deterministic noise so the tree has the same texture on every visit.
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export default function InviteTree({ className, dust = true }: { className?: string; dust?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let rows: Row[] = [];
    let particles: Particle[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;
    let cx = 0;
    let apexY = 0;
    let baseY = 0;
    let maxHalf = 0;
    let frame = 0;
    const start = performance.now();

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);

      const portrait = w < 768;
      cx = w / 2;
      apexY = h * 0.06;
      baseY = h * (portrait ? 0.76 : 0.97);
      const treeH = baseY - apexY;
      maxHalf = Math.min(w * (portrait ? 0.5 : 0.4), treeH * 0.8);

      const rand = seeded(2026);
      const gap = treeH > 500 ? 2.6 : 2.3;
      const count = Math.max(60, Math.floor(treeH / gap));
      rows = [];
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        const [r, g, b] = colorAt(t);
        const gradient = ctx.createLinearGradient(-1, 0, 1, 0);
        gradient.addColorStop(0, `rgba(${r},${g},${b},0)`);
        gradient.addColorStop(0.15, `rgba(${r},${g},${b},0.1)`);
        gradient.addColorStop(0.35, `rgba(${r},${g},${b},0.55)`);
        gradient.addColorStop(0.5, `rgba(${r},${g},${b},1)`);
        gradient.addColorStop(0.65, `rgba(${r},${g},${b},0.55)`);
        gradient.addColorStop(0.85, `rgba(${r},${g},${b},0.1)`);
        gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);

        const streaks: Streak[] = [{ offset: 0, scale: 1, alpha: 0.6 }];
        const extra = 1 + Math.floor(rand() * 2);
        for (let k = 0; k < extra; k++) {
          streaks.push({
            offset: (rand() - 0.5) * 0.5,
            scale: 0.25 + rand() * 0.45,
            alpha: 0.45 + rand() * 0.55,
          });
        }

        rows.push({
          t,
          y: apexY + t * treeH,
          half: maxHalf * (0.012 + 0.988 * Math.pow(t, 1.05)) * (0.8 + rand() * 0.35),
          alpha: 1.35 * (0.6 + 0.4 * (1 - t)) * (1 - 0.65 * smooth(0.82, 1, t)) * (0.6 + rand() * 0.4),
          phase: rand() * Math.PI * 2,
          speed: 0.6 + rand() * 1.6,
          gradient,
          streaks,
        });
      }

      const prand = seeded(1210);
      const n = Math.round(clamp((w * h) / 18000, 30, 90));
      particles = Array.from({ length: n }, () => ({
        x: cx + (prand() - 0.5) * maxHalf * 2.3,
        y: apexY + prand() * treeH,
        vy: 4 + prand() * 9,
        sway: 4 + prand() * 12,
        freq: 0.2 + prand() * 0.5,
        size: 0.5 + prand() * 1.1,
        phase: prand() * Math.PI * 2,
      }));
    };

    const draw = (time: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const live = still ? 1 : smooth(LIVE_AT, LIVE_AT + 1.5, time);
      const treeH = baseY - apexY;

      // Ambient glow behind the tree
      const ambient = still ? 1 : smooth(0.3, 2.4, time);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      const glow = ctx.createRadialGradient(cx, apexY + treeH * 0.6, 0, cx, apexY + treeH * 0.6, treeH * 0.85);
      glow.addColorStop(0, `rgba(216,137,95,${0.12 * ambient})`);
      glow.addColorStop(0.45, `rgba(216,137,95,${0.05 * ambient})`);
      glow.addColorStop(0.8, `rgba(216,137,95,${0.012 * ambient})`);
      glow.addColorStop(1, "rgba(216,137,95,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = "lighter";
      const sweepPos = still ? -1 : (((time - LIVE_AT) % SWEEP_PERIOD) + SWEEP_PERIOD) % SWEEP_PERIOD / SWEEP_PERIOD * 1.5 - 0.25;

      for (const row of rows) {
        const grow = still ? 1 : easeOut(clamp((time - INTRO_START - row.t * INTRO_SPREAD) / INTRO_GROW));
        if (grow <= 0) continue;
        const twinkle = 1 + 0.2 * Math.sin(time * row.speed + row.phase);
        const breathe = 1 + 0.035 * live * Math.sin(time * 1.1 - row.t * 7);
        const sweep = 1 + 0.9 * live * Math.exp(-Math.pow((row.t - sweepPos) / 0.05, 2));
        const half = row.half * grow * breathe;
        const alpha = row.alpha * grow * twinkle * sweep;
        ctx.fillStyle = row.gradient;
        for (const s of row.streaks) {
          const len = half * s.scale;
          if (len < 0.5) continue;
          ctx.globalAlpha = clamp(alpha * s.alpha);
          ctx.setTransform(dpr * len, 0, 0, dpr, dpr * (cx + s.offset * half), 0);
          ctx.fillRect(-1, row.y - 0.55, 2, 1.1);
        }
      }

      // Star at the tip
      const starIn = still ? 1 : smooth(0.2, 1.1, time);
      if (starIn > 0) {
        const pulse = 0.85 + 0.15 * Math.sin(time * 2);
        const r = 26 * pulse;
        ctx.globalAlpha = starIn;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const star = ctx.createRadialGradient(cx, apexY, 0, cx, apexY, r);
        star.addColorStop(0, "rgba(255,244,214,0.95)");
        star.addColorStop(0.25, "rgba(247,214,142,0.45)");
        star.addColorStop(1, "rgba(247,214,142,0)");
        ctx.fillStyle = star;
        ctx.fillRect(cx - r, apexY - r, r * 2, r * 2);

        const flare = (len: number, vertical: boolean) => {
          const g = vertical
            ? ctx.createLinearGradient(cx, apexY - len, cx, apexY + len)
            : ctx.createLinearGradient(cx - len, apexY, cx + len, apexY);
          g.addColorStop(0, "rgba(255,238,200,0)");
          g.addColorStop(0.5, "rgba(255,238,200,0.8)");
          g.addColorStop(1, "rgba(255,238,200,0)");
          ctx.fillStyle = g;
          if (vertical) ctx.fillRect(cx - 0.5, apexY - len, 1, len * 2);
          else ctx.fillRect(cx - len, apexY - 0.5, len * 2, 1);
        };
        flare(46 * pulse, false);
        flare(30 * pulse, true);
      }

      // Gold dust
      const dustIn = !dust ? 0 : still ? 1 : smooth(1.4, 3.2, time);
      if (dustIn > 0) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = "rgb(250,222,160)";
        for (const p of particles) {
          const travel = still ? 0 : p.vy * time;
          let y = p.y + travel;
          const span = baseY - apexY + 40;
          y = apexY - 20 + ((((y - (apexY - 20)) % span) + span) % span);
          const x = p.x + Math.sin(time * p.freq + p.phase) * p.sway;
          const edge = smooth(apexY - 20, apexY + 60, y) * (1 - smooth(baseY - 60, baseY, y));
          ctx.globalAlpha = dustIn * edge * (0.25 + 0.55 * (0.5 + 0.5 * Math.sin(time * 1.7 + p.phase * 3)));
          ctx.beginPath();
          ctx.arc(x, y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const loop = () => {
      draw((performance.now() - start) / 1000);
      frame = requestAnimationFrame(loop);
    };

    build();
    if (still) draw(0);
    else frame = requestAnimationFrame(loop);

    const observer = new ResizeObserver(() => {
      build();
      if (still) draw(0);
    });
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [dust]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
