"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ActivityIcon,
  AlertTriangleIcon,
  ArrowLeftIcon,
  FlameIcon,
  RadioIcon,
  ShieldIcon,
  SkullIcon,
  TrophyIcon,
  UsersIcon,
} from "@/components/figma/icons";
import { CreateRoomModal } from "@/components/figma/create-room-modal";
import { HowItWorksModal } from "@/components/figma/how-it-works-modal";
import { TopNav } from "@/components/figma/top-nav";
import { createMockMatch, shortAddress } from "@/lib/mock/match";

type ArenaProps = {
  roomId: string;
};

type FeedEvent = {
  id: number;
  time: string;
  title: string;
  type: "elim" | "round" | "shield" | "start";
};

type Player = {
  addr: string;
  id: number;
  roundOut?: number;
  shield: boolean;
  shieldUsed?: boolean;
  state: "alive" | "eliminated" | "you";
};

export function Arena({ roomId }: ArenaProps) {
  const showShieldUi = false;
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const rawTimer = 12 - (now % 12);
  const imminent = rawTimer <= 3;
  const match = useMemo(() => createMockMatch(roomId, imminent, "arena"), [imminent, roomId]);
  const players = useMemo<Player[]>(
    () =>
      match.players.map((player) => ({
        id: player.id,
        addr: shortAddress(player.address),
        roundOut: player.roundOut || undefined,
        shield: player.shield,
        shieldUsed: player.shieldUsed,
        state: player.state,
      })),
    [match.players],
  );

  const feed = useMemo<FeedEvent[]>(
    () =>
      match.feed.filter((event) => showShieldUi || event.type !== "shield").map((event) => ({
        id: event.id,
        time: event.time,
        title: event.title,
        type: event.type === "milestone" ? "start" : event.type,
      })),
    [match.feed, showShieldUi],
  );

  return (
    <div className="min-h-screen w-full bg-[#07070b] text-white">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(110,86,249,0.08),transparent_60%),radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(110,86,249,0.05),transparent_60%)]" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <TopNav
          liveCount={6}
          onCreateRoom={() => setCreateOpen(true)}
          onFaucet={() => router.push("/faucet")}
          onHome={() => router.push("/")}
          onHowItWorks={() => setHowOpen(true)}
          onlineCount={match.alive}
          variant="arena"
        />

        <section className="relative flex-1 overflow-auto">
          {imminent ? (
            <div
              className="pointer-events-none fixed inset-0 z-10"
              style={{
                background: "radial-gradient(ellipse at center, rgba(255,59,92,0.12), transparent 60%)",
                animation: "arenaPulse 0.9s ease-in-out infinite",
              }}
            />
          ) : null}

          <div className="relative mx-auto max-w-[1440px] px-10 py-8 lg:px-16">
            <button
              className="mb-5 inline-flex items-center gap-2 text-white/60 transition-colors hover:text-white"
              onClick={() => router.push("/")}
              style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px" }}
              type="button"
            >
              <ArrowLeftIcon className="h-4 w-4" /> Back to Lobby
            </button>

            <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-6">
              <MetricCard label="Room" value={`#${String(roomId).padStart(3, "0")}`} />
              <MetricCard accent="#a274ff" label="Round" value={String(match.round)} />
              <MetricCard accent="#2ef7a0" label="Alive" value={String(match.alive)} />
              <MetricCard accent="#ff5353" label="Eliminated" value={String(match.eliminated)} />
              <MetricCard accent="#ffbe3b" label="Prize Pool" value={`${match.prize} USDC`} />
              <CountdownCard imminent={imminent} seconds={rawTimer} />
            </div>

            {imminent ? (
              <div
                className="relative mb-5 overflow-hidden rounded-[14px] border"
                style={{
                  background: "linear-gradient(90deg, rgba(255,59,92,0.22), rgba(255,59,92,0.06))",
                  borderColor: "rgba(255,59,92,0.5)",
                  boxShadow: "0 0 40px rgba(255,59,92,0.25), inset 0 1px 0 rgba(255,255,255,0.05)",
                  animation: "bannerShake 0.4s ease-in-out infinite alternate",
                }}
              >
                <div className="flex items-center justify-center gap-3 px-5 py-3">
                  <AlertTriangleIcon className="h-4 w-4 text-[#ff3b5c]" />
                  <div
                    className="text-[#ff5656] uppercase tracking-[0.25em]"
                    style={{ fontFamily: "Orbitron, sans-serif", fontSize: "13px", fontWeight: 800 }}
                  >
                    Elimination Incoming
                  </div>
                  <AlertTriangleIcon className="h-4 w-4 text-[#ff3b5c]" />
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div
                className="rounded-[16px] border border-white/8 p-5"
                style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))" }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div
                    className="flex items-center gap-2 text-white/55 uppercase tracking-[0.25em]"
                    style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
                  >
                    <UsersIcon className="h-3 w-3" /> Player Arena
                  </div>
                  <div className="text-white/45" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px" }}>
                    {match.alive}/{players.length} alive
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
                  {players.map((player) => (
                    <PlayerTile imminent={imminent} key={player.id} player={player} showShieldUi={showShieldUi} />
                  ))}
                </div>
              </div>

              <div
                className="flex max-h-[760px] flex-col overflow-hidden rounded-[16px] border border-white/8"
                style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))" }}
              >
                <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
                  <div
                    className="flex items-center gap-2 text-white/60 uppercase tracking-[0.25em]"
                    style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
                  >
                    <RadioIcon className="h-3 w-3 text-[#ff5a5a]" /> Live Feed
                  </div>
                  <span className="text-white/45" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px" }}>
                    {feed.length} events
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-auto p-4">
                  {feed.map((event) => (
                    <FeedCard event={event} key={event.id} />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <div className="rounded-[10px] border border-white/10 bg-white/5 px-3 py-2 text-white/70" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }}>
                UI-only mock arena
              </div>
              <button
                className="rounded-[10px] border border-white/10 bg-white/5 px-3 py-2 text-white/70"
                onClick={() => setNow(Math.floor(Date.now() / 1000))}
                style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }}
                type="button"
              >
                Reset Countdown
              </button>
            </div>
          </div>

          <style>{`
            @keyframes arenaPulse { 0%,100% { opacity:0.6 } 50% { opacity:1 } }
            @keyframes bannerShake { from { transform: translateX(-1px) } to { transform: translateX(1px) } }
          `}</style>
        </section>
      </div>

      <CreateRoomModal onClose={() => setCreateOpen(false)} open={createOpen} />
      <HowItWorksModal onClose={() => setHowOpen(false)} open={howOpen} />
    </div>
  );
}

function MetricCard({
  label,
  value,
  accent = "#ffffff",
}: {
  accent?: string;
  label: string;
  value: string;
}) {
  const icon =
    label === "Round" ? <ActivityIcon className="h-3 w-3" /> :
    label === "Alive" ? <UsersIcon className="h-3 w-3" /> :
    label === "Eliminated" ? <SkullIcon className="h-3 w-3" /> :
    label === "Prize Pool" ? <TrophyIcon className="h-3 w-3" /> :
    <RadioIcon className="h-3 w-3" />;

  return (
    <div className="relative overflow-hidden rounded-[12px] border border-white/8 bg-white/[0.02] px-4 py-3">
      <div className="absolute bottom-0 left-0 top-0 w-[3px]" style={{ background: accent, boxShadow: `0 0 10px ${accent}` }} />
      <div
        className="flex items-center gap-1.5 text-white/50 uppercase tracking-[0.2em]"
        style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px" }}
      >
        <span style={{ color: accent }}>{icon}</span>
        {label}
      </div>
      <div
        className="mt-1 text-white"
        style={{
          fontFamily: "Orbitron, sans-serif",
          fontSize: "18px",
          fontWeight: 700,
          letterSpacing: "-0.01em",
          color: accent === "#ffffff" ? "#fff" : accent,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function CountdownCard({ seconds, imminent }: { imminent: boolean; seconds: number }) {
  const safeSeconds = Math.max(0, Math.min(seconds, 12));
  const pct = (safeSeconds / 12) * 100;
  const color = imminent ? "#ff5353" : "#a274ff";

  return (
    <div
      className="relative flex items-center justify-center rounded-[12px] border px-4 py-3"
      style={{
        background: imminent ? "rgba(255,59,92,0.1)" : "rgba(110,86,249,0.08)",
        borderColor: imminent ? "rgba(255,59,92,0.4)" : "rgba(110,86,249,0.3)",
      }}
    >
      <svg className="-rotate-90" viewBox="0 0 40 40" style={{ height: "86px", width: "86px" }}>
        <circle cx="20" cy="20" fill="none" r="16" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
        <circle
          cx="20"
          cy="20"
          fill="none"
          r="16"
          stroke={color}
          strokeLinecap="round"
          strokeWidth="3.5"
          style={{
            strokeDasharray: "100",
            strokeDashoffset: `${100 - pct}`,
            filter: `drop-shadow(0 0 6px ${color})`,
            transition: "stroke-dashoffset 1s linear",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-white" style={{ fontFamily: "Orbitron, sans-serif", fontSize: "28px", fontWeight: 800, color }}>
          {safeSeconds}
        </div>
        <div className="text-white/40" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "8px", letterSpacing: "0.24em" }}>
          SEC
        </div>
      </div>
    </div>
  );
}

function PlayerTile({
  player,
  imminent,
  showShieldUi,
}: {
  imminent: boolean;
  player: Player;
  showShieldUi: boolean;
}) {
  const active = player.state !== "eliminated";
  const danger = imminent && active;

  return (
    <div
      className="relative flex h-[88px] flex-col items-center justify-between rounded-[12px] border p-2.5 transition-transform duration-300"
      style={{
        background: active ? "rgba(34,228,199,0.06)" : "rgba(255,255,255,0.02)",
        borderColor: player.state === "you" ? "#a274ff" : active ? "rgba(34,228,199,0.25)" : "rgba(255,255,255,0.06)",
        boxShadow: player.state === "you" ? "0 0 0 1px rgba(162,116,255,0.55), 0 0 18px rgba(162,116,255,0.25)" : danger ? "0 0 16px rgba(255,59,92,0.18)" : "0 0 0 1px rgba(255,255,255,0.02)",
        opacity: active ? 1 : 0.45,
      }}
    >
      {player.state === "you" ? (
        <div className="absolute -top-2 rounded-full bg-[#a274ff] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-black">
          You
        </div>
      ) : null}
      <div
        className="flex h-10 w-10 items-center justify-center rounded-[8px] text-white"
        style={{
          background: active ? "linear-gradient(135deg, #2ef7a0, #16c6b3)" : "rgba(255,255,255,0.08)",
          boxShadow: active ? "0 0 12px rgba(34,228,199,0.45)" : "none",
          color: player.state === "you" ? "#fff" : "#020202",
          fontFamily: "Orbitron, sans-serif",
          fontSize: "12px",
          fontWeight: 800,
        }}
      >
        {player.addr.slice(2, 4).toUpperCase()}
      </div>
      <div className="text-center">
        <div className="text-white/85" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }}>
          {player.addr}
        </div>
        <div className="mt-1 flex items-center justify-center gap-1.5 text-white/45" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px" }}>
          {showShieldUi ? <ShieldIcon className="h-3 w-3" /> : null}
          {player.state === "eliminated" ? `R${player.roundOut ?? 0}` : active ? "Alive" : "Out"}
        </div>
      </div>
    </div>
  );
}

function FeedCard({ event }: { event: FeedEvent }) {
  const map =
    event.type === "round"
      ? { color: "#f5b544", bg: "rgba(245,181,68,0.08)", border: "rgba(245,181,68,0.25)", icon: <FlameIcon className="h-3.5 w-3.5" /> }
      : event.type === "shield"
        ? { color: "#22e4c7", bg: "rgba(34,228,199,0.08)", border: "rgba(34,228,199,0.25)", icon: <ShieldIcon className="h-3.5 w-3.5" /> }
        : event.type === "start"
          ? { color: "#6e56f9", bg: "rgba(110,86,249,0.08)", border: "rgba(110,86,249,0.25)", icon: <ActivityIcon className="h-3.5 w-3.5" /> }
          : { color: "#ff5353", bg: "rgba(255,59,92,0.08)", border: "rgba(255,59,92,0.25)", icon: <SkullIcon className="h-3.5 w-3.5" /> };

  return (
    <div className="rounded-[12px] border p-3" style={{ background: map.bg, borderColor: map.border }}>
      <div className="flex items-center gap-2">
        <span style={{ color: map.color }}>{map.icon}</span>
        <div className="flex-1">
          <div className="text-white" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12.5px" }}>
            {event.title}
          </div>
          <div className="mt-1 text-white/45" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px" }}>
            {event.time}
          </div>
        </div>
      </div>
    </div>
  );
}
