"use client";

type SliderProps = {
  hint?: string;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step?: number;
  suffix?: string;
  value: number;
};

export function GameSlider({
  hint,
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2.5">
      <div className="flex items-end justify-between">
        <div>
          <div
            className="text-white/50 uppercase tracking-[0.22em]"
            style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 500 }}
          >
            {label}
          </div>
          {hint ? (
            <div
              className="mt-0.5 text-white/30"
              style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "11px" }}
            >
              {hint}
            </div>
          ) : null}
        </div>
        <div
          className="rounded-md border border-[#6e56f9]/30 bg-[#6e56f9]/10 px-2.5 py-1 text-white"
          style={{ fontFamily: "Orbitron, sans-serif", fontSize: "13px", fontWeight: 700 }}
        >
          {value}
          <span className="ml-1 text-[#b9aaff]/80" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}>
            {suffix}
          </span>
        </div>
      </div>

      <div className="relative flex h-8 items-center">
        <div className="absolute inset-x-0 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, #6e56f9, #9a83ff)",
              boxShadow: "0 0 12px rgba(110,86,249,0.6)",
            }}
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 flex justify-between">
          {Array.from({ length: 11 }).map((_, index) => (
            <span key={index} className="h-2 w-px bg-white/10" />
          ))}
        </div>
        <div
          className="pointer-events-none absolute h-5 w-5 rounded-[6px] border border-[#6e56f9] bg-white"
          style={{
            left: `calc(${pct}% - 10px)`,
            boxShadow: "0 0 0 3px rgba(110,86,249,0.25), 0 0 16px rgba(110,86,249,0.6)",
          }}
        />
        <input
          className="absolute inset-0 w-full cursor-pointer opacity-0"
          max={max}
          min={min}
          onChange={(event) => onChange(Number(event.target.value))}
          step={step}
          type="range"
          value={value}
        />
      </div>
    </div>
  );
}
