import { useEffect, useState } from "react";

export function ArenaTotem() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1200);
    return () => clearInterval(id);
  }, []);

  const segments = 24;
  const activeCount = 17 - (tick % 5);

  return (
    <div className="relative flex items-center justify-center" style={{ width: "min(520px, 42vw)", height: "min(520px, 42vw)" }}>
      {/* ambient glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle at center, rgba(110,86,249,0.35) 0%, rgba(110,86,249,0.08) 40%, transparent 70%)",
          filter: "blur(10px)",
        }}
      />

      {/* outer rotating ring */}
      <div
        className="absolute inset-0 rounded-full border border-[#6e56f9]/20"
        style={{ animation: "spin 40s linear infinite" }}
      />
      <div
        className="absolute rounded-full border border-dashed border-white/10"
        style={{ inset: "8%", animation: "spin 60s linear infinite reverse" }}
      />

      {/* segment ring */}
      <svg viewBox="0 0 200 200" className="absolute inset-0" style={{ transform: "rotate(-90deg)" }}>
        {Array.from({ length: segments }).map((_, i) => {
          const angle = (360 / segments) * i;
          const active = i < activeCount;
          return (
            <g key={i} transform={`rotate(${angle} 100 100)`}>
              <rect
                x="98.5"
                y="14"
                width="3"
                height="14"
                rx="1.5"
                fill={active ? "#6e56f9" : "rgba(255,255,255,0.08)"}
                style={{
                  filter: active ? "drop-shadow(0 0 4px #6e56f9)" : "none",
                  transition: "fill 0.4s",
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* inner monolith */}
      <div
        className="relative rounded-[28px] border border-white/10 bg-gradient-to-b from-[#141420] to-[#0a0a12] overflow-hidden"
        style={{
          width: "52%",
          height: "64%",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 30px 80px rgba(110,86,249,0.25)",
        }}
      >
        {/* scanlines */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px)",
          }}
        />

        <div className="relative h-full flex flex-col items-center justify-between p-5">
          <div
            className="text-white/40 uppercase tracking-[0.3em]"
            style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px" }}
          >
            Arena · Room #0427
          </div>

          <div className="flex flex-col items-center gap-2">
            <div
              className="text-white"
              style={{ fontFamily: "Orbitron, sans-serif", fontSize: "54px", fontWeight: 800, letterSpacing: "0.04em", textShadow: "0 0 24px rgba(110,86,249,0.6)" }}
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
                00:{String(12 - (tick % 12)).padStart(2, "0")}
              </span>
            </div>
            <div className="h-[3px] w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-[#6e56f9]"
                style={{
                  width: `${((tick % 12) / 12) * 100}%`,
                  boxShadow: "0 0 8px #6e56f9",
                  transition: "width 1s linear",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* floating badge */}
      <div
        className="absolute right-[-10px] top-[14%] flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#6e56f9]/40 bg-black/70 backdrop-blur"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#6e56f9] animate-pulse" />
        <span
          className="text-white uppercase tracking-[0.2em]"
          style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px", fontWeight: 600 }}
        >
          Live on Monad
        </span>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
