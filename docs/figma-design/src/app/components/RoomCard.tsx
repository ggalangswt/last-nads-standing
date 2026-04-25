import { Users, Zap, Timer, Eye, ArrowRight, Trophy } from "lucide-react";

export type RoomStatus = "live" | "waiting" | "finished";

export type Room = {
  id: number;
  status: RoomStatus;
  prize: string;
  entry: string;
  players: number;
  maxPlayers: number;
  elimPct: number;
  interval: string;
  round?: number;
};

export function StatusBadge({ status }: { status: RoomStatus }) {
  const map = {
    live: { label: "Live Now", color: "#ff3b5c", bg: "rgba(255,59,92,0.12)", border: "rgba(255,59,92,0.35)" },
    waiting: { label: "Waiting", color: "#6e56f9", bg: "rgba(110,86,249,0.12)", border: "rgba(110,86,249,0.4)" },
    finished: { label: "Finished", color: "#9ca3af", bg: "rgba(156,163,175,0.08)", border: "rgba(156,163,175,0.25)" },
  }[status];
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
      style={{ background: map.bg, borderColor: map.border }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          background: map.color,
          boxShadow: status === "live" ? `0 0 8px ${map.color}` : "none",
          animation: status === "live" ? "pulse 1.4s ease-in-out infinite" : "none",
        }}
      />
      <span
        className="uppercase tracking-[0.15em]"
        style={{ color: map.color, fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
      >
        {map.label}
      </span>
    </div>
  );
}

export function RoomCard({ room }: { room: Room }) {
  const pct = (room.players / room.maxPlayers) * 100;
  const disabled = room.status === "finished";

  return (
    <div
      className="group relative rounded-[16px] border border-white/8 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5 hover:border-[#6e56f9]/40 hover:bg-white/[0.05] transition-all duration-300 overflow-hidden"
    >
      {/* ambient glow on hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: "radial-gradient(ellipse at top right, rgba(110,86,249,0.15), transparent 60%)" }}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-[10px] border border-white/10 bg-black/40 flex items-center justify-center"
            style={{ boxShadow: room.status === "live" ? "0 0 20px rgba(255,59,92,0.2)" : "none" }}
          >
            <span
              className="text-white"
              style={{ fontFamily: "Orbitron, sans-serif", fontSize: "11px", fontWeight: 700 }}
            >
              {String(room.id).padStart(3, "0")}
            </span>
          </div>
          <div>
            <div
              className="text-white/50 uppercase tracking-[0.22em]"
              style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px" }}
            >
              Room
            </div>
            <div
              className="text-white"
              style={{ fontFamily: "Orbitron, sans-serif", fontSize: "15px", fontWeight: 700 }}
            >
              #{room.id}
            </div>
          </div>
        </div>
        <StatusBadge status={room.status} />
      </div>

      {/* Prize */}
      <div className="relative mt-5 p-4 rounded-[12px] border border-white/5 bg-black/30">
        <div className="flex items-center justify-between">
          <div>
            <div
              className="text-white/50 uppercase tracking-[0.2em] flex items-center gap-1.5"
              style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px" }}
            >
              <Trophy className="h-3 w-3" /> Prize Pool
            </div>
            <div
              className="text-white mt-1"
              style={{ fontFamily: "Orbitron, sans-serif", fontSize: "22px", fontWeight: 700, letterSpacing: "-0.01em" }}
            >
              {room.prize} <span className="text-[#6e56f9]">MON</span>
            </div>
          </div>
          <div className="text-right">
            <div
              className="text-white/50 uppercase tracking-[0.2em]"
              style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px" }}
            >
              Entry
            </div>
            <div
              className="text-white mt-1"
              style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "13px", fontWeight: 600 }}
            >
              {room.entry} MON
            </div>
          </div>
        </div>
      </div>

      {/* Players bar */}
      <div className="relative mt-4">
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-white/60 flex items-center gap-1.5"
            style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12px" }}
          >
            <Users className="h-3.5 w-3.5" /> Players
          </span>
          <span
            className="text-white"
            style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px", fontWeight: 600 }}
          >
            {room.players}<span className="text-white/40">/{room.maxPlayers}</span>
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: room.status === "live" ? "#ff3b5c" : "#6e56f9",
              boxShadow: `0 0 8px ${room.status === "live" ? "#ff3b5c" : "#6e56f9"}`,
            }}
          />
        </div>
      </div>

      {/* Meta */}
      <div className="relative mt-4 grid grid-cols-2 gap-3">
        <Meta icon={<Zap className="h-3 w-3" />} label="Elim %" value={`${room.elimPct}%`} />
        <Meta icon={<Timer className="h-3 w-3" />} label="Interval" value={room.interval} />
      </div>

      {/* Actions */}
      <div className="relative mt-5 grid grid-cols-[1fr_auto] gap-2">
        <button
          disabled={disabled}
          className="flex items-center justify-center gap-2 h-10 rounded-[10px] bg-[#6e56f9] hover:bg-[#7d67ff] disabled:bg-white/5 disabled:text-white/30 text-white transition-colors shadow-[0_0_16px_rgba(110,86,249,0.3)] disabled:shadow-none"
          style={{ fontFamily: "Orbitron, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em" }}
        >
          {room.status === "finished" ? "CLOSED" : "JOIN"}
          {!disabled && <ArrowRight className="h-3.5 w-3.5" />}
        </button>
        <button
          className="flex items-center justify-center gap-2 h-10 px-4 rounded-[10px] border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white/80 hover:text-white transition-colors"
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12px", fontWeight: 500 }}
        >
          <Eye className="h-3.5 w-3.5" /> Spectate
        </button>
      </div>

      <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }`}</style>
    </div>
  );
}

function Meta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-white/5 bg-white/[0.02] px-3 py-2">
      <div
        className="flex items-center gap-1.5 text-white/45 uppercase tracking-[0.18em]"
        style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px" }}
      >
        {icon} {label}
      </div>
      <div
        className="text-white mt-0.5"
        style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "13px", fontWeight: 600 }}
      >
        {value}
      </div>
    </div>
  );
}
