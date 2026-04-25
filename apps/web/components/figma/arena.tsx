"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";

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
import { mockUsdcContract } from "@/lib/contracts/config";
import { formatWallet } from "@/lib/network";
import { useRoomState } from "@/lib/room-state";

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

type ArenaSnapshot = {
  roomAddress: string;
  gameInfo: {
    status: number;
    currentRound: bigint;
    prizePool: bigint;
    playersAlive: bigint;
    totalPlayers: bigint;
    winner: string;
    lastRoundTime: bigint;
    nextRoundTime: bigint;
    entryFee: bigint;
    minPlayers: bigint;
    maxPlayers: bigint;
  };
  allPlayers: string[];
  alivePlayers: string[];
  players: {
    address: string;
    hasJoined: boolean;
    isAlive: boolean;
    eliminatedAtRound: number;
  }[];
};

const DEMO_ROOM_ID = "1";
const DEMO_ROOM_ADDRESS = "0xaddbeBf119a6CB87e2E221ed3cE8cFf35aB3c774" as const;
const DEMO_ENTRY_RAW = 1_000_000n;
const DEMO_MIN_PLAYERS = 8n;
const DEMO_MAX_PLAYERS = 10n;
const DEMO_INTERVAL_SECONDS = 5;
const DEMO_ELIMINATION_PCT = 25;

function buildDemoPlayers() {
  return [
    "0xa11ce00000000000000000000000000000000001",
    "0xb0b0000000000000000000000000000000000002",
    "0xc0de000000000000000000000000000000000003",
    "0xd00d000000000000000000000000000000000004",
    "0xe1e1000000000000000000000000000000000005",
    "0xf00d000000000000000000000000000000000006",
    "0xabc0000000000000000000000000000000000007",
    "0xdef0000000000000000000000000000000000008",
  ] as string[];
}

function buildDemoAlive(players: string[], roundsElapsed: number) {
  const eliminatedCount = Math.min(
    players.length - 1,
    Math.max(0, Math.floor(roundsElapsed * (players.length * (DEMO_ELIMINATION_PCT / 100)))),
  );
  return players.slice(eliminatedCount);
}

export function Arena({ roomId }: ArenaProps) {
  const showShieldUi = false;
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [demoStartedAt] = useState(() => Math.floor(Date.now() / 1000) - 6);
  const { address } = useAccount();
  const roomQuery = useRoomState(roomId);
  const decimalsQuery = useReadContract({
    ...mockUsdcContract,
    chainId: 10143,
    functionName: "decimals",
  });

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const decimals = Number(decimalsQuery.data ?? 6);
  const demoSnapshot = useMemo<ArenaSnapshot | null>(() => {
    if (roomId !== DEMO_ROOM_ID) return null;

    const players = buildDemoPlayers();
    const elapsed = Math.max(0, now - demoStartedAt);
    const roundsElapsed = Math.floor(elapsed / DEMO_INTERVAL_SECONDS);
    const countdown = DEMO_INTERVAL_SECONDS - (elapsed % DEMO_INTERVAL_SECONDS || DEMO_INTERVAL_SECONDS);
    const alivePlayers = buildDemoAlive(players, roundsElapsed);
    const eliminatedPlayers = players.filter((player) => !alivePlayers.includes(player));
    const winner = alivePlayers.length === 1 ? alivePlayers[0] : "0x0000000000000000000000000000000000000000";
    const status = alivePlayers.length === 1 ? 2 : 1;

    return {
      roomAddress: DEMO_ROOM_ADDRESS,
      gameInfo: {
        status,
        currentRound: BigInt(roundsElapsed),
        prizePool: BigInt(players.length * 1_000_000),
        playersAlive: BigInt(alivePlayers.length),
        totalPlayers: BigInt(players.length),
        winner,
        lastRoundTime: BigInt(now - (elapsed % 5)),
        nextRoundTime: BigInt(now + countdown),
        entryFee: DEMO_ENTRY_RAW,
        minPlayers: DEMO_MIN_PLAYERS,
        maxPlayers: DEMO_MAX_PLAYERS,
      },
      allPlayers: players,
      alivePlayers,
      players: players.map((player, index) => ({
        address: player,
        hasJoined: true,
        isAlive: alivePlayers.includes(player),
        eliminatedAtRound: alivePlayers.includes(player)
          ? 0
          : Math.max(1, Math.ceil((index + 1) / 2)),
      })),
    };
  }, [demoStartedAt, now, roomId]);

  const roomData = roomQuery.data ?? demoSnapshot;
  const gameInfo = roomData?.gameInfo;
  const rawTimer = gameInfo ? Math.max(0, Number(gameInfo.nextRoundTime) - now) : 0;
  const timer = rawTimer > 0 ? rawTimer : DEMO_INTERVAL_SECONDS;
  const imminent = rawTimer > 0 && rawTimer <= 3;
  const alive = gameInfo ? Number(gameInfo.playersAlive) : 0;
  const eliminated = gameInfo ? Number(gameInfo.totalPlayers) - Number(gameInfo.playersAlive) : 0;
  const prize = gameInfo ? formatUnits(gameInfo.prizePool, decimals) : "0";
  const round = gameInfo ? Number(gameInfo.currentRound) : 0;
  const players = useMemo<Player[]>(
    () =>
      (roomData?.players ?? []).map((player, index) => ({
        id: index + 1,
        addr: formatWallet(player.address),
        roundOut: player.eliminatedAtRound || undefined,
        shield: false,
        shieldUsed: false,
        state:
          address && player.address.toLowerCase() === address.toLowerCase()
            ? "you"
            : player.isAlive
              ? "alive"
              : "eliminated",
      })),
    [address, roomData?.players],
  );

  const rawFeed: FeedEvent[] = imminent
    ? [
        { id: 1, type: "round", title: `Round ${round + 1} incoming...`, time: `${timer}s` },
        ...(players.filter((player) => player.state === "eliminated").slice(0, 2).map((player, index) => ({
          id: index + 2,
          type: "elim" as const,
          title: `${player.addr} eliminated in Round ${player.roundOut ?? round}`,
          time: "recent",
        }))),
      ]
    : [
        { id: 1, type: "round", title: roomId === DEMO_ROOM_ID ? "Demo room running..." : roomQuery.isLoading ? "Loading room..." : `Room ${roomId} live on-chain`, time: "now" },
        { id: 2, type: "start", title: `${alive} players still alive`, time: `${round} rounds` },
        ...(players.filter((player) => player.state === "eliminated").slice(0, 3).map((player, index) => ({
          id: index + 3,
          type: "elim" as const,
          title: `${player.addr} eliminated in Round ${player.roundOut ?? round}`,
          time: "recent",
        }))),
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
              <MetricCard accent="#a274ff" label="Round" value={String(round)} />
              <MetricCard accent="#2ef7a0" label="Alive" value={String(alive)} />
              <MetricCard accent="#ff5353" label="Eliminated" value={String(eliminated)} />
              <MetricCard accent="#ffbe3b" label="Prize Pool" value={`${prize} USDC`} />
              <CountdownCard imminent={imminent} seconds={timer} />
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
                  <div
                    className="text-white/45"
                    style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px" }}
                  >
                    {alive}/{players.length} alive
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
              {roomQuery.isLoading && !demoSnapshot ? (
                <div className="rounded-[10px] border border-white/10 bg-white/5 px-3 py-2 text-white/70" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }}>
                  Loading room...
                </div>
              ) : null}
              {roomQuery.error ? (
                <div className="rounded-[10px] border border-[#ff5d70]/20 bg-[#ff5d70]/10 px-3 py-2 text-[#ff9aaa]" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }}>
                  {(roomQuery.error as Error).message}
                </div>
              ) : null}
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
            @keyframes tileGlow { 0%,100% { box-shadow: 0 0 0 1px rgba(34,228,199,0.4), 0 0 16px rgba(34,228,199,0.3) } 50% { box-shadow: 0 0 0 1px rgba(34,228,199,0.6), 0 0 24px rgba(34,228,199,0.5) } }
            @keyframes dangerGlow { 0%,100% { box-shadow: 0 0 0 1px rgba(255,59,92,0.4), 0 0 16px rgba(255,59,92,0.3) } 50% { box-shadow: 0 0 0 1px rgba(255,59,92,0.7), 0 0 28px rgba(255,59,92,0.5) } }
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
        style={{ fontFamily: "Orbitron, sans-serif", fontSize: "18px", fontWeight: 700, letterSpacing: "-0.01em", color: accent === "#ffffff" ? "#fff" : accent }}
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
      style={{
        background: imminent ? "rgba(255,59,92,0.1)" : "rgba(110,86,249,0.08)",
        borderColor: imminent ? "rgba(255,59,92,0.4)" : "rgba(110,86,249,0.3)",
      }}
    >
      <svg className="-rotate-90" viewBox="0 0 40 40" style={{ height: "86px", width: "86px" }}>
        <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
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
        <div
          className="text-center"
          style={{ fontFamily: "Orbitron, sans-serif", fontSize: "28px", fontWeight: 800, color }}
        >
          {safeSeconds}
        </div>
      </div>
    </div>
  );
}

function PlayerTile({ player, imminent, showShieldUi }: { imminent: boolean; player: Player; showShieldUi: boolean }) {
  const isYou = player.state === "you";
  const eliminated = player.state === "eliminated";
  const alive = !eliminated;
  const seed = (player.id * 9301 + 49297) % 233280;
  const hue = (seed / 233280) * 360;

  let borderColor = "rgba(255,255,255,0.08)";
  let bg = "rgba(255,255,255,0.02)";
  let textColor = "rgba(255,255,255,0.9)";
  let animation = "none";

  if (eliminated) {
    bg = "rgba(10,10,14,0.35)";
    textColor = "rgba(255,255,255,0.28)";
  } else if (isYou) {
    borderColor = "#9d6bff";
    bg = "rgba(110,86,249,0.12)";
  } else if (imminent && alive) {
    animation = "dangerGlow 1.2s ease-in-out infinite";
  } else if (alive) {
    animation = "tileGlow 2.4s ease-in-out infinite";
  }

  return (
    <div
      className="relative aspect-[1.1] rounded-[10px] p-2 transition-all"
      style={{
        background: bg,
        border: `1px solid ${borderColor}`,
        animation,
      }}
    >
      <div className="flex h-full flex-col items-center justify-between">
        <div className="w-full">
          {isYou ? (
            <span
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded-[999px] bg-[#8f5dff] px-2 py-0.5 text-white"
              style={{ fontFamily: "Orbitron, sans-serif", fontSize: "8px", fontWeight: 800, letterSpacing: "0.1em" }}
            >
              YOU
            </span>
          ) : null}
          <div
            className="mx-auto flex h-12 w-12 items-center justify-center"
            style={{
              clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
              background: eliminated
                ? "rgba(255,255,255,0.06)"
                : isYou
                  ? "linear-gradient(135deg, #8c6bff, #5a44f0)"
                  : `linear-gradient(135deg, hsl(${hue} 85% 58%), hsl(${(hue + 30) % 360} 85% 52%))`,
              opacity: eliminated ? 0.25 : 1,
              filter: isYou ? "drop-shadow(0 0 6px #8c6bff)" : "none",
            }}
          >
            <span
              className="text-black"
              style={{ fontFamily: "Orbitron, sans-serif", fontSize: "12px", fontWeight: 800, color: isYou ? "#1a142e" : "#052723" }}
            >
              {player.addr.slice(2, 4).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="text-center">
          <div
            style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px", color: textColor }}
          >
            {player.addr}
          </div>
          {eliminated ? (
            <div
              className="mt-1 text-white/20"
              style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }}
            >
              R{player.roundOut}
            </div>
          ) : showShieldUi ? (
            <div className="mt-1 flex items-center justify-center gap-1">
              {player.shield && !player.shieldUsed ? (
                <ShieldIcon className="h-3 w-3 text-[#59c7ff]" />
              ) : player.shieldUsed ? (
                <ShieldIcon className="h-3 w-3 text-white/35" />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FeedCard({ event }: { event: FeedEvent }) {
  const tone =
    event.type === "elim"
      ? {
          bg: "rgba(94,25,34,0.36)",
          border: "rgba(255,84,84,0.42)",
          icon: <SkullIcon className="h-4 w-4 text-[#ff6666]" />,
          text: "#ff6868",
        }
      : event.type === "shield"
        ? {
            bg: "rgba(18,48,74,0.42)",
            border: "rgba(73,170,255,0.38)",
            icon: <ShieldIcon className="h-4 w-4 text-[#74c6ff]" />,
            text: "#74c6ff",
          }
        : {
            bg: "rgba(89,64,24,0.32)",
            border: "rgba(245,181,68,0.35)",
            icon: <FlameIcon className="h-4 w-4 text-[#ffb94d]" />,
            text: "#ffb94d",
          };

  return (
    <div
      className="rounded-[16px] border p-4"
      style={{ background: tone.bg, borderColor: tone.border }}
    >
      <div className="flex items-start gap-3">
        <div className="pt-0.5">{tone.icon}</div>
        <div className="min-w-0">
          <div
            style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "16px", fontWeight: 500, color: tone.text }}
          >
            {event.title}
          </div>
          <div
            className="mt-1 text-white/55"
            style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "14px" }}
          >
            {event.time}
          </div>
        </div>
      </div>
    </div>
  );
}
