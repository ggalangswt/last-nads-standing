"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { parseUnits } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

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
import { getErrorMessage, switchToMonadNetwork } from "@/lib/network";
import { monadTestnetChain } from "@/lib/wagmi/chain";
import { factoryContract } from "@/lib/contracts/config";

type CreateRoomModalProps = {
  onClose: () => void;
  onCreated?: () => void;
  open: boolean;
};

export function CreateRoomModal({ open, onClose, onCreated }: CreateRoomModalProps) {
  const [entryFee, setEntryFee] = useState(1);
  const [minPlayers, setMinPlayers] = useState(2);
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [elimPct, setElimPct] = useState(30);
  const [interval, setInterval] = useState(5);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);
  const handledSuccessRef = useRef<string | null>(null);

  const { address, chain, isConnected } = useAccount();
  const isOnMonad = chain?.id === monadTestnetChain.id;
  const { data: writeHash, error: writeError, isPending: isWritePending, writeContract } = useWriteContract();
  const { isLoading: isReceiptLoading, isSuccess: isCreateSuccess } = useWaitForTransactionReceipt({
    hash: writeHash,
  });

  const estimatedPool = useMemo(() => Number((entryFee * maxPlayers).toFixed(2)), [entryFee, maxPlayers]);
  const estimatedRounds = useMemo(() => {
    const rounds = Math.ceil(Math.log(1 / maxPlayers) / Math.log(1 - elimPct / 100));
    return Number.isFinite(rounds) ? Math.max(1, rounds) : 0;
  }, [elimPct, maxPlayers]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!isCreateSuccess || !writeHash) return;
    if (handledSuccessRef.current === writeHash) return;
    handledSuccessRef.current = writeHash;
    onCreated?.();
    onClose();
  }, [isCreateSuccess, onClose, onCreated, writeHash]);

  useEffect(() => {
    if (!open) {
      handledSuccessRef.current = null;
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const decimals = 6;
  const submitLabel = !isConnected
    ? "CONNECT WALLET"
    : !isOnMonad
      ? "SWITCH TO MONAD"
      : switching || isWritePending || isReceiptLoading
        ? "DEPLOYING..."
        : "DEPLOY ROOM";

  const onSubmit = async () => {
    if (!isConnected || !address) return;
    setSubmitError(null);

    if (!isOnMonad) {
      setSwitching(true);
      try {
        await switchToMonadNetwork();
      } catch (error) {
        setSubmitError(getErrorMessage(error) || "Failed to switch network.");
      } finally {
        setSwitching(false);
      }
      return;
    }

    try {
      writeContract({
        ...factoryContract,
        chainId: monadTestnetChain.id,
        functionName: "createRoom",
        args: [
          parseUnits(entryFee.toString(), decimals),
          BigInt(minPlayers),
          BigInt(maxPlayers),
          BigInt(elimPct),
          BigInt(interval),
        ],
      });
    } catch (error) {
      setSubmitError(getErrorMessage(error) || "Failed to submit room creation.");
    }
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
                Configure your survival room. Smart contract deploys instantly on Monad.
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
            <GameSlider
              label="Min Players"
              max={9}
              min={2}
              onChange={setMinPlayers}
              value={minPlayers}
            />
            <GameSlider
              label="Max Players"
              max={10}
              min={Math.min(minPlayers + 1, 9)}
              onChange={setMaxPlayers}
              value={maxPlayers}
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <GameSlider
              hint="Pace of the match"
              label="Elimination %"
              max={40}
              min={5}
              onChange={setElimPct}
              suffix="%"
              value={elimPct}
            />
            <GameSlider
              hint="Tension between rounds"
              label="Round Interval"
              max={30}
              min={5}
              onChange={setInterval}
              suffix="s"
              value={interval}
            />
          </div>
        </div>

        <div className="px-6 pb-6">
          <div
            className="relative overflow-hidden rounded-[14px] border p-4"
            style={{
              borderColor: "rgba(110,86,249,0.35)",
              background: "linear-gradient(120deg, rgba(110,86,249,0.18), rgba(110,86,249,0.04))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(110,86,249,0.35), transparent 70%)" }}
            />
            <div className="relative flex items-center justify-between">
              <div>
                <div
                  className="flex items-center gap-1.5 text-[#b9aaff] uppercase tracking-[0.25em]"
                  style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
                >
                  <CoinsIcon className="h-3 w-3" /> Estimated Prize Pool
                </div>
                <div
                  className="mt-1 text-white"
                  style={{
                    fontFamily: "Orbitron, sans-serif",
                    fontSize: "30px",
                    fontWeight: 800,
                    letterSpacing: "-0.01em",
                    textShadow: "0 0 24px rgba(110,86,249,0.55)",
                  }}
                >
                  {estimatedPool} <span className="text-[#6e56f9]">USDC</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Summary icon={<UsersIcon className="h-3 w-3" />} value={`${maxPlayers} max`} />
                <Summary icon={<TimerIcon className="h-3 w-3" />} value={`~${estimatedRounds} rounds`} />
                <Summary icon={<TimerIcon className="h-3 w-3" />} value={`${interval}s / round`} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-6 pb-6">
          <button
            className="h-11 rounded-[10px] border border-white/10 bg-white/[0.03] px-5 text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white"
            onClick={onClose}
            style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px", fontWeight: 500 }}
            type="button"
          >
            Cancel
          </button>
          <button
            className="group flex h-11 flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#6e56f9] text-white shadow-[0_0_24px_rgba(110,86,249,0.45)] transition-colors hover:bg-[#7d67ff]"
            disabled={switching || isWritePending || isReceiptLoading}
            onClick={onSubmit}
            style={{ fontFamily: "Orbitron, sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em" }}
            type="button"
          >
            <RocketIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            {submitLabel}
          </button>
        </div>
        {submitError || writeError ? (
          <div
            className="px-6 pb-6 text-[#ff9aaa]"
            style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12px" }}
          >
            {submitError || getErrorMessage(writeError) || "Room deployment failed."}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Chip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-white/60"
      style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", letterSpacing: "0.15em" }}
    >
      {icon}
      <span className="uppercase">{children}</span>
    </div>
  );
}

function Summary({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <div
      className="flex items-center gap-1.5 text-white/70"
      style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }}
    >
      {icon} {value}
    </div>
  );
}

function Cross({ style }: { style: CSSProperties }) {
  return (
    <div className="pointer-events-none absolute h-2.5 w-2.5" style={style}>
      <span className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-[#6e56f9]/50" />
      <span className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-[#6e56f9]/50" />
    </div>
  );
}
