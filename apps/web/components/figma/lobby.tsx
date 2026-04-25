"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { SearchIcon, SlidersHorizontalIcon } from "@/components/figma/icons";
import { RoomCard, type RoomStatus } from "@/components/figma/room-card";
import { mockRooms, type MockRoom } from "@/lib/mock/rooms";

const FILTERS: { key: "all" | RoomStatus; label: string }[] = [
  { key: "all", label: "All Rooms" },
  { key: "live", label: "Live" },
  { key: "waiting", label: "Waiting" },
  { key: "finished", label: "Finished" },
];

export function Lobby({
  onCreateRoom,
  onJoin,
  onSpectate,
}: {
  onCreateRoom?: () => void;
  onJoin?: (roomId: number) => void;
  onSpectate?: (roomId: number) => void;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | RoomStatus>("all");

  const rooms = useMemo(() => mockRooms.map(mapRoom).filter((room) => filter === "all" || room.status === filter), [filter]);

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

      <div className="relative mx-auto max-w-[1440px] px-10 py-10 lg:px-16">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div
              className="mb-2 text-[#6e56f9] uppercase tracking-[0.3em]"
              style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
            >
              {"// Lobby"}
            </div>
            <h1
              className="text-white"
              style={{
                fontFamily: "Orbitron, sans-serif",
                fontSize: "36px",
                fontWeight: 800,
                letterSpacing: "-0.01em",
              }}
            >
              Choose Your Arena.
            </h1>
            <p
              className="mt-2 max-w-[520px] text-white/50"
              style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "14px", lineHeight: 1.6 }}
            >
              Join a live room, wait in queue, or spectate a match in progress. Everything here is UI-only for the commit branch.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-10 w-[240px] items-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.03] px-3.5">
              <SearchIcon className="h-3.5 w-3.5 text-white/40" />
              <input
                className="flex-1 bg-transparent text-white outline-none placeholder:text-white/30"
                placeholder="Search room #"
                style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px" }}
              />
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.03] text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white">
              <SlidersHorizontalIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mb-6 flex w-fit items-center gap-1.5 rounded-[12px] border border-white/8 bg-white/[0.02] p-1">
          {FILTERS.map((filterOption) => {
            const active = filter === filterOption.key;
            const count =
              filterOption.key === "all"
                ? rooms.length
                : rooms.filter((room) => room.status === filterOption.key).length;

            return (
              <button
                key={filterOption.key}
                className="flex items-center gap-2 rounded-[8px] px-3.5 py-1.5 transition-colors"
                onClick={() => setFilter(filterOption.key)}
                style={{
                  background: active ? "rgba(110,86,249,0.18)" : "transparent",
                  color: active ? "#ffffff" : "rgba(255,255,255,0.55)",
                  border: active ? "1px solid rgba(110,86,249,0.4)" : "1px solid transparent",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "12px",
                  fontWeight: 500,
                }}
                type="button"
              >
                {filterOption.label}
                <span
                  className="rounded-md px-1.5 py-0.5"
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              onJoin={() => void (onJoin ? onJoin(Number(room.id)) : router.push(`/arena/${room.id}`))}
              onSpectate={() =>
                onSpectate ? onSpectate(Number(room.id)) : router.push(`/arena/${room.id}?mode=spectate`)
              }
              primaryLabel={room.status === "FINISHED" ? "CLOSED" : room.status === "LIVE NOW" ? "WATCH" : "JOIN ROOM"}
              room={room}
            />
          ))}
        </div>

        <div
          className="mt-10 text-center text-white/30 uppercase tracking-[0.3em]"
          style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}
        >
          — UI-only mock rooms —
        </div>
      </div>
    </section>
  );
}

function mapRoom(room: MockRoom) {
  return {
    id: Number(room.id),
    status: room.status === "LIVE NOW" ? "live" : room.status === "WAITING" ? "waiting" : "finished",
    prize: room.prizePool,
    entry: room.entry,
    players: room.players,
    maxPlayers: room.maxPlayers,
    elimPct: Number(room.eliminationRate.replace("%", "")),
    interval: `${room.roundSeconds}s`,
    round: undefined,
  } as const;
}
