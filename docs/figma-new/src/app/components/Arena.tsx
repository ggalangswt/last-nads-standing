import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft, Shield, Skull, AlertTriangle, Zap, Flame,
  Trophy, Users, Activity, Eye, Radio
} from "lucide-react";

type PlayerState = "alive" | "eliminated" | "you";
type Player = {
  id: number;
  addr: string;
  state: PlayerState;
  shield: boolean;
  shieldUsed?: boolean;
};

type FeedEvent = {
  id: number;
  type: "elim" | "shield" | "round" | "milestone" | "start";
  text: string;
  sub?: string;
  time: string;
};

function genPlayers(): Player[] {
  const addrs = [
    "0x7a2b…41f9", "0xc4d1…9e02", "0x812e…0b7a", "0x5f44…aa10", "0xb9c0…34dd",
    "0x22ee…77cc", "0x9914…f4b1", "0xad30…0123", "0x6b22…8ef2", "0x402a…aa01",
    "0x1111…2222", "0xd0d0…3c3c", "0xef45…8910", "0xa7b8…c9d0", "0x3e3e…4f4f",
    "0x8080…9090", "0x2b1c…3e4f", "0x5c5c…6d6d", "0xfafa…bcbc", "0x0101…0202",
    "0x7373…8484", "0x9a9a…abab", "0xcccc…dddd", "0x1e1e…2f2f", "0x4545…5656",
    "0x6767…7878", "0x8989…9a9a", "0xbabb…cbcb", "0xdcdc…eded", "0x1212…3434",
    "0x5656…7878", "0x9b9b…acac", "0xcdcd…efef", "0x1414…2525", "0x3636…4747",
    "0x5858…6969",
  ];
  return addrs.map((addr, i) => ({
    id: i,
    addr,
    state: i === 7 ? "you" : (i % 7 === 3 || i % 11 === 2) ? "eliminated" : "alive",
    shield: i % 5 === 0,
    shieldUsed: i % 13 === 0,
  }));
}

export function Arena({ onBack }: { onBack: () => void }) {
  const [imminent, setImminent] = useState(false);
  const [timer, setTimer] = useState(9);
  const players = useMemo(() => genPlayers(), []);

  useEffect(() => {
    const id = setInterval(() => {
      setTimer((t) => (t <= 1 ? 12 : t - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setImminent(timer <= 3);
  }, [timer]);

  const alive = players.filter((p) => p.state !== "eliminated").length;
  const eliminated = players.length - alive;

  const feed: FeedEvent[] = [
    { id: 1, type: "elim", text: "0xad30…0123 eliminated", sub: "Round 07", time: "now" },
    { id: 2, type: "shield", text: "0x7a2b…41f9 shield blocked", sub: "Survived elim", time: "12s" },
    { id: 3, type: "round", text: "Round 07 started", sub: "36 alive", time: "24s" },
    { id: 4, type: "elim", text: "0xb9c0…34dd eliminated", time: "38s" },
    { id: 5, type: "elim", text: "0x9914…f4b1 eliminated", time: "52s" },
    { id: 6, type: "milestone", text: "Halfway point reached", sub: "50% players remaining", time: "1m 04s" },
    { id: 7, type: "round", text: "Round 06 started", time: "1m 18s" },
    { id: 8, type: "shield", text: "0x402a…aa01 shield blocked", time: "1m 31s" },
    { id: 9, type: "start", text: "Arena deployed", sub: "50 players locked in", time: "3m 12s" },
  ];

  return (
    <section className="relative flex-1 overflow-auto">
      {/* imminent overlay pulse */}
      {imminent && (
        <div
          className="pointer-events-none fixed inset-0 z-10"
          style={{
            background: "radial-gradient(ellipse at center, rgba(255,59,92,0.12), transparent 60%)",
            animation: "arenaPulse 0.9s ease-in-out infinite",
          }}
        />
      )}

      <div className="relative max-w-[1440px] mx-auto px-10 lg:px-16 py-8">
        {/* back */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-5 transition-colors"
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px" }}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Lobby
        </button>

        {/* Match header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-5">
          <div>
            <div
              className="uppercase tracking-[0.3em] mb-1 flex items-center gap-2"
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "10px",
                fontWeight: 600,
                color: imminent ? "#ff3b5c" : "#6e56f9",
              }}
            >
              <Radio className="h-3 w-3" />
              // Live Arena
            </div>
            <h1
              className="text-white"
              style={{ fontFamily: "Orbitron, sans-serif", fontSize: "32px", fontWeight: 800, letterSpacing: "-0.01em" }}
            >
              Room #0427
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimer(3)}
              className="h-9 px-3.5 rounded-[10px] border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white/70 hover:text-white transition-colors"
              style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }}
            >
              Trigger Imminent
            </button>
            <button
              onClick={() => setTimer(12)}
              className="h-9 px-3.5 rounded-[10px] border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white/70 hover:text-white transition-colors"
              style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }}
            >
              Normal
            </button>
          </div>
        </div>

        {/* Metrics strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
          <MetricCard icon={<Activity className="h-3 w-3" />} label="Round" value="07" accent="#6e56f9" />
          <MetricCard icon={<Users className="h-3 w-3" />} label="Alive" value={String(alive).padStart(2, "0")} accent="#22e4c7" />
          <MetricCard icon={<Skull className="h-3 w-3" />} label="Eliminated" value={String(eliminated).padStart(2, "0")} accent="#ff3b5c" />
          <MetricCard icon={<Trophy className="h-3 w-3" />} label="Prize Pool" value="128.40 MON" accent="#f5b544" />
          <CountdownCard seconds={timer} imminent={imminent} />
        </div>

        {/* Alert banner */}
        {imminent && (
          <div
            className="relative mb-5 rounded-[14px] border overflow-hidden"
            style={{
              background: "linear-gradient(90deg, rgba(255,59,92,0.22), rgba(255,59,92,0.06))",
              borderColor: "rgba(255,59,92,0.5)",
              boxShadow: "0 0 40px rgba(255,59,92,0.25), inset 0 1px 0 rgba(255,255,255,0.05)",
              animation: "bannerShake 0.4s ease-in-out infinite alternate",
            }}
          >
            <div className="flex items-center gap-3 px-5 py-3">
              <div className="h-8 w-8 rounded-[8px] bg-[#ff3b5c]/20 border border-[#ff3b5c]/50 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-[#ff3b5c]" />
              </div>
              <div className="flex-1">
                <div
                  className="text-[#ff3b5c] uppercase tracking-[0.25em]"
                  style={{ fontFamily: "Orbitron, sans-serif", fontSize: "13px", fontWeight: 800 }}
                >
                  Elimination Incoming
                </div>
                <div
                  className="text-white/70"
                  style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12px" }}
                >
                  20% of alive wallets will be eliminated in {timer}s. Shields may activate automatically.
                </div>
              </div>
              <Flame className="h-5 w-5 text-[#ff3b5c]" />
            </div>
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-5">
          {/* Player grid */}
          <div
            className="rounded-[16px] border border-white/8 p-5"
            style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="text-white/55 uppercase tracking-[0.25em] flex items-center gap-2"
                style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
              >
                <Users className="h-3 w-3" /> Arena Board
              </div>
              <div className="flex items-center gap-3">
                <Legend color="#22e4c7" label="Alive" />
                <Legend color="#6e56f9" label="You" />
                <Legend color="rgba(255,255,255,0.2)" label="Out" />
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 xl:grid-cols-9 gap-2.5">
              {players.map((p) => (
                <PlayerTile key={p.id} player={p} imminent={imminent} />
              ))}
            </div>
          </div>

          {/* Feed */}
          <div
            className="rounded-[16px] border border-white/8 flex flex-col overflow-hidden"
            style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))", maxHeight: "640px" }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div
                className="text-white/60 uppercase tracking-[0.25em] flex items-center gap-2"
                style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
              >
                <Eye className="h-3 w-3" /> Live Feed
              </div>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff3b5c] animate-pulse" />
                <span
                  className="text-[#ff3b5c] uppercase tracking-[0.2em]"
                  style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px", fontWeight: 600 }}
                >
                  Rec
                </span>
              </span>
            </div>

            <div className="flex-1 overflow-auto p-3 space-y-2">
              {feed.map((ev) => (
                <FeedCard key={ev.id} event={ev} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes arenaPulse { 0%,100% { opacity:0.6 } 50% { opacity:1 } }
        @keyframes bannerShake { from { transform: translateX(-1px) } to { transform: translateX(1px) } }
        @keyframes tileGlow { 0%,100% { box-shadow: 0 0 0 1px rgba(34,228,199,0.4), 0 0 16px rgba(34,228,199,0.3) } 50% { box-shadow: 0 0 0 1px rgba(34,228,199,0.6), 0 0 24px rgba(34,228,199,0.5) } }
        @keyframes dangerGlow { 0%,100% { box-shadow: 0 0 0 1px rgba(255,59,92,0.4), 0 0 16px rgba(255,59,92,0.3) } 50% { box-shadow: 0 0 0 1px rgba(255,59,92,0.7), 0 0 28px rgba(255,59,92,0.5) } }
      `}</style>
    </section>
  );
}

function MetricCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="relative rounded-[12px] border border-white/8 bg-white/[0.02] px-4 py-3 overflow-hidden">
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: accent, boxShadow: `0 0 10px ${accent}` }}
      />
      <div
        className="flex items-center gap-1.5 text-white/50 uppercase tracking-[0.2em]"
        style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px" }}
      >
        <span style={{ color: accent }}>{icon}</span>
        {label}
      </div>
      <div
        className="text-white mt-1"
        style={{ fontFamily: "Orbitron, sans-serif", fontSize: "18px", fontWeight: 700, letterSpacing: "-0.01em" }}
      >
        {value}
      </div>
    </div>
  );
}

function CountdownCard({ seconds, imminent }: { seconds: number; imminent: boolean }) {
  const pct = (seconds / 12) * 100;
  const color = imminent ? "#ff3b5c" : "#6e56f9";
  return (
    <div
      className="relative rounded-[12px] border px-4 py-3 overflow-hidden flex items-center gap-3"
      style={{
        background: imminent ? "rgba(255,59,92,0.1)" : "rgba(110,86,249,0.08)",
        borderColor: imminent ? "rgba(255,59,92,0.4)" : "rgba(110,86,249,0.3)",
      }}
    >
      <svg viewBox="0 0 40 40" className="h-11 w-11 -rotate-90">
        <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
        <circle
          cx="20" cy="20" r="16" fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={`${(pct / 100) * 100.5} 100.5`}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color})`, transition: "stroke-dasharray 0.9s linear" }}
        />
      </svg>
      <div>
        <div
          className="uppercase tracking-[0.2em]"
          style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px", color }}
        >
          Next Elim
        </div>
        <div
          className="text-white"
          style={{ fontFamily: "Orbitron, sans-serif", fontSize: "20px", fontWeight: 700 }}
        >
          00:{String(seconds).padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
      <span
        className="text-white/50 uppercase tracking-[0.15em]"
        style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px" }}
      >
        {label}
      </span>
    </div>
  );
}

function PlayerTile({ player, imminent }: { player: Player; imminent: boolean }) {
  const isYou = player.state === "you";
  const eliminated = player.state === "eliminated";
  const alive = !eliminated;

  let borderColor = "rgba(255,255,255,0.08)";
  let bg = "rgba(255,255,255,0.02)";
  let textColor = "rgba(255,255,255,0.9)";
  let animation = "none";

  if (eliminated) {
    bg = "rgba(10,10,14,0.6)";
    textColor = "rgba(255,255,255,0.3)";
  } else if (isYou) {
    borderColor = "#6e56f9";
    bg = "rgba(110,86,249,0.12)";
  } else if (imminent && alive) {
    animation = "dangerGlow 1.2s ease-in-out infinite";
  } else if (alive) {
    animation = "tileGlow 2.4s ease-in-out infinite";
  }

  const seed = (player.id * 9301 + 49297) % 233280;
  const hue = (seed / 233280) * 360;

  return (
    <div
      className="relative aspect-square rounded-[10px] p-2 flex flex-col justify-between transition-all"
      style={{
        background: bg,
        border: `1px solid ${borderColor}`,
        animation,
      }}
    >
      {/* avatar */}
      <div className="flex items-start justify-between">
        <div
          className="h-6 w-6 rounded-[6px] flex items-center justify-center relative"
          style={{
            background: eliminated
              ? "rgba(255,255,255,0.04)"
              : `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 60) % 360} 70% 45%))`,
            opacity: eliminated ? 0.3 : 1,
            filter: isYou ? "drop-shadow(0 0 6px #6e56f9)" : "none",
          }}
        >
          <span
            className="text-white"
            style={{ fontFamily: "Orbitron, sans-serif", fontSize: "9px", fontWeight: 700 }}
          >
            {player.addr.slice(2, 4).toUpperCase()}
          </span>
        </div>
        {player.shield && !player.shieldUsed && alive && (
          <Shield className="h-3 w-3 text-[#22e4c7]" style={{ filter: "drop-shadow(0 0 4px #22e4c7)" }} />
        )}
        {player.shieldUsed && (
          <Shield className="h-3 w-3 text-white/25" />
        )}
      </div>

      {/* address */}
      <div
        style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px", color: textColor, letterSpacing: "0.02em" }}
      >
        {player.addr}
      </div>

      {/* status */}
      {eliminated && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Skull className="h-5 w-5 text-white/25" />
          <span
            className="absolute inset-0 flex items-center justify-center text-[#ff3b5c]/50"
            style={{ fontFamily: "Orbitron, sans-serif", fontSize: "22px", fontWeight: 900, opacity: 0.25 }}
          >
            ×
          </span>
        </div>
      )}

      {isYou && (
        <span
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-[4px] bg-[#6e56f9] text-white"
          style={{ fontFamily: "Orbitron, sans-serif", fontSize: "8px", fontWeight: 800, letterSpacing: "0.15em", boxShadow: "0 0 10px rgba(110,86,249,0.7)" }}
        >
          YOU
        </span>
      )}
    </div>
  );
}

function FeedCard({ event }: { event: FeedEvent }) {
  const config = {
    elim: { color: "#ff3b5c", icon: <Skull className="h-3.5 w-3.5" />, label: "Elimination" },
    shield: { color: "#22e4c7", icon: <Shield className="h-3.5 w-3.5" />, label: "Shield Block" },
    round: { color: "#f5b544", icon: <Zap className="h-3.5 w-3.5" />, label: "Round Start" },
    milestone: { color: "#b9aaff", icon: <Activity className="h-3.5 w-3.5" />, label: "Milestone" },
    start: { color: "#6e56f9", icon: <Flame className="h-3.5 w-3.5" />, label: "Deploy" },
  }[event.type];

  return (
    <div
      className="relative rounded-[10px] border overflow-hidden px-3 py-2.5"
      style={{
        borderColor: `${config.color}33`,
        background: `linear-gradient(90deg, ${config.color}14, transparent)`,
      }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-[2px]"
        style={{ background: config.color, boxShadow: `0 0 8px ${config.color}` }}
      />
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <span style={{ color: config.color }}>{config.icon}</span>
          <div>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "9px",
                color: config.color,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {config.label}
            </div>
            <div
              className="text-white mt-0.5"
              style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12px", fontWeight: 500 }}
            >
              {event.text}
            </div>
            {event.sub && (
              <div
                className="text-white/40"
                style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "11px" }}
              >
                {event.sub}
              </div>
            )}
          </div>
        </div>
        <span
          className="text-white/35 whitespace-nowrap"
          style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px" }}
        >
          {event.time}
        </span>
      </div>
    </div>
  );
}
