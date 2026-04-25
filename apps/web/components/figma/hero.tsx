"use client";

import type { CSSProperties, ReactNode } from "react";

import { ArenaTotem } from "@/components/figma/arena-totem";
import { ArrowUpRightIcon, BookOpenIcon, PlayIcon } from "@/components/figma/icons";

type HeroProps = {
  onHowItWorks?: () => void;
  onPlay: () => void;
};

export function Hero({ onHowItWorks, onPlay }: HeroProps) {
  return (
    <section className="relative flex-1 overflow-hidden">
      <FrameLines />

      <div
        className="pointer-events-none absolute right-[-10%] top-1/2 -translate-y-1/2"
        style={{
          width: "60vw",
          height: "60vw",
          background: "radial-gradient(circle, rgba(110,86,249,0.18) 0%, transparent 60%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative mx-auto grid h-full max-w-[1440px] items-center gap-10 px-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:px-24">
        <div className="max-w-[560px] space-y-8 py-10">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6e56f9] shadow-[0_0_8px_#6e56f9]" />
            <span
              className="text-white/70 uppercase tracking-[0.22em]"
              style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 500 }}
            >
              On-Chain Survival Arena
            </span>
          </div>

          <div className="space-y-5">
            <h1
              className="text-white"
              style={{
                fontFamily: "Orbitron, sans-serif",
                fontSize: "clamp(44px, 5.4vw, 76px)",
                fontWeight: 800,
                lineHeight: 0.95,
                letterSpacing: "-0.01em",
              }}
            >
              Last-Nad
              <br />
              <span className="text-[#6e56f9]" style={{ textShadow: "0 0 32px rgba(110,86,249,0.5)" }}>
                Standing.
              </span>
            </h1>

            <p
              className="max-w-[460px] text-white/60"
              style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "15px", lineHeight: 1.6 }}
            >
              Up to 50 wallets enter a single room. Every 10–15 seconds, the arena eliminates at
              random. The last wallet standing wins the entire prize pool.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <Tag>Monad Testnet</Tag>
              <Dot />
              <Tag>Spectator-friendly</Tag>
              <Dot />
              <Tag>Live-demo ready</Tag>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              className="group relative flex h-[62px] items-center gap-4 rounded-[14px] bg-[#6e56f9] pl-4 pr-5 shadow-[0_0_32px_rgba(110,86,249,0.45)] transition-colors hover:bg-[#7d67ff]"
              onClick={onPlay}
              type="button"
            >
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-black/25">
                <PlayIcon className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <span
                  className="text-white"
                  style={{
                    fontFamily: "Orbitron, sans-serif",
                    fontSize: "15px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                  }}
                >
                  PLAY
                </span>
                <span
                  className="text-white/70"
                  style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}
                >
                  Enter the arena
                </span>
              </div>
              <ArrowUpRightIcon className="ml-2 h-4 w-4 text-white/80 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>

            <button
              className="group flex h-[62px] items-center gap-4 rounded-[14px] border border-white/10 bg-white/[0.03] pl-4 pr-5 backdrop-blur transition-colors hover:bg-white/[0.07]"
              onClick={onHowItWorks}
              type="button"
            >
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-white/10 bg-white/5">
                <BookOpenIcon className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <span
                  className="text-white"
                  style={{
                    fontFamily: "Orbitron, sans-serif",
                    fontSize: "15px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                  }}
                >
                  HOW IT WORKS
                </span>
                <span
                  className="text-white/50"
                  style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}
                >
                  Rules · Fairness · Prize
                </span>
              </div>
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center lg:justify-end">
          <ArenaTotem />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-white/5 px-16 py-4 lg:px-24">
        <span
          className="text-white/30 uppercase tracking-[0.3em]"
          style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}
        >
          v0.1 · Hackathon Build
        </span>
        <div className="flex items-center gap-5">
          <span
            className="text-white/30 uppercase tracking-[0.3em]"
            style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}
          >
            Block 4,208,117
          </span>
          <span
            className="text-white/30 uppercase tracking-[0.3em]"
            style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}
          >
            Gas 0.3 gwei
          </span>
        </div>
      </div>
    </section>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span
      className="text-white/50 uppercase tracking-[0.2em]"
      style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 500 }}
    >
      {children}
    </span>
  );
}

function Dot() {
  return <span className="h-1 w-1 rounded-full bg-white/20" />;
}

function FrameLines() {
  const inset = "clamp(32px, 5vw, 72px)";

  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <div
        className="absolute bottom-0 top-0 w-px"
        style={{
          left: inset,
          background:
            "linear-gradient(180deg, transparent, rgba(255,255,255,0.12) 15%, rgba(110,86,249,0.35) 50%, rgba(255,255,255,0.12) 85%, transparent)",
        }}
      />
      <div
        className="absolute bottom-0 top-0 w-px"
        style={{
          right: inset,
          background:
            "linear-gradient(180deg, transparent, rgba(255,255,255,0.12) 15%, rgba(110,86,249,0.35) 50%, rgba(255,255,255,0.12) 85%, transparent)",
        }}
      />

      <Cross style={{ top: `calc(${inset} - 6px)`, left: `calc(${inset} - 6px)` }} />
      <Cross style={{ top: `calc(${inset} - 6px)`, right: `calc(${inset} - 6px)` }} />
      <Cross style={{ bottom: `calc(${inset} - 6px)`, left: `calc(${inset} - 6px)` }} />
      <Cross style={{ bottom: `calc(${inset} - 6px)`, right: `calc(${inset} - 6px)` }} />

      <Tick side="left" style={{ left: inset, top: "28%" }} />
      <Tick side="left" style={{ left: inset, top: "72%" }} />
      <Tick side="right" style={{ right: inset, top: "28%" }} />
      <Tick side="right" style={{ right: inset, top: "72%" }} />

      <div
        className="absolute whitespace-nowrap text-white/25 uppercase"
        style={{
          left: `calc(${inset} - 22px)`,
          top: "50%",
          transform: "translateY(-50%) rotate(-90deg)",
          transformOrigin: "center",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "9px",
          letterSpacing: "0.4em",
        }}
      >
        ARENA · 00
      </div>
      <div
        className="absolute whitespace-nowrap text-white/25 uppercase"
        style={{
          right: `calc(${inset} - 22px)`,
          top: "50%",
          transform: "translateY(-50%) rotate(90deg)",
          transformOrigin: "center",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "9px",
          letterSpacing: "0.4em",
        }}
      >
        MONAD · LIVE
      </div>
    </div>
  );
}

function Cross({ style }: { style: CSSProperties }) {
  return (
    <div className="absolute h-3 w-3" style={style}>
      <span className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-[#6e56f9]/60" />
      <span className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-[#6e56f9]/60" />
    </div>
  );
}

function Tick({
  style,
  side = "left",
}: {
  style: CSSProperties;
  side?: "left" | "right";
}) {
  return (
    <div
      className="absolute h-px w-2 bg-white/25"
      style={{
        ...style,
        transform: side === "left" ? "translateX(-50%)" : "translateX(50%)",
      }}
    />
  );
}
