"use client";

import Link from "next/link";

import { PlusIcon } from "@/components/figma/icons";
import { WalletConnectButton } from "@/components/wallet/connect-button";

type TopNavProps = {
  liveCount?: number;
  onlineCount?: number;
  onCreateRoom?: () => void;
  onFaucet?: () => void;
  onHome?: () => void;
  onHowItWorks?: () => void;
  onPlay?: () => void;
  variant?: "landing" | "lobby" | "arena" | "faucet" | "spectate";
};

export function TopNav({
  variant = "landing",
  onCreateRoom,
  onFaucet,
  onHowItWorks,
  onPlay,
  onHome,
  liveCount = 12,
  onlineCount = 2384,
}: TopNavProps) {
  return (
    <header className="relative z-20 flex items-center justify-between border-b border-white/5 px-8 py-5">
      <div className="flex items-center gap-8">
        <button className="group flex items-center gap-2.5" onClick={onHome} type="button">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#6e56f9] shadow-[0_0_24px_rgba(110,86,249,0.55)]">
            <div className="h-2.5 w-2.5 rounded-sm bg-black" />
          </div>
          <span
            className="text-white uppercase tracking-[0.18em]"
            style={{ fontFamily: "Orbitron, sans-serif", fontSize: "13px", fontWeight: 700 }}
          >
            Last-Nad
          </span>
        </button>

        <div className="hidden items-center gap-1 rounded-full border border-[#6e56f9]/30 bg-[#6e56f9]/8 px-2.5 py-1 md:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#6e56f9] shadow-[0_0_8px_#6e56f9]" />
          <span
            className="px-1.5 text-[#b9aaff] uppercase tracking-wider"
            style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 500 }}
          >
            Monad Testnet
          </span>
        </div>

        {variant !== "landing" ? (
          <div className="hidden items-center gap-5 lg:flex">
            <Stat dot="#ff3b5c" label="Live Rooms" value={liveCount} />
            <Stat dot="#6e56f9" label="Online" value={onlineCount.toLocaleString()} />
          </div>
        ) : null}
      </div>

      <nav className="hidden items-center gap-7 md:flex">
        <button
          className="text-white/60 transition-colors hover:text-white"
          onClick={onHowItWorks}
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px", fontWeight: 500 }}
          type="button"
        >
          How It Works
        </button>
        <button
          className="text-white/60 transition-colors hover:text-white"
          onClick={onFaucet}
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px", fontWeight: 500 }}
          type="button"
        >
          Faucet
        </button>
        <Link
          href="/"
          className="text-white/60 transition-colors hover:text-white"
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px", fontWeight: 500 }}
        >
          Leaderboard
        </Link>
      </nav>

      <div className="flex items-center gap-2.5">
        {variant !== "landing" ? (
          <button
            className="hidden h-9 items-center gap-2 rounded-[10px] border border-white/10 bg-white/5 px-3.5 text-white transition-colors hover:bg-white/10 sm:flex"
            onClick={onCreateRoom}
            style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px", fontWeight: 500 }}
            type="button"
          >
            <PlusIcon className="h-3.5 w-3.5" /> Create Room
          </button>
        ) : (
          <button
            className="hidden h-9 items-center rounded-[10px] border border-white/10 bg-white/5 px-4 text-white transition-colors hover:bg-white/10 sm:flex"
            onClick={onPlay}
            style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px", fontWeight: 500 }}
            type="button"
          >
            Enter Lobby
          </button>
        )}
        <WalletConnectButton className="h-9 rounded-[10px] px-4" />
      </div>
    </header>
  );
}

function Stat({ dot, label, value }: { dot: string; label: string; value: string | number }) {
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
