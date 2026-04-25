import { Wallet, Plus } from "lucide-react";

type Props = {
  variant?: "landing" | "lobby" | "arena" | "faucet" | "spectate";
  onPlay?: () => void;
  onHome?: () => void;
  onCreateRoom?: () => void;
  onHowItWorks?: () => void;
  onFaucet?: () => void;
  liveCount?: number;
  onlineCount?: number;
};

export function TopNav({ variant = "landing", onPlay, onHome, onCreateRoom, onHowItWorks, onFaucet, liveCount = 12, onlineCount = 2384 }: Props) {
  return (
    <header className="relative z-20 flex items-center justify-between px-8 py-5 border-b border-white/5">
      <div className="flex items-center gap-8">
        <button onClick={onHome} className="flex items-center gap-2.5 group">
          <div className="relative h-7 w-7 rounded-[8px] bg-[#6e56f9] flex items-center justify-center shadow-[0_0_24px_rgba(110,86,249,0.55)]">
            <div className="h-2.5 w-2.5 rounded-sm bg-black" />
          </div>
          <span
            className="text-white tracking-[0.18em] uppercase"
            style={{ fontFamily: "Orbitron, sans-serif", fontSize: "13px", fontWeight: 700 }}
          >
            Last-Nad
          </span>
        </button>

        <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#6e56f9]/30 bg-[#6e56f9]/8">
          <span className="h-1.5 w-1.5 rounded-full bg-[#6e56f9] shadow-[0_0_8px_#6e56f9]" />
          <span
            className="text-[#b9aaff] tracking-wider uppercase px-1.5"
            style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 500 }}
          >
            Monad Testnet
          </span>
        </div>

        {variant !== "landing" && (
          <div className="hidden lg:flex items-center gap-5">
            <Stat label="Live Rooms" value={liveCount} dot="#ff3b5c" />
            <Stat label="Online" value={onlineCount.toLocaleString()} dot="#6e56f9" />
          </div>
        )}
      </div>

      <nav className="hidden md:flex items-center gap-7">
        <button
          onClick={onHowItWorks}
          className="text-white/60 hover:text-white transition-colors"
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px", fontWeight: 500 }}
        >
          How It Works
        </button>
        <button
          onClick={onFaucet}
          className="text-white/60 hover:text-white transition-colors"
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px", fontWeight: 500 }}
        >
          Faucet
        </button>
        <a
          className="text-white/60 hover:text-white transition-colors"
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px", fontWeight: 500 }}
        >
          Leaderboard
        </a>
      </nav>

      <div className="flex items-center gap-2.5">
        {variant !== "landing" && (
          <button
            onClick={onCreateRoom}
            className="hidden sm:flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
            style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px", fontWeight: 500 }}
          >
            <Plus className="h-3.5 w-3.5" /> Create Room
          </button>
        )}
        {variant === "landing" && (
          <button
            onClick={onPlay}
            className="hidden sm:flex h-9 px-4 rounded-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-white items-center transition-colors"
            style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px", fontWeight: 500 }}
          >
            Enter Lobby
          </button>
        )}
        <button
          className="flex items-center gap-2 h-9 px-4 rounded-[10px] bg-[#6e56f9] hover:bg-[#7d67ff] text-white shadow-[0_0_20px_rgba(110,86,249,0.35)] transition-colors"
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px", fontWeight: 600 }}
        >
          <Wallet className="h-3.5 w-3.5" />
          Connect Wallet
        </button>
      </div>
    </header>
  );
}

function Stat({ label, value, dot }: { label: string; value: string | number; dot: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot, boxShadow: `0 0 8px ${dot}` }} />
      <span
        className="text-white/50 uppercase tracking-wider"
        style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}
      >
        {label}
      </span>
      <span
        className="text-white"
        style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px", fontWeight: 600 }}
      >
        {value}
      </span>
    </div>
  );
}
