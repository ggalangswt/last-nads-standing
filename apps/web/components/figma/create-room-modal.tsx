"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import {
  CoinsIcon,
  FlameIcon,
  RocketIcon,
  TimerIcon,
  UsersIcon,
  XIcon,
  ZapIcon,
} from "@/components/figma/icons";
import { GameSlider } from "@/components/figma/slider";

type CreateRoomModalProps = {
  onClose: () => void;
  onCreated?: () => void;
  open: boolean;
};

export function CreateRoomModal({ open, onClose, onCreated }: CreateRoomModalProps) {
  const [entryFee, setEntryFee] = useState(2.5);
  const [minPlayers, setMinPlayers] = useState(20);
  const [maxPlayers, setMaxPlayers] = useState(50);
  const [elimPct, setElimPct] = useState(20);
  const [interval, setInterval] = useState(12);
  const [submitted, setSubmitted] = useState(false);

  const estimatedPool = useMemo(() => Number((entryFee * maxPlayers).toFixed(2)), [entryFee, maxPlayers]);
  const estimatedRounds = useMemo(() => {
    const rounds = Math.ceil(Math.log(1 / maxPlayers) / Math.log(1 - elimPct / 100));
    return Number.isFinite(rounds) ? Math.max(1, rounds) : 0;
  }, [elimPct, maxPlayers]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setSubmitted(false);
    }
  }, [open]);

  if (!open) return null;

  const onSubmit = () => {
    setSubmitted(true);
    window.setTimeout(() => {
      onCreated?.();
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
        style={{ background: "rgba(4,4,8,0.72)", backdropFilter: "blur(10px)" }}
      />

      <div
        className="relative w-full max-w-[560px] overflow-hidden rounded-[20px] border border-white/10"
        style={{
          background: "linear-gradient(180deg, rgba(22,20,40,0.96), rgba(10,10,18,0.98))",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(110,86,249,0.15), 0 0 60px rgba(110,86,249,0.25)",
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #6e56f9, transparent)" }}
        />
        <Cross style={{ top: 10, left: 10 }} />
        <Cross style={{ top: 10, right: 10 }} />
        <Cross style={{ bottom: 10, left: 10 }} />
        <Cross style={{ bottom: 10, right: 10 }} />

        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#6e56f9]/40"
              style={{ background: "rgba(110,86,249,0.15)", boxShadow: "0 0 20px rgba(110,86,249,0.3)" }}
            >
              <RocketIcon className="h-4 w-4 text-[#b9aaff]" />
            </div>
            <div>
              <div
                className="mb-1 text-[#b9aaff] uppercase tracking-[0.3em]"
                style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
              >
                {"// New Arena"}
              </div>
              <h2
                className="text-white"
                style={{ fontFamily: "Orbitron, sans-serif", fontSize: "22px", fontWeight: 800, letterSpacing: "-0.01em" }}
              >
                Deploy New Arena
              </h2>
              <p
                className="mt-1 max-w-[380px] text-white/50"
                style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px", lineHeight: 1.5 }}
              >
                Configure your survival room. This branch keeps the modal UI only.
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

        <div className="flex flex-wrap items-center gap-1.5 px-6 pb-5">
          <Chip icon={<ZapIcon className="h-3 w-3" />}>Monad Testnet</Chip>
          <Chip icon={<RocketIcon className="h-3 w-3" />}>Instant deploy</Chip>
          <Chip icon={<FlameIcon className="h-3 w-3" />}>Gas-light setup</Chip>
        </div>

        <div className="h-px bg-white/5" />

        <div className="space-y-5 p-6">
          <GameSlider
            hint="Cost for each player to enter"
            label="Entry Fee"
            max={10}
            min={0.1}
            onChange={(value) => setEntryFee(Number(value.toFixed(1)))}
            step={0.1}
            suffix="USDC"
            value={entryFee}
          />

          <div className="grid grid-cols-2 gap-5">
            <GameSlider label="Min Players" max={Math.max(10, maxPlayers - 5)} min={5} onChange={setMinPlayers} value={minPlayers} />
            <GameSlider label="Max Players" max={100} min={Math.min(minPlayers + 5, 50)} onChange={setMaxPlayers} value={maxPlayers} />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <GameSlider hint="Pace of the match" label="Elimination %" max={40} min={5} onChange={setElimPct} suffix="%" value={elimPct} />
            <GameSlider hint="Seconds between cuts" label="Round Interval" max={20} min={5} onChange={setInterval} suffix="s" value={interval} />
          </div>

          <div
            className="rounded-[16px] border border-[#f5b544]/50 bg-[linear-gradient(135deg,rgba(245,181,68,0.18),rgba(245,181,68,0.04))] p-4"
            style={{ boxShadow: "0 0 30px rgba(245,181,68,0.15)" }}
          >
            <div className="flex items-center gap-2 text-[#f5b544] uppercase tracking-[0.25em]" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}>
              <CoinsIcon className="h-3.5 w-3.5" /> Estimated Prize Pool
            </div>
            <div
              className="mt-1 text-[#f5b544]"
              style={{ fontFamily: "Orbitron, sans-serif", fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em" }}
            >
              {estimatedPool.toFixed(2)} USDC
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-white/55" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}>
              <Tag>~{estimatedRounds || 1} rounds</Tag>
              <Tag>{minPlayers}-{maxPlayers} players</Tag>
              <Tag>{interval}s pace</Tag>
            </div>
          </div>

          {submitted ? (
            <div className="rounded-[12px] border border-[#22e4c7]/30 bg-[#22e4c7]/10 px-4 py-3 text-[#22e4c7]" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12px" }}>
              Deployment preview saved. Closing modal...
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1.2fr]">
            <button
              className="h-11 rounded-[10px] border border-white/10 bg-white/[0.03] px-5 text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white"
              onClick={onClose}
              style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px", fontWeight: 500 }}
              type="button"
            >
              Cancel
            </button>
            <button
              className="flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#6e56f9] text-white shadow-[0_0_24px_rgba(110,86,249,0.45)] transition-colors hover:bg-[#7d67ff]"
              onClick={onSubmit}
              style={{ fontFamily: "Orbitron, sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em" }}
              type="button"
            >
              <RocketIcon className="h-3.5 w-3.5" /> Deploy Room
            </button>
          </div>
        </div>
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

function Chip({ children, icon }: { children: ReactNode; icon: ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-white/70"
      style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 500 }}
    >
      {icon}
      {children}
    </span>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1">{children}</span>;
}
