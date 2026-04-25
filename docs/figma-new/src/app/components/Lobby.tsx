import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { RoomCard, type Room, type RoomStatus } from "./RoomCard";

const MOCK_ROOMS: Room[] = [
  { id: 427, status: "live", prize: "128.40", entry: "2.50", players: 34, maxPlayers: 50, elimPct: 20, interval: "12s", round: 7 },
  { id: 426, status: "live", prize: "64.00", entry: "1.00", players: 48, maxPlayers: 50, elimPct: 15, interval: "15s", round: 3 },
  { id: 425, status: "waiting", prize: "42.00", entry: "1.00", players: 18, maxPlayers: 40, elimPct: 20, interval: "10s" },
  { id: 424, status: "waiting", prize: "90.00", entry: "3.00", players: 11, maxPlayers: 30, elimPct: 25, interval: "12s" },
  { id: 423, status: "live", prize: "210.00", entry: "5.00", players: 22, maxPlayers: 40, elimPct: 20, interval: "10s", round: 12 },
  { id: 422, status: "waiting", prize: "18.00", entry: "0.50", players: 6, maxPlayers: 20, elimPct: 15, interval: "15s" },
  { id: 421, status: "finished", prize: "156.00", entry: "3.00", players: 50, maxPlayers: 50, elimPct: 20, interval: "12s" },
  { id: 420, status: "finished", prize: "75.00", entry: "1.50", players: 50, maxPlayers: 50, elimPct: 18, interval: "10s" },
];

const FILTERS: { key: "all" | RoomStatus; label: string }[] = [
  { key: "all", label: "All Rooms" },
  { key: "live", label: "Live" },
  { key: "waiting", label: "Waiting" },
  { key: "finished", label: "Finished" },
];

export function Lobby({ onCreateRoom, onJoin }: { onCreateRoom?: () => void; onJoin?: () => void }) {
  const [filter, setFilter] = useState<"all" | RoomStatus>("all");
  const rooms = filter === "all" ? MOCK_ROOMS : MOCK_ROOMS.filter((r) => r.status === filter);

  return (
    <section className="relative flex-1 overflow-auto">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at top, black 20%, transparent 70%)",
        }}
      />

      <div className="relative max-w-[1440px] mx-auto px-10 lg:px-16 py-10">
        {/* header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
          <div>
            <div
              className="text-[#6e56f9] uppercase tracking-[0.3em] mb-2"
              style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
            >
              // Lobby
            </div>
            <h1
              className="text-white"
              style={{ fontFamily: "Orbitron, sans-serif", fontSize: "36px", fontWeight: 800, letterSpacing: "-0.01em" }}
            >
              Choose Your Arena.
            </h1>
            <p
              className="text-white/50 mt-2 max-w-[520px]"
              style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "14px", lineHeight: 1.6 }}
            >
              Join an active room, queue for the next round, or spectate a live match. All rooms are non-custodial and settled on Monad.
            </p>
          </div>

          {/* search + filter */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 h-10 px-3.5 rounded-[10px] border border-white/10 bg-white/[0.03] w-[240px]">
              <Search className="h-3.5 w-3.5 text-white/40" />
              <input
                placeholder="Search room #"
                className="flex-1 bg-transparent outline-none text-white placeholder:text-white/30"
                style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px" }}
              />
            </div>
            <button className="flex items-center justify-center h-10 w-10 rounded-[10px] border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white/60 hover:text-white transition-colors">
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* filter tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-[12px] border border-white/8 bg-white/[0.02] w-fit mb-6">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            const count = f.key === "all" ? MOCK_ROOMS.length : MOCK_ROOMS.filter((r) => r.status === f.key).length;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] transition-colors"
                style={{
                  background: active ? "rgba(110,86,249,0.18)" : "transparent",
                  color: active ? "#ffffff" : "rgba(255,255,255,0.55)",
                  border: active ? "1px solid rgba(110,86,249,0.4)" : "1px solid transparent",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "12px",
                  fontWeight: 500,
                }}
              >
                {f.label}
                <span
                  className="px-1.5 py-0.5 rounded-md"
                  style={{
                    background: active ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.05)",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "10px",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rooms.map((r) => (
            <RoomCard key={r.id} room={r} onJoin={onJoin} />
          ))}
        </div>

        <div
          className="mt-10 text-center text-white/30 uppercase tracking-[0.3em]"
          style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}
        >
          — End of lobby · Mock data —
        </div>
      </div>
    </section>
  );
}
