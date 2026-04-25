"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatUnits } from "viem";
import { useReadContract } from "wagmi";

import {
  ActivityIcon,
  AlertTriangleIcon,
  ArrowLeftIcon,
  CrownIcon,
  EyeIcon,
  FlameIcon,
  HeartIcon,
  RadioIcon,
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
import { mockUsdcContract } from "@/lib/contracts/config";
import { formatWallet } from "@/lib/network";
import { useRoomState } from "@/lib/room-state";

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
  const roomQuery = useRoomState(roomId);
  const decimalsQuery = useReadContract({
    ...mockUsdcContract,
    chainId: 10143,
    functionName: "decimals",
  });

  useEffect(() => {
    const id = window.setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => window.clearInterval(id);
  }, []);

  const decimals = Number(decimalsQuery.data ?? 6);
  const gameInfo = roomQuery.data?.gameInfo;
  const rawTimer = gameInfo ? Math.max(0, Number(gameInfo.nextRoundTime) - now) : 0;
  const timer = rawTimer > 0 ? rawTimer : 12;
  const imminent = rawTimer > 0 && rawTimer <= 3;
  const players = useMemo<Player[]>(
    () =>
      (roomQuery.data?.players ?? []).map((player, index) => ({
        id: index + 1,
        addr: formatWallet(player.address),
        roundOut: player.eliminatedAtRound || undefined,
        shield: false,
        shieldUsed: false,
        state: player.isAlive ? "alive" : "eliminated",
      })),
    [roomQuery.data?.players],
  );

  const alive = players.filter((p) => p.state === "alive").length;
  const eliminated = players.length - alive;
  const prize = gameInfo ? formatUnits(gameInfo.prizePool, decimals) : "0";
  const round = gameInfo ? Number(gameInfo.currentRound) : 0;
  const rawFeed: FeedEvent[] = imminent
    ? [
        { id: 1, type: "round", text: `Room #${roomId} entering Round ${round + 1}`, time: "now" },
        { id: 2, type: "milestone", text: "Top half of the room has been cut", time: "8s" },
        { id: 3, type: "shield", text: "0x2a2f...0054 shield blocked elimination", time: "19s" },
        { id: 4, type: "elim", text: "0x2025...0050 eliminated in Round 6", time: "21s" },
      ]
    : [
        { id: 1, type: "round", text: roomQuery.isLoading ? "Loading room..." : `Room #${roomId} Round ${round} live`, time: "now" },
        { id: 2, type: "milestone", text: `${alive} players still alive`, time: "live" },
        ...players.filter((player) => player.state === "eliminated").slice(0, 2).map((player, index) => ({
          id: index + 3,
          type: "elim" as const,
          text: `${player.addr} eliminated`,
          time: `R${player.roundOut ?? round}`,
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
                  <span
                    className="flex items-center gap-1.5 text-white/50"
                    style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }}
                  >
                    <RadioIcon className="h-3 w-3" /> {alive} tracked
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="h-9 rounded-[10px] border border-white/10 bg-white/[0.03] px-3.5 text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
                  onClick={() => setNow((gameInfo ? Number(gameInfo.nextRoundTime) : Math.floor(Date.now() / 1000)) - 3)}
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
              <MetricCard accent="#6e56f9" icon={<ActivityIcon className="h-3 w-3" />} label="Round" value={String(round)} />
              <MetricCard accent="#22e4c7" icon={<UsersIcon className="h-3 w-3" />} label="Alive" value={String(alive).padStart(2, "0")} />
              <MetricCard accent="#ff3b5c" icon={<SkullIcon className="h-3 w-3" />} label="Eliminated" value={String(eliminated).padStart(2, "0")} />
              <MetricCard accent="#f5b544" icon={<TrophyIcon className="h-3 w-3" />} label="Prize Pool" value={`${prize} USDC`} />
              <CountdownCard imminent={imminent} seconds={timer} />
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
                    <div
                      className="text-white/70"
                      style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12px" }}
                    >
                      {Math.max(1, Math.round(alive * 0.2))} wallets will be eliminated in {timer}s. Eyes on the board.
                    </div>
                  </div>
                  <FlameIcon className="h-5 w-5 text-[#ff3b5c]" />
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="rounded-[16px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div
                    className="flex items-center gap-2 text-white/55 uppercase tracking-[0.25em]"
                    style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
                  >
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
                  <div
                    className="mb-2 flex items-center gap-1.5 text-white/45 uppercase tracking-[0.22em]"
                    style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}
                  >
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
                    <div
                      className="flex items-center gap-2 text-white/60 uppercase tracking-[0.25em]"
                      style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
                    >
                      <EyeIcon className="h-3 w-3" /> Live Feed
                    </div>
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff3b5c]" />
                      <span
                        className="text-[#ff3b5c] uppercase tracking-[0.2em]"
                        style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px", fontWeight: 600 }}
                      >
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
                      <div
                        className="text-white"
                        style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "13px", fontWeight: 600 }}
                      >
                        0x5f44...aa10
                      </div>
                      <div
                        className="mt-0.5 flex items-center gap-1 text-white/50"
                        style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "11px" }}
                      >
                        <HeartIcon className="h-3 w-3 text-[#ff3b5c]" /> 812 watchers this match
                      </div>
                    </div>
                    <TrendingUpIcon className="h-4 w-4 text-[#22e4c7]" />
                  </div>
                </SpectatorCard>

                <SpectatorCard accent="#6e56f9" badge="Coming Soon" icon={<SparklesIcon className="h-3.5 w-3.5" />} label="Prediction Market">
                  <div
                    className="text-white/70"
                    style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12px", lineHeight: 1.5 }}
                  >
                    Bet on who survives. Odds update after every cut.
                  </div>
                  <button
                    className="mt-2.5 h-8 w-full cursor-not-allowed rounded-[8px] border border-[#6e56f9]/30 bg-[#6e56f9]/10 text-[#b9aaff]/80"
                    disabled
                    style={{ fontFamily: "Orbitron, sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em" }}
                    type="button"
                  >
                    NOTIFY ME
                  </button>
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

function LiveBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-[#ff3b5c]/50 bg-[#ff3b5c]/12 px-2.5 py-1">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff3b5c] shadow-[0_0_8px_#ff3b5c]" />
      <span
        className="text-[#ff3b5c] uppercase tracking-[0.22em]"
        style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 700 }}
      >
        Live
      </span>
    </div>
  );
}

function MetricCard({
  accent,
  icon,
  label,
  value,
}: {
  accent: string;
  icon: ReactNode;
  label: string;
  value: string;
}) {
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
        style={{ color: accent, fontFamily: "Orbitron, sans-serif", fontSize: "18px", fontWeight: 700 }}
      >
        {value}
      </div>
    </div>
  );
}

function CountdownCard({ seconds, imminent }: { imminent: boolean; seconds: number }) {
  const safeSeconds = Math.min(seconds, 12);
  const pct = (safeSeconds / 12) * 100;
  const color = imminent ? "#ff5353" : "#a274ff";

  return (
    <div
      className="relative flex items-center justify-center rounded-[12px] border px-4 py-3"
      style={{ background: imminent ? "rgba(255,59,92,0.1)" : "rgba(110,86,249,0.08)", borderColor: imminent ? "rgba(255,59,92,0.4)" : "rgba(110,86,249,0.3)" }}
    >
      <svg className="-rotate-90" style={{ height: "86px", width: "86px" }} viewBox="0 0 40 40">
        <circle cx="20" cy="20" fill="none" r="16" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
        <circle
          cx="20"
          cy="20"
          fill="none"
          r="16"
          stroke={color}
          strokeDasharray={`${(pct / 100) * 100.5} 100.5`}
          strokeLinecap="round"
          strokeWidth="3"
          style={{ filter: `drop-shadow(0 0 4px ${color})`, transition: "stroke-dasharray 0.9s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center" style={{ color, fontFamily: "Orbitron, sans-serif", fontSize: "28px", fontWeight: 800 }}>
          {safeSeconds}
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      <span className="text-white/45" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}>
        {label}
      </span>
    </div>
  );
}

function PlayerTile({ player, imminent, showShieldUi }: { imminent: boolean; player: Player; showShieldUi: boolean }) {
  const eliminated = player.state === "eliminated";
  const borderColor = eliminated ? "rgba(255,255,255,0.06)" : imminent ? "rgba(255,59,92,0.32)" : "rgba(34,228,199,0.35)";
  const glow = eliminated ? "none" : imminent ? "0 0 16px rgba(255,59,92,0.2)" : "0 0 16px rgba(34,228,199,0.22)";

  return (
    <div
      className="rounded-[14px] border p-3 transition-all"
      style={{ background: eliminated ? "rgba(255,255,255,0.015)" : "rgba(10,18,18,0.65)", borderColor, boxShadow: glow, opacity: eliminated ? 0.38 : 1 }}
    >
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center"
        style={{
          clipPath: "polygon(25% 6%, 75% 6%, 94% 50%, 75% 94%, 25% 94%, 6% 50%)",
          background: eliminated ? "rgba(255,255,255,0.08)" : "#22e4c7",
          color: eliminated ? "rgba(255,255,255,0.35)" : "#071012",
          fontFamily: "Orbitron, sans-serif",
          fontSize: "18px",
          fontWeight: 800,
        }}
      >
        {player.id.toString(16).toUpperCase().slice(-2)}
      </div>
      <div
        className="mt-3 text-center text-white/60"
        style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }}
      >
        {player.addr}
      </div>
      <div className="mt-2 flex items-center justify-center gap-1.5">
        {showShieldUi && player.shield ? (
          <span className="text-[#58baff]" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}>
            SHIELD
          </span>
        ) : null}
        {showShieldUi && player.shieldUsed ? (
          <span className="text-white/30" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}>
            USED
          </span>
        ) : null}
        {player.roundOut ? <span className="text-white/25" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}>R{player.roundOut}</span> : null}
      </div>
    </div>
  );
}

function FeedCard({ event }: { event: FeedEvent }) {
  const map = {
    elim: { border: "rgba(255,59,92,0.35)", bg: "rgba(255,59,92,0.08)", color: "#ff5d70", icon: <SkullIcon className="h-3.5 w-3.5" /> },
    round: { border: "rgba(245,181,68,0.35)", bg: "rgba(245,181,68,0.08)", color: "#f5b544", icon: <FlameIcon className="h-3.5 w-3.5" /> },
    shield: { border: "rgba(88,186,255,0.35)", bg: "rgba(88,186,255,0.08)", color: "#58baff", icon: <SparklesIcon className="h-3.5 w-3.5" /> },
    milestone: { border: "rgba(110,86,249,0.35)", bg: "rgba(110,86,249,0.08)", color: "#b9aaff", icon: <TimerIcon className="h-3.5 w-3.5" /> },
  }[event.type];

  return (
    <div className="rounded-[14px] border p-3.5" style={{ borderColor: map.border, background: map.bg }}>
      <div className="flex items-start gap-2.5">
        <div style={{ color: map.color }}>{map.icon}</div>
        <div className="min-w-0 flex-1">
          <div
            className="text-white"
            style={{ color: map.color, fontFamily: "Space Grotesk, sans-serif", fontSize: "13px", fontWeight: 600 }}
          >
            {event.text}
          </div>
          <div
            className="mt-1 text-white/45"
            style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}
          >
            {event.time}
          </div>
        </div>
      </div>
    </div>
  );
}

function SpectatorCard({
  accent,
  badge,
  children,
  icon,
  label,
}: {
  accent: string;
  badge?: string;
  children: ReactNode;
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-[16px] border border-white/8 bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div
          className="flex items-center gap-1.5 uppercase tracking-[0.22em]"
          style={{ color: accent, fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
        >
          {icon} {label}
        </div>
        {badge ? (
          <span
            className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-white/55"
            style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px" }}
          >
            {badge}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}
