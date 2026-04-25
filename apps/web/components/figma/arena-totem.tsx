"use client";

import { useEffect, useState } from "react";

export function ArenaTotem() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((current) => current + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const segments = 24;
  // Setiap 12 detik countdown selesai, alive turun 1. Range: 17 → 13 lalu reset ke 17
  const elimCycle = Math.floor(tick / 5); // bertambah setiap 5 detik
  const activeCount = 17 - (elimCycle % 5);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: "min(520px, 42vw)", height: "min(520px, 42vw)" }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(110,86,249,0.35) 0%, rgba(110,86,249,0.08) 40%, transparent 70%)",
          filter: "blur(10px)",
        }}
      />

      <div
        className="absolute inset-0 rounded-full border border-[#6e56f9]/20"
        style={{ animation: "spin 40s linear infinite" }}
      />
      <div
        className="absolute rounded-full border border-dashed border-white/10"
        style={{ inset: "8%", animation: "spin 60s linear infinite reverse" }}
      />

      <svg className="absolute inset-0" style={{ transform: "rotate(-90deg)" }} viewBox="0 0 200 200">
        {Array.from({ length: segments }).map((_, index) => {
          const angle = (360 / segments) * index;
          const active = index < activeCount;

          return (
            <g key={index} transform={`rotate(${angle} 100 100)`}>
              <rect
                fill={active ? "#6e56f9" : "rgba(255,255,255,0.08)"}
                height="14"
                rx="1.5"
                style={{
                  filter: active ? "drop-shadow(0 0 4px #6e56f9)" : "none",
                  transition: "fill 0.4s",
                }}
                width="3"
                x="98.5"
                y="14"
              />
            </g>
          );
        })}
      </svg>

      <div
        className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-[#141420] to-[#0a0a12]"
        style={{
          width: "52%",
          height: "64%",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 30px 80px rgba(110,86,249,0.25)",
        }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px)",
          }}
        />

        <div className="relative flex h-full flex-col items-center justify-between p-5">
          <div
            className="text-white/40 uppercase tracking-[0.3em]"
            style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px" }}
          >
            Arena · Room #0427
          </div>

          <div className="flex flex-col items-center gap-2">
            <div
              className="text-white"
              style={{
                fontFamily: "Orbitron, sans-serif",
                fontSize: "54px",
                fontWeight: 800,
                letterSpacing: "0.04em",
                textShadow: "0 0 24px rgba(110,86,249,0.6)",
              }}
            >
              {String(activeCount).padStart(2, "0")}
            </div>
            <div
              className="text-[#b9aaff] uppercase tracking-[0.3em]"
              style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px" }}
            >
              Alive
            </div>
          </div>

          <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
              <span
                className="text-white/40 uppercase tracking-wider"
                style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px" }}
              >
                Next elim
              </span>
              <span
                className="text-white"
                style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", fontWeight: 600 }}
              >
                00:{String(5 - (tick % 5)).padStart(2, "0")}
              </span>
            </div>
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full bg-[#6e56f9]"
                style={{
                  width: `${((tick % 5) / 5) * 100}%`,
                  boxShadow: "0 0 8px #6e56f9",
                  transition: "width 1s linear",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute right-[-10px] top-[14%] flex items-center gap-2 rounded-full border border-[#6e56f9]/40 bg-black/70 px-3 py-1.5 backdrop-blur">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#6e56f9]" />
        <span
          className="text-white uppercase tracking-[0.2em]"
          style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px", fontWeight: 600 }}
        >
          Live on Monad
        </span>
      </div>
    </div>
  );
}
