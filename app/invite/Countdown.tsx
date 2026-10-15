"use client";

import { useEffect, useState } from "react";
import { EVENT } from "./event";

const UNITS: [string, number][] = [
  ["Tage", 86400],
  ["Stunden", 3600],
  ["Minuten", 60],
  ["Sekunden", 1],
];

export default function Countdown() {
  // null until mounted so server and client markup match
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(EVENT.start).getTime();
    const tick = () => setLeft(Math.max(0, Math.floor((target - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (left === 0) return <p className="text-sm uppercase tracking-[0.3em]">Heute ist es so weit</p>;

  return (
    <div className="flex justify-center gap-5 md:gap-8" aria-label="Countdown bis zur Feier">
      {UNITS.map(([label, size], i) => {
        const value = left === null ? null : Math.floor((i === 0 ? left : left % UNITS[i - 1][1]) / size);
        return (
          <div key={label} className="flex min-w-[3.5rem] flex-col items-center">
            <span className="font-light tabular-nums text-3xl text-[#F2D3A8] md:text-4xl">
              {value === null ? "–" : String(value).padStart(2, "0")}
            </span>
            <span className="mt-1 text-[0.65rem] uppercase tracking-[0.25em] text-[#D8895F]/70">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
