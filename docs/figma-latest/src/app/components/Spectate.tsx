import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft, Eye, Users, Skull, Trophy, Activity, Radio,
  AlertTriangle, Flame, Shield, Crown, TrendingUp, Sparkles, Heart
} from "lucide-react";
import { PlayerTile, FeedCard, type Player, type FeedEvent } from "./Arena";

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
  // spectator mode: no "you" tile
  return addrs.map((addr, i) => ({
    id: i,
    addr,
    state: (i % 7 === 3 || i % 11 === 2 || i === 7) ? "eliminated" : "alive",
    shield: i % 5 === 0,
    shieldUsed: i % 13 === 0,
  }));
}

export function Spectate({ onBack }: { onBack: () => void }) {
  const [timer, setTimer] = useState(10);
  const [imminent, setImminent] = useState(false);
  const players = useMemo(() => genPlayers(), []);

  useEffect(() => {
    const id = setInterval(() => setTimer((t) => (t <= 1 ? 12 : t - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => setImminent(timer <= 3), [timer]);

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
  ];

  return (
    <section className="relative flex-1 overflow-auto">
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
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-5 transition-colors"
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px" }}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Lobby
        </button>

        {/* header */}
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
              <Eye className="h-3 w-3" />
              // Spectator Mode
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <h1
                className="text-white"
                style={{ fontFamily: "Orbitron, sans-serif", fontSize: "32px", fontWeight: 800, letterSpacing: "-0.01em" }}
              >
                Room #0427
              </h1>
              <LiveBadge />
              <span
                className="text-white/50 flex items-center gap-1.5"
                style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }}
              >
                <Radio className="h-3 w-3" /> 1,284 watching
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimer(3)}
              className="h-9 px-3.5 rounded-[10px] border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white/70 hover:text-white transition-colors"
              style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }}
            >
              High Tension
            </button>
            <button
              onClick={() => setTimer(12)}
              className="h-9 px-3.5 rounded-[10px] border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white/70 hover:text-white transition-colors"
              style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }}
            >
              Standard
            </button>
          </div>
        </div>

        {/* metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
          <MetricCard icon={<Activity className="h-3 w-3" />} label="Round" value="07" accent="#6e56f9" />
          <MetricCard icon={<Users className="h-3 w-3" />} label="Alive" value={String(alive).padStart(2, "0")} accent="#22e4c7" />
          <MetricCard icon={<Skull className="h-3 w-3" />} label="Eliminated" value={String(eliminated).padStart(2, "0")} accent="#ff3b5c" />
          <MetricCard icon={<Trophy className="h-3 w-3" />} label="Prize Pool" value="128.40 MON" accent="#f5b544" />
          <CountdownCard seconds={timer} imminent={imminent} />
        </div>

        {/* banner */}
        {imminent && (
          <div
            className="relative mb-5 rounded-[14px] border overflow-hidden"
            style={{
              background: "linear-gradient(90deg, rgba(255,59,92,0.22), rgba(255,59,92,0.06))",
              borderColor: "rgba(255,59,92,0.5)",
              boxShadow: "0 0 40px rgba(255,59,92,0.25)",
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
                  Next Cut Imminent
                </div>
                <div
                  className="text-white/70"
                  style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12px" }}
                >
                  {Math.round(alive * 0.2)} wallets will be eliminated in {timer}s. Eyes on the board.
                </div>
              </div>
              <Flame className="h-5 w-5 text-[#ff3b5c]" />
            </div>
          </div>
        )}

        {/* main */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-5">
          {/* Board */}
          <div
            className="rounded-[16px] border border-white/8 p-5"
            style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="text-white/55 uppercase tracking-[0.25em] flex items-center gap-2"
                style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
              >
                <Users className="h-3 w-3" /> Arena Board · Spectating
              </div>
              <div className="flex items-center gap-3">
                <Legend color="#22e4c7" label="Alive" />
                <Legend color="rgba(255,255,255,0.2)" label="Out" />
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 xl:grid-cols-9 gap-2.5">
              {players.map((p) => (
                <PlayerTile key={p.id} player={p} imminent={imminent} />
              ))}
            </div>

            {/* Recently eliminated ticker */}
            <div className="mt-5 pt-4 border-t border-white/5">
              <div
                className="text-white/45 uppercase tracking-[0.22em] mb-2 flex items-center gap-1.5"
                style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}
              >
                <Skull className="h-3 w-3 text-[#ff3b5c]" /> Recently Eliminated
              </div>
              <div className="flex items-center gap-2 overflow-x-auto">
                {players.filter((p) => p.state === "eliminated").slice(0, 6).map((p) => (
                  <span
                    key={p.id}
                    className="px-2.5 py-1 rounded-md border border-[#ff3b5c]/20 bg-[#ff3b5c]/5 text-white/50 whitespace-nowrap"
                    style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}
                  >
                    {p.addr}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Spectator side panel */}
          <div className="space-y-4">
            {/* Live feed */}
            <div
              className="rounded-[16px] border border-white/8 flex flex-col overflow-hidden"
              style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))", maxHeight: "380px" }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
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

            {/* Most watched */}
            <SpectatorCard
              accent="#f5b544"
              icon={<Crown className="h-3.5 w-3.5" />}
              label="Most Watched Player"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-[10px]"
                  style={{
                    background: "linear-gradient(135deg, #f5b544, #f97316)",
                    boxShadow: "0 0 16px rgba(245,181,68,0.4)",
                  }}
                />
                <div className="flex-1">
                  <div
                    className="text-white"
                    style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "13px", fontWeight: 600 }}
                  >
                    0x5f44…aa10
                  </div>
                  <div
                    className="text-white/50 flex items-center gap-1"
                    style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "11px" }}
                  >
                    <Heart className="h-3 w-3 text-[#ff3b5c]" /> 812 followers this match
                  </div>
                </div>
                <TrendingUp className="h-4 w-4 text-[#22e4c7]" />
              </div>
            </SpectatorCard>

            {/* Last shield */}
            <SpectatorCard
              accent="#22e4c7"
              icon={<Shield className="h-3.5 w-3.5" />}
              label="Last Shield Used"
            >
              <div
                className="text-white"
                style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "13px", fontWeight: 500 }}
              >
                0x402a…aa01
              </div>
              <div
                className="text-white/50 mt-0.5"
                style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "11px" }}
              >
                Blocked elimination · Round 06
              </div>
            </SpectatorCard>

            {/* Prediction coming soon */}
            <SpectatorCard
              accent="#6e56f9"
              icon={<Sparkles className="h-3.5 w-3.5" />}
              label="Prediction Market"
              badge="Coming Soon"
            >
              <div
                className="text-white/70"
                style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12px", lineHeight: 1.5 }}
              >
                Bet on who survives. On-chain odds updating every round.
              </div>
              <button
                disabled
                className="mt-2.5 w-full h-8 rounded-[8px] border border-[#6e56f9]/30 bg-[#6e56f9]/10 text-[#b9aaff]/80 cursor-not-allowed"
                style={{ fontFamily: "Orbitron, sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em" }}
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
  );
}

function LiveBadge() {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
      style={{ borderColor: "rgba(255,59,92,0.5)", background: "rgba(255,59,92,0.12)" }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[#ff3b5c] shadow-[0_0_8px_#ff3b5c] animate-pulse" />
      <span
        className="text-[#ff3b5c] uppercase tracking-[0.22em]"
        style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 700 }}
      >
        Live
      </span>
    </div>
  );
}

function MetricCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="relative rounded-[12px] border border-white/8 bg-white/[0.02] px-4 py-3 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: accent, boxShadow: `0 0 10px ${accent}` }} />
      <div
        className="flex items-center gap-1.5 text-white/50 uppercase tracking-[0.2em]"
        style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px" }}
      >
        <span style={{ color: accent }}>{icon}</span>
        {label}
      </div>
      <div className="text-white mt-1" style={{ fontFamily: "Orbitron, sans-serif", fontSize: "18px", fontWeight: 700 }}>
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
        <div className="uppercase tracking-[0.2em]" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px", color }}>
          Next Cut
        </div>
        <div className="text-white" style={{ fontFamily: "Orbitron, sans-serif", fontSize: "20px", fontWeight: 700 }}>
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

function SpectatorCard({
  accent, icon, label, children, badge,
}: {
  accent: string; icon: React.ReactNode; label: string; children: React.ReactNode; badge?: string;
}) {
  return (
    <div
      className="relative rounded-[14px] border p-4 overflow-hidden"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
      <div className="flex items-center justify-between mb-2.5">
        <div
          className="uppercase tracking-[0.22em] flex items-center gap-1.5"
          style={{ color: accent, fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
        >
          {icon} {label}
        </div>
        {badge && (
          <span
            className="px-1.5 py-0.5 rounded-md border border-white/10 text-white/50 uppercase tracking-[0.18em]"
            style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "8px", fontWeight: 600 }}
          >
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
