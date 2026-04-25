"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import {
  EyeIcon,
  LogInIcon,
  HourglassIcon,
  ShieldCheckIcon,
  ShieldIcon,
  SwordsIcon,
  TrophyIcon,
  XIcon,
  ZapIcon,
} from "@/components/figma/icons";

const SHOW_SHIELD_UI = false;

const STEPS = [
  { n: "01", icon: LogInIcon, title: "Join a Room", desc: "Connect your wallet, pay the entry fee, and lock into a room with 20-50 players.", color: "#6e56f9" },
  { n: "02", icon: HourglassIcon, title: "Wait for Start", desc: "The room begins when the minimum player count is reached or the lobby timer expires.", color: "#b9aaff" },
  { n: "03", icon: SwordsIcon, title: "Survive the Arena", desc: "Every 10-15 seconds the arena triggers a round and eliminates a random percentage on-chain.", color: "#ff3b5c" },
  { n: "04", icon: ShieldIcon, title: "Use Your Shield", desc: "Every player gets one shield. It blocks exactly one elimination and then it is gone.", color: "#22e4c7" },
  { n: "05", icon: TrophyIcon, title: "Last Wallet Wins", desc: "The final wallet standing takes the entire prize pool with on-chain payout.", color: "#f5b544" },
];

export function HowItWorksModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[rgba(4,4,8,0.72)] backdrop-blur-[10px]" onClick={onClose} />

      <div
        className="relative max-h-[90vh] w-full max-w-[640px] overflow-auto rounded-[20px] border border-white/10"
        style={{
          background: "linear-gradient(180deg, rgba(22,20,40,0.96), rgba(10,10,18,0.98))",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(110,86,249,0.15), 0 0 60px rgba(110,86,249,0.25)",
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#6e56f9,transparent)]" />

        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#6e56f9]/40"
              style={{ background: "rgba(110,86,249,0.15)", boxShadow: "0 0 20px rgba(110,86,249,0.3)" }}
            >
              <SwordsIcon className="h-4 w-4 text-[#b9aaff]" />
            </div>
            <div>
              <div
                className="mb-1 text-[#b9aaff] uppercase tracking-[0.3em]"
                style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
              >
                {"// Rules · Fairness · Prize"}
              </div>
              <h2
                className="text-white"
                style={{ fontFamily: "Orbitron, sans-serif", fontSize: "22px", fontWeight: 800, letterSpacing: "-0.01em" }}
              >
                How It Works
              </h2>
              <p
                className="mt-1 max-w-[420px] text-white/50"
                style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px", lineHeight: 1.5 }}
              >
                Last Man Standing is a real-time survival arena on Monad. One room. Repeating cuts. One winner.
              </p>
            </div>
          </div>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2.5 px-6 pb-5">
          {STEPS.filter((step) => SHOW_SHIELD_UI || step.title !== "Use Your Shield").map((step, i, visibleSteps) => (
            <StepRow displayNumber={String(i + 1).padStart(2, "0")} key={step.n} last={i === visibleSteps.length - 1} step={step} />
          ))}
        </div>

        <div className="mx-6 h-px bg-white/5" />

        <div className="grid grid-cols-1 gap-3 p-6 md:grid-cols-3">
          <InfoCard color="#6e56f9" icon={<EyeIcon className="h-3.5 w-3.5" />} label="Spectate" text="Watch any arena live even if you did not join the room." />
          <InfoCard color="#22e4c7" icon={<ShieldCheckIcon className="h-3.5 w-3.5" />} label="Verifiable" text="Room state, eliminations, and outcomes are visible on-chain." />
          <InfoCard color="#f5b544" icon={<ZapIcon className="h-3.5 w-3.5" />} label="Why Monad" text="Fast enough to make live on-chain elimination loops feel responsive." />
        </div>

        <div className="flex items-center gap-2.5 px-6 pb-6">
          <button
            className="h-11 rounded-[10px] border border-white/10 bg-white/[0.03] px-5 text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white"
            onClick={onClose}
            style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px", fontWeight: 500 }}
            type="button"
          >
            Close
          </button>
          <button
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#6e56f9] text-white shadow-[0_0_24px_rgba(110,86,249,0.45)] transition-colors hover:bg-[#7d67ff]"
            onClick={onClose}
            style={{ fontFamily: "Orbitron, sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em" }}
            type="button"
          >
            ENTER ARENA
          </button>
        </div>
      </div>
    </div>
  );
}

function StepRow({
  displayNumber,
  step,
  last,
}: {
  displayNumber: string;
  last: boolean;
  step: (typeof STEPS)[number];
}) {
  const Icon = step.icon;

  return (
    <div className="relative flex gap-4">
      <div className="relative flex flex-col items-center">
        <div
          className="relative z-10 flex h-10 w-10 items-center justify-center rounded-[10px] border"
          style={{
            borderColor: `${step.color}55`,
            background: `${step.color}12`,
            boxShadow: `0 0 16px ${step.color}30`,
          }}
        >
          <Icon className="h-4 w-4" style={{ color: step.color }} />
        </div>
        {!last ? (
          <div className="mt-1 w-px flex-1" style={{ background: `linear-gradient(180deg, ${step.color}40, rgba(255,255,255,0.05))`, minHeight: "20px" }} />
        ) : null}
      </div>
      <div className="flex-1 pb-2">
        <div className="flex items-baseline gap-2.5">
          <span
            className="uppercase tracking-[0.25em]"
            style={{ color: step.color, fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 700 }}
          >
            {displayNumber}
          </span>
          <h3
            className="text-white"
            style={{ fontFamily: "Orbitron, sans-serif", fontSize: "14px", fontWeight: 700, letterSpacing: "0.02em" }}
          >
            {step.title}
          </h3>
        </div>
        <p
          className="mt-1 text-white/55"
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12.5px", lineHeight: 1.55 }}
        >
          {step.desc}
        </p>
      </div>
    </div>
  );
}

function InfoCard({
  color,
  icon,
  label,
  text,
}: {
  color: string;
  icon: ReactNode;
  label: string;
  text: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[12px] border border-white/8 bg-white/[0.02] p-3.5">
      <div className="absolute bottom-0 left-0 top-0 w-[2px]" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      <div
        className="flex items-center gap-1.5 uppercase tracking-[0.2em]"
        style={{ color, fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
      >
        {icon} {label}
      </div>
      <p
        className="mt-1.5 text-white/65"
        style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12px", lineHeight: 1.5 }}
      >
        {text}
      </p>
    </div>
  );
}
