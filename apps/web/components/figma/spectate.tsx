"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ActivityIcon,
  AlertTriangleIcon,
  ArrowLeftIcon,
  CrownIcon,
  EyeIcon,
  FlameIcon,
  HeartIcon,
  RadioIcon,
  ShieldIcon,
  SkullIcon,
  SparklesIcon,
  TimerIcon,
  TrendingUpIcon,
  TrophyIcon,
  UsersIcon,
} from "@/components/figma/icons";
import { CreateRoomModal } from "@/components/figma/create-room-modal";
import { HowItWorksModal } from "@/components/figma/how-it-works-modal";
import { TopNav } from "@/components/figma/top-nav";
import { createMockMatch, shortAddress } from "@/lib/mock/match";

type SpectateProps = {
  roomId: string;
};

type FeedEvent = {
  id: number;
  text: string;
  time: string;
  type: "elim" | "round" | "shield" | "milestone";
};

type Player = {
  addr: string;
  id: number;
  roundOut?: number;
  shield: boolean;
  shieldUsed?: boolean;
  state: "alive" | "eliminated";
};

export function Spectate({ roomId }: SpectateProps) {
  const showShieldUi = false;
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const id = window.setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => window.clearInterval(id);
  }, []);

  const rawTimer = 12 - (now % 12);
  const imminent = rawTimer <= 3;
  const match = useMemo(() => createMockMatch(roomId, imminent, "spectate"), [imminent, roomId]);
  const players = useMemo<Player[]>(
    () =>
      match.players.map((player) => ({
        id: player.id,
        addr: shortAddress(player.address),
        roundOut: player.roundOut || undefined,
        shield: player.shield,
        shieldUsed: player.shieldUsed,
        state: player.state === "eliminated" ? "eliminated" : "alive",
      })),
    [match.players],
  );

  const alive = players.filter((p) => p.state === "alive").length;
  const eliminated = players.length - alive;
  const rawFeed: FeedEvent[] = imminent
    ? [
        { id: 1, type: "round", text: `Room #${roomId} entering Round ${match.round + 1}`, time: "now" },
        { id: 2, type: "milestone", text: "Top half of the room has been cut", time: "8s" },
        { id: 3, type: "shield", text: "Shield blocked elimination", time: "19s" },
        { id: 4, type: "elim", text: "A player eliminated in Round 6", time: "21s" },
      ]
    : [
        { id: 1, type: "round", text: `Room #${roomId} Round ${match.round} live`, time: "now" },
        { id: 2, type: "milestone", text: `${alive} players still alive`, time: "live" },
        ...players
          .filter((player) => player.state === "eliminated")
          .slice(0, 2)
          .map((player, index) => ({
            id: index + 3,
            type: "elim" as const,
            text: `${player.addr} eliminated`,
            time: `R${player.roundOut ?? match.round}`,
          })),
      ];

  const feed = rawFeed.filter((event) => showShieldUi || event.type !== "shield");

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
          onlineCount={alive}
          variant="spectate"
        />

        <section className="relative flex-1 overflow-auto">
          {imminent ? (
            <div
              className="pointer-events-none fixed inset-0 z-10"
              style={{ background: "radial-gradient(ellipse at center, rgba(255,59,92,0.12), transparent 60%)", animation: "arenaPulse 0.9s ease-in-out infinite" }}
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

            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div
                  className="mb-1 flex items-center gap-2 uppercase tracking-[0.3em]"
                  style={{ color: imminent ? "#ff3b5c" : "#6e56f9", fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
                >
                  <EyeIcon className="h-3 w-3" /> {"// Spectator Mode"}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <h1
                    className="text-white"
                    style={{ fontFamily: "Orbitron, sans-serif", fontSize: "32px", fontWeight: 800, letterSpacing: "-0.01em" }}
                  >
                    Room #{String(roomId).padStart(4, "0")}
                  </h1>
                  <LiveBadge />
                  <span className="flex items-center gap-1.5 text-white/50" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }}>
                    <RadioIcon className="h-3 w-3" /> {alive} tracked
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="h-9 rounded-[10px] border border-white/10 bg-white/[0.03] px-3.5 text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
                  onClick={() => setNow(0)}
                  style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }}
                  type="button"
                >
                  High Tension
                </button>
                <button
                  className="h-9 rounded-[10px] border border-white/10 bg-white/[0.03] px-3.5 text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
                  onClick={() => setNow(Math.floor(Date.now() / 1000))}
                  style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }}
                  type="button"
                >
                  Standard
                </button>
              </div>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
              <MetricCard accent="#6e56f9" icon={<ActivityIcon className="h-3 w-3" />} label="Round" value={String(match.round)} />
              <MetricCard accent="#22e4c7" icon={<UsersIcon className="h-3 w-3" />} label="Alive" value={String(alive).padStart(2, "0")} />
              <MetricCard accent="#ff3b5c" icon={<SkullIcon className="h-3 w-3" />} label="Eliminated" value={String(eliminated).padStart(2, "0")} />
              <MetricCard accent="#f5b544" icon={<TrophyIcon className="h-3 w-3" />} label="Prize Pool" value={`${match.prize} USDC`} />
              <CountdownCard imminent={imminent} seconds={rawTimer} />
            </div>

            {imminent ? (
              <div
                className="relative mb-5 overflow-hidden rounded-[14px] border"
                style={{
                  background: "linear-gradient(90deg, rgba(255,59,92,0.22), rgba(255,59,92,0.06))",
                  borderColor: "rgba(255,59,92,0.5)",
                  boxShadow: "0 0 40px rgba(255,59,92,0.25)",
                  animation: "bannerShake 0.4s ease-in-out infinite alternate",
                }}
              >
                <div className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#ff3b5c]/50 bg-[#ff3b5c]/20">
                    <AlertTriangleIcon className="h-4 w-4 text-[#ff3b5c]" />
                  </div>
                  <div className="flex-1">
                    <div
                      className="text-[#ff3b5c] uppercase tracking-[0.25em]"
                      style={{ fontFamily: "Orbitron, sans-serif", fontSize: "13px", fontWeight: 800 }}
                    >
                      Next Cut Imminent
                    </div>
                    <div className="text-white/70" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12px" }}>
                      {Math.max(1, Math.round(alive * 0.2))} wallets will be eliminated in {rawTimer}s. Eyes on the board.
                    </div>
                  </div>
                  <FlameIcon className="h-5 w-5 text-[#ff3b5c]" />
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="rounded-[16px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/55 uppercase tracking-[0.25em]" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}>
                    <UsersIcon className="h-3 w-3" /> Arena Board · Spectating
                  </div>
                  <div className="flex items-center gap-3">
                    <Legend color="#22e4c7" label="Alive" />
                    <Legend color="rgba(255,255,255,0.2)" label="Out" />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6 md:grid-cols-8 xl:grid-cols-9">
                  {players.map((player) => (
                    <PlayerTile imminent={imminent} key={player.id} player={player} showShieldUi={showShieldUi} />
                  ))}
                </div>

                <div className="mt-5 border-t border-white/5 pt-4">
                  <div className="mb-2 flex items-center gap-1.5 text-white/45 uppercase tracking-[0.22em]" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}>
                    <SkullIcon className="h-3 w-3 text-[#ff3b5c]" /> Recently Eliminated
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto">
                    {players
                      .filter((player) => player.state === "eliminated")
                      .slice(0, 6)
                      .map((player) => (
                        <span
                          className="whitespace-nowrap rounded-md border border-[#ff3b5c]/20 bg-[#ff3b5c]/5 px-2.5 py-1 text-white/50"
                          key={player.id}
                          style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}
                        >
                          {player.addr}
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex max-h-[380px] flex-col overflow-hidden rounded-[16px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]">
                  <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                    <div className="flex items-center gap-2 text-white/60 uppercase tracking-[0.25em]" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}>
                      <EyeIcon className="h-3 w-3" /> Live Feed
                    </div>
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff3b5c]" />
                      <span className="text-[#ff3b5c] uppercase tracking-[0.2em]" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px", fontWeight: 600 }}>
                        Rec
                      </span>
                    </span>
                  </div>
                  <div className="flex-1 space-y-2 overflow-auto p-3">
                    {feed.map((event) => (
                      <FeedCard event={event} key={event.id} />
                    ))}
                  </div>
                </div>

                <SpectatorCard accent="#f5b544" badge="Focus" icon={<CrownIcon className="h-3.5 w-3.5" />} label="Most Watched Player">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-[10px]"
                      style={{ background: "linear-gradient(135deg, #f5b544, #f97316)", boxShadow: "0 0 16px rgba(245,181,68,0.4)" }}
                    />
                    <div className="flex-1">
                      <div className="text-white" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "13px", fontWeight: 600 }}>
                        0x5f44...aa10
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 text-white/50" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "11px" }}>
                        <HeartIcon className="h-3 w-3 text-[#ff3b5c]" /> 812 watchers this match
                      </div>
                    </div>
                    <TrendingUpIcon className="h-4 w-4 text-[#22e4c7]" />
                  </div>
                </SpectatorCard>

                <SpectatorCard accent="#22e4c7" badge="Pulse" icon={<SparklesIcon className="h-3.5 w-3.5" />} label="Live Reactions">
                  <div className="grid grid-cols-3 gap-2">
                    <ReactionEmoji symbol="🔥" count="240" />
                    <ReactionEmoji symbol="⚔️" count="133" />
                    <ReactionEmoji symbol="👀" count="91" />
                  </div>
                </SpectatorCard>

                <SpectatorCard accent="#ff5a5a" badge="Soon" icon={<TimerIcon className="h-3.5 w-3.5" />} label="Prediction Market Coming Soon">
                  <p className="text-white/60" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12px", lineHeight: 1.5 }}>
                    Spectators will soon be able to predict who survives the next elimination and how fast the room collapses.
                  </p>
                </SpectatorCard>
              </div>
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
      <div className="flex items-center gap-1.5 text-white/50 uppercase tracking-[0.2em]" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px" }}>
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
    <div className="relative flex items-center justify-center rounded-[12px] border px-4 py-3" style={{ background: imminent ? "rgba(255,59,92,0.1)" : "rgba(110,86,249,0.08)", borderColor: imminent ? "rgba(255,59,92,0.4)" : "rgba(110,86,249,0.3)" }}>
      <svg className="-rotate-90" viewBox="0 0 40 40" style={{ height: "86px", width: "86px" }}>
        <circle cx="20" cy="20" fill="none" r="16" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
        <circle cx="20" cy="20" fill="none" r="16" stroke={color} strokeLinecap="round" strokeWidth="3.5" style={{ strokeDasharray: "100", strokeDashoffset: `${100 - pct}`, filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dashoffset 1s linear" }} />
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
        : event.type === "milestone"
          ? { color: "#6e56f9", bg: "rgba(110,86,249,0.08)", border: "rgba(110,86,249,0.25)", icon: <SparklesIcon className="h-3.5 w-3.5" /> }
          : { color: "#ff5353", bg: "rgba(255,59,92,0.08)", border: "rgba(255,59,92,0.25)", icon: <SkullIcon className="h-3.5 w-3.5" /> };

  return (
    <div className="rounded-[12px] border p-3" style={{ background: map.bg, borderColor: map.border }}>
      <div className="flex items-center gap-2">
        <span style={{ color: map.color }}>{map.icon}</span>
        <div className="flex-1">
          <div className="text-white" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12.5px" }}>
            {event.text}
          </div>
          <div className="mt-1 text-white/45" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px" }}>
            {event.time}
          </div>
        </div>
      </div>
    </div>
  );
}

function SpectatorCard({
  badge,
  icon,
  label,
  children,
  accent,
}: {
  accent: string;
  badge: string;
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[16px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px]" style={{ background: `${accent}20`, color: accent }}>
            {icon}
          </div>
          <div>
            <div className="text-white/55 uppercase tracking-[0.2em]" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px" }}>
              {badge}
            </div>
            <div className="text-white" style={{ fontFamily: "Orbitron, sans-serif", fontSize: "13px", fontWeight: 700 }}>
              {label}
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

function ReactionEmoji({ symbol, count }: { symbol: string; count: string }) {
  return (
    <div className="flex items-center justify-between rounded-[10px] border border-white/8 bg-black/20 px-3 py-2">
      <span className="text-[18px]">{symbol}</span>
      <span className="text-white" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", fontWeight: 600 }}>
        {count}
      </span>
    </div>
  );
}

function LiveBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#6e56f9]" />
      <span className="text-[#b9aaff] uppercase tracking-[0.2em]" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}>
        Live
      </span>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      <span className="text-white/45 uppercase tracking-[0.18em]" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px" }}>
        {label}
      </span>
    </div>
  );
}
