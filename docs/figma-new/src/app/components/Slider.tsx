type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
  hint?: string;
};

export function GameSlider({ label, value, min, max, step = 1, suffix = "", onChange, hint }: Props) {
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
          {hint && (
            <div
              className="text-white/30 mt-0.5"
              style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "11px" }}
            >
              {hint}
            </div>
          )}
        </div>
        <div
          className="text-white px-2.5 py-1 rounded-md border border-[#6e56f9]/30 bg-[#6e56f9]/10"
          style={{ fontFamily: "Orbitron, sans-serif", fontSize: "13px", fontWeight: 700 }}
        >
          {value}
          <span className="text-[#b9aaff]/80 ml-1" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}>
            {suffix}
          </span>
        </div>
      </div>

      <div className="relative h-8 flex items-center">
        {/* track */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, #6e56f9, #9a83ff)",
              boxShadow: "0 0 12px rgba(110,86,249,0.6)",
            }}
          />
        </div>
        {/* notches */}
        <div className="absolute inset-x-0 flex justify-between pointer-events-none">
          {Array.from({ length: 11 }).map((_, i) => (
            <span key={i} className="h-2 w-px bg-white/10" />
          ))}
        </div>
        {/* thumb */}
        <div
          className="absolute h-5 w-5 rounded-[6px] bg-white border border-[#6e56f9] pointer-events-none"
          style={{
            left: `calc(${pct}% - 10px)`,
            boxShadow: "0 0 0 3px rgba(110,86,249,0.25), 0 0 16px rgba(110,86,249,0.6)",
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}
