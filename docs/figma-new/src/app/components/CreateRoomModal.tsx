import { useState, useEffect } from "react";
import { X, Rocket, Zap, Coins, Users, Timer, Flame } from "lucide-react";
import { GameSlider } from "./Slider";

export function CreateRoomModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [entryFee, setEntryFee] = useState(2.5);
  const [minPlayers, setMinPlayers] = useState(20);
  const [maxPlayers, setMaxPlayers] = useState(50);
  const [elimPct, setElimPct] = useState(20);
  const [interval, setInterval] = useState(12);

  const estimatedPool = +(entryFee * maxPlayers).toFixed(2);
  const estimatedRounds = Math.ceil(Math.log(1) - Math.log(1 / maxPlayers) / Math.log(1 - elimPct / 100)) || 0;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0"
        style={{
          background: "rgba(4,4,8,0.72)",
          backdropFilter: "blur(10px)",
        }}
      />

      {/* modal */}
      <div
        className="relative w-full max-w-[560px] rounded-[20px] border border-white/10 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(22,20,40,0.96), rgba(10,10,18,0.98))",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(110,86,249,0.15), 0 0 60px rgba(110,86,249,0.25)",
        }}
      >
        {/* top glow bar */}
        <div
          className="absolute top-0 inset-x-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #6e56f9, transparent)" }}
        />
        {/* corner crosses */}
        <Cross style={{ top: 10, left: 10 }} />
        <Cross style={{ top: 10, right: 10 }} />
        <Cross style={{ bottom: 10, left: 10 }} />
        <Cross style={{ bottom: 10, right: 10 }} />

        {/* header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-start gap-3">
            <div
              className="h-10 w-10 rounded-[10px] flex items-center justify-center border border-[#6e56f9]/40"
              style={{ background: "rgba(110,86,249,0.15)", boxShadow: "0 0 20px rgba(110,86,249,0.3)" }}
            >
              <Rocket className="h-4 w-4 text-[#b9aaff]" />
            </div>
            <div>
              <div
                className="text-[#b9aaff] uppercase tracking-[0.3em] mb-1"
                style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
              >
                // New Arena
              </div>
              <h2
                className="text-white"
                style={{ fontFamily: "Orbitron, sans-serif", fontSize: "22px", fontWeight: 800, letterSpacing: "-0.01em" }}
              >
                Deploy New Arena
              </h2>
              <p
                className="text-white/50 mt-1 max-w-[380px]"
                style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px", lineHeight: 1.5 }}
              >
                Configure your survival room. Smart contract deploys instantly on Monad.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-[8px] border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* helper chips */}
        <div className="flex items-center gap-1.5 px-6 pb-5 flex-wrap">
          <Chip icon={<Zap className="h-3 w-3" />}>Monad Testnet</Chip>
          <Chip icon={<Rocket className="h-3 w-3" />}>Instant deploy</Chip>
          <Chip icon={<Flame className="h-3 w-3" />}>Gas-light setup</Chip>
        </div>

        <div className="h-px bg-white/5" />

        {/* controls */}
        <div className="p-6 space-y-5">
          <GameSlider
            label="Entry Fee"
            value={entryFee}
            min={0.1}
            max={10}
            step={0.1}
            suffix="MON"
            hint="Cost for each player to enter"
            onChange={(v) => setEntryFee(+v.toFixed(1))}
          />

          <div className="grid grid-cols-2 gap-5">
            <GameSlider
              label="Min Players"
              value={minPlayers}
              min={5}
              max={Math.max(10, maxPlayers - 5)}
              suffix=""
              onChange={(v) => setMinPlayers(v)}
            />
            <GameSlider
              label="Max Players"
              value={maxPlayers}
              min={Math.min(minPlayers + 5, 50)}
              max={100}
              suffix=""
              onChange={(v) => setMaxPlayers(v)}
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <GameSlider
              label="Elimination %"
              value={elimPct}
              min={5}
              max={40}
              suffix="%"
              hint="Pace of the match"
              onChange={(v) => setElimPct(v)}
            />
            <GameSlider
              label="Round Interval"
              value={interval}
              min={5}
              max={30}
              suffix="s"
              hint="Tension between rounds"
              onChange={(v) => setInterval(v)}
            />
          </div>
        </div>

        {/* summary */}
        <div className="px-6 pb-6">
          <div
            className="relative rounded-[14px] p-4 border overflow-hidden"
            style={{
              borderColor: "rgba(110,86,249,0.35)",
              background:
                "linear-gradient(120deg, rgba(110,86,249,0.18), rgba(110,86,249,0.04))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <div
              className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(110,86,249,0.35), transparent 70%)" }}
            />
            <div className="relative flex items-center justify-between">
              <div>
                <div
                  className="text-[#b9aaff] uppercase tracking-[0.25em] flex items-center gap-1.5"
                  style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
                >
                  <Coins className="h-3 w-3" /> Estimated Prize Pool
                </div>
                <div
                  className="text-white mt-1"
                  style={{ fontFamily: "Orbitron, sans-serif", fontSize: "30px", fontWeight: 800, letterSpacing: "-0.01em", textShadow: "0 0 24px rgba(110,86,249,0.55)" }}
                >
                  {estimatedPool} <span className="text-[#6e56f9]">MON</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Summary icon={<Users className="h-3 w-3" />} value={`${maxPlayers} max`} />
                <Summary icon={<Timer className="h-3 w-3" />} value={`~${estimatedRounds} rounds`} />
              </div>
            </div>
          </div>
        </div>

        {/* footer actions */}
        <div className="flex items-center gap-2.5 px-6 pb-6">
          <button
            onClick={onClose}
            className="h-11 px-5 rounded-[10px] border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white/80 hover:text-white transition-colors"
            style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px", fontWeight: 500 }}
          >
            Cancel
          </button>
          <button
            className="group flex-1 h-11 rounded-[10px] bg-[#6e56f9] hover:bg-[#7d67ff] text-white flex items-center justify-center gap-2 transition-colors shadow-[0_0_24px_rgba(110,86,249,0.45)]"
            style={{ fontFamily: "Orbitron, sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em" }}
          >
            <Rocket className="h-4 w-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            DEPLOY ROOM
          </button>
        </div>
      </div>
    </div>
  );
}

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03] text-white/60"
      style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", letterSpacing: "0.15em" }}
    >
      {icon}
      <span className="uppercase">{children}</span>
    </div>
  );
}

function Summary({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div
      className="flex items-center gap-1.5 text-white/70"
      style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }}
    >
      {icon} {value}
    </div>
  );
}

function Cross({ style }: { style: React.CSSProperties }) {
  return (
    <div className="absolute h-2.5 w-2.5 pointer-events-none" style={style}>
      <span className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-[#6e56f9]/50" />
      <span className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-[#6e56f9]/50" />
    </div>
  );
}
