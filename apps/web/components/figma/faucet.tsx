"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { formatUnits } from "viem";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  CircleDollarSignIcon,
  CoinsIcon,
  CopyIcon,
  DropletsIcon,
  ExternalLinkIcon,
  InfoIcon,
  WalletIcon,
} from "@/components/figma/icons";
import { mockUsdcContract } from "@/lib/contracts/config";
import { env } from "@/lib/env";
import { monadTestnetChain } from "@/lib/wagmi/chain";

export function Faucet({ onBack }: { onBack: () => void }) {
  const [copied, setCopied] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  const { address, chain, isConnected } = useAccount();
  const { data: writeHash, error: writeError, isPending: isWritePending, writeContract } = useWriteContract();
  const { isLoading: isReceiptLoading, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: writeHash,
  });

  const isOnMonad = chain?.id === monadTestnetChain.id;
  const fullAddress = address ?? "";

  const decimalsQuery = useReadContract({
    ...mockUsdcContract,
    chainId: monadTestnetChain.id,
    functionName: "decimals",
  });

  const faucetAmountQuery = useReadContract({
    ...mockUsdcContract,
    chainId: monadTestnetChain.id,
    functionName: "FAUCET_AMOUNT",
  });

  const balanceQuery = useReadContract({
    ...mockUsdcContract,
    args: address ? [address] : undefined,
    chainId: monadTestnetChain.id,
    functionName: "balanceOf",
    query: {
      enabled: Boolean(address),
    },
  });

  const canClaimQuery = useReadContract({
    ...mockUsdcContract,
    args: address ? [address] : undefined,
    chainId: monadTestnetChain.id,
    functionName: "canClaim",
    query: {
      enabled: Boolean(address),
    },
  });

  const cooldownQuery = useReadContract({
    ...mockUsdcContract,
    args: address ? [address] : undefined,
    chainId: monadTestnetChain.id,
    functionName: "cooldownRemaining",
    query: {
      enabled: Boolean(address),
    },
  });

  useEffect(() => {
    if (!isClaimSuccess) return;
    void Promise.all([
      balanceQuery.refetch(),
      canClaimQuery.refetch(),
      cooldownQuery.refetch(),
    ]);
  }, [balanceQuery, canClaimQuery, cooldownQuery, isClaimSuccess]);

  const decimals = Number(decimalsQuery.data ?? 6);
  const faucetAmountValue = typeof faucetAmountQuery.data === "bigint" ? faucetAmountQuery.data : BigInt(0);
  const balanceValue = typeof balanceQuery.data === "bigint" ? balanceQuery.data : BigInt(0);
  const faucetAmount = formatUnits(faucetAmountValue, decimals);
  const balance = formatUnits(balanceValue, decimals);
  const txHash = writeHash ? `${writeHash.slice(0, 6)}...${writeHash.slice(-4)}` : "Pending...";
  const canClaim = Boolean(canClaimQuery.data);
  const cooldownRemaining = cooldownQuery.data ? Number(cooldownQuery.data) : 0;
  const cooldownLabel = useMemo(() => formatCooldown(cooldownRemaining), [cooldownRemaining]);
  const networkLabel = chain?.name ?? "No wallet connected";
  const primaryLabel = !isConnected
    ? "Connect wallet first"
    : !isOnMonad
      ? "Switch to Monad!"
      : isWritePending || isReceiptLoading
        ? "Claiming..."
        : canClaim
          ? "Claim mockUSDC"
          : "Cooldown active";

  const primaryDisabled =
    !isConnected || switching || (isOnMonad && !canClaim && !isWritePending && !isReceiptLoading);

  const copyAddr = async () => {
    try {
      await navigator.clipboard?.writeText(fullAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const switchToMonad = async () => {
    const ethereum = getEthereumProvider();
    if (!ethereum) {
      setSwitchError("No injected wallet found.");
      return;
    }

    setSwitching(true);
    setSwitchError(null);

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${monadTestnetChain.id.toString(16)}` }],
      });
    } catch (error) {
      const code = getErrorCode(error);
      if (code === 4902) {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${monadTestnetChain.id.toString(16)}`,
              chainName: monadTestnetChain.name,
              nativeCurrency: monadTestnetChain.nativeCurrency,
              rpcUrls: [env.monadRpcUrl],
              blockExplorerUrls: [env.monadExplorerUrl],
            },
          ],
        });
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${monadTestnetChain.id.toString(16)}` }],
        });
      } else {
        setSwitchError(getErrorMessage(error) || "Failed to switch wallet network.");
      }
    } finally {
      setSwitching(false);
    }
  };

  const onPrimaryClick = async () => {
    if (!isConnected) return;
    if (!isOnMonad) {
      await switchToMonad();
      return;
    }
    if (!canClaim || isWritePending || isReceiptLoading) return;
    writeContract({
      ...mockUsdcContract,
      chainId: monadTestnetChain.id,
      functionName: "faucet",
    });
  };

  return (
    <section className="relative flex-1 overflow-auto">
      <div className="relative mx-auto max-w-[960px] px-10 py-10 lg:px-16">
        <button
          className="mb-5 inline-flex items-center gap-2 text-white/60 transition-colors hover:text-white"
          onClick={onBack}
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px" }}
          type="button"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Back to Lobby
        </button>

        <div className="mb-8">
          <div
            className="mb-2 flex items-center gap-2 text-[#b9aaff] uppercase tracking-[0.3em]"
            style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
          >
            <DropletsIcon className="h-3 w-3" /> {"// Demo Funds"}
          </div>
          <h1
            className="text-white"
            style={{ fontFamily: "Orbitron, sans-serif", fontSize: "36px", fontWeight: 800, letterSpacing: "-0.01em" }}
          >
            mockUSDC Faucet.
          </h1>
          <p
            className="mt-2 max-w-[560px] text-white/55"
            style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "14px", lineHeight: 1.6 }}
          >
            Claim demo funds for testnet gameplay. Use mockUSDC to join rooms and test tomorrow&apos;s arena flow.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#f5b544]/30 bg-[#f5b544]/8 px-2.5 py-1">
            <AlertTriangleIcon className="h-3 w-3 text-[#f5b544]" />
            <span
              className="text-[#f5b544] uppercase tracking-[0.2em]"
              style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
            >
              Not real money · Testnet only
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div
            className="relative overflow-hidden rounded-[18px] border border-white/10 p-6"
            style={{
              background: "linear-gradient(180deg, rgba(22,20,40,0.8), rgba(10,10,18,0.8))",
              boxShadow: "0 0 0 1px rgba(110,86,249,0.12), 0 0 60px rgba(110,86,249,0.18)",
            }}
          >
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(110,86,249,0.3), transparent 70%)" }}
            />

            <div className="relative mb-6 flex items-start justify-between">
              <div>
                <div
                  className="mb-1 text-white/45 uppercase tracking-[0.25em]"
                  style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}
                >
                  Available to Claim
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-white"
                    style={{ fontFamily: "Orbitron, sans-serif", fontSize: "48px", fontWeight: 800, letterSpacing: "-0.02em", textShadow: "0 0 32px rgba(110,86,249,0.5)" }}
                  >
                    {formatCompactAmount(faucetAmount)}
                  </span>
                  <span
                    className="text-[#6e56f9]"
                    style={{ fontFamily: "Orbitron, sans-serif", fontSize: "18px", fontWeight: 700 }}
                  >
                    mockUSDC
                  </span>
                </div>
                <div
                  className="mt-1 text-white/40"
                  style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12px" }}
                >
                  Enough for demo room entries and quick replay testing.
                </div>
              </div>

              <div
                className="flex h-14 w-14 items-center justify-center rounded-[14px] border"
                style={{
                  background: "linear-gradient(135deg, rgba(110,86,249,0.25), rgba(110,86,249,0.05))",
                  borderColor: "rgba(110,86,249,0.4)",
                  boxShadow: "0 0 20px rgba(110,86,249,0.4)",
                }}
              >
                <CircleDollarSignIcon className="h-6 w-6 text-[#b9aaff]" />
              </div>
            </div>

            <div className="relative mb-5 flex flex-wrap items-center gap-2">
              <StatusPill
                active={isConnected && isOnMonad && canClaim}
                color={canClaim ? "#22e4c7" : "#f5b544"}
                label={!isConnected ? "Connect wallet" : canClaim ? "Ready to claim" : `Cooldown ${cooldownLabel}`}
              />
              <StatusPill color={isOnMonad ? "#6e56f9" : "#ff5d70"} label={isOnMonad ? "Monad Testnet" : "Wrong network"} muted={isOnMonad} />
            </div>

            {isClaimSuccess ? (
              <div
                className="relative rounded-[12px] border p-4"
                style={{
                  borderColor: "rgba(34,228,199,0.35)",
                  background: "linear-gradient(90deg, rgba(34,228,199,0.12), rgba(34,228,199,0.02))",
                  boxShadow: "0 0 24px rgba(34,228,199,0.2)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#22e4c7]/50 bg-[#22e4c7]/20">
                    <CheckIcon className="h-4 w-4 text-[#22e4c7]" />
                  </div>
                  <div className="flex-1">
                    <div
                      className="text-[#22e4c7] uppercase tracking-[0.22em]"
                      style={{ fontFamily: "Orbitron, sans-serif", fontSize: "12px", fontWeight: 700 }}
                    >
                      mockUSDC Sent
                    </div>
                    <div
                      className="mt-0.5 text-white/70"
                      style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12.5px" }}
                    >
                      {formatCompactAmount(faucetAmount)} mockUSDC delivered to your wallet.
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <KV icon={<ExternalLinkIcon className="h-3 w-3" />} label="Tx Hash" value={txHash} />
                      <KV label="Balance" value={`${formatDisplayAmount(balance)} mockUSDC`} />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            {!isClaimSuccess ? (
              <button
                className="group relative mt-0 flex h-14 w-full items-center justify-center gap-2.5 rounded-[12px] bg-[#6e56f9] text-white shadow-[0_0_32px_rgba(110,86,249,0.5)] transition-colors hover:bg-[#7d67ff] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={primaryDisabled}
                onClick={onPrimaryClick}
                style={{ fontFamily: "Orbitron, sans-serif", fontSize: "14px", fontWeight: 700, letterSpacing: "0.12em" }}
                type="button"
              >
                <DropletsIcon className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                {switching ? "Switching..." : primaryLabel.toUpperCase()}
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            ) : null}
            {switchError || writeError ? (
              <div
                className="mt-3 rounded-[10px] border border-[#ff5d70]/25 bg-[#ff5d70]/8 px-3 py-2 text-[#ff9aaa]"
                style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12px" }}
              >
                {switchError || getErrorMessage(writeError) || "Claim failed."}
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-[14px] border border-white/10 bg-white/[0.02] p-4">
              <div
                className="flex items-center gap-1.5 text-white/45 uppercase tracking-[0.25em]"
                style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}
              >
                <WalletIcon className="h-3 w-3" /> Wallet
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-7 w-7 rounded-[8px] bg-[linear-gradient(135deg,#6e56f9,#22e4c7)]" />
                <span
                  className="text-white"
                  style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "13px", fontWeight: 500 }}
                >
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}
                </span>
                <button
                  className="ml-auto flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-white/50 transition-colors hover:bg-white/5 hover:text-white"
                  disabled={!address}
                  onClick={copyAddr}
                  type="button"
                >
                  {copied ? <CheckIcon className="h-3 w-3 text-[#22e4c7]" /> : <CopyIcon className="h-3 w-3" />}
                </button>
              </div>
              <div className="my-3 h-px bg-white/5" />
              <Row label="Network" value={networkLabel} />
              <Row label="Balance" value={`${formatDisplayAmount(balance)} mockUSDC`} />
              <Row label="Contract" value={`${mockUsdcContract.address.slice(0, 6)}...${mockUsdcContract.address.slice(-4)}`} />
            </div>

            <div className="space-y-2.5 rounded-[14px] border border-white/10 bg-white/[0.02] p-4">
              <div
                className="flex items-center gap-1.5 text-white/45 uppercase tracking-[0.25em]"
                style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}
              >
                <InfoIcon className="h-3 w-3" /> How to Use
              </div>
              <Tip text="Claim mockUSDC before the demo starts." />
              <Tip text="Use mockUSDC to pay room entry fees." />
              <Tip text="If your wallet is on the wrong chain, use the switch button to add Monad Testnet automatically." />
              <button
                className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.03] text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white"
                onClick={onBack}
                style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12px", fontWeight: 500 }}
                type="button"
              >
                <ArrowLeftIcon className="h-3.5 w-3.5" /> Back to Lobby
              </button>
            </div>

            <div className="rounded-[14px] border p-4" style={{ borderColor: "rgba(245,181,68,0.25)", background: "rgba(245,181,68,0.06)" }}>
              <div className="flex items-start gap-2">
                <CoinsIcon className="mt-0.5 h-3.5 w-3.5 text-[#f5b544]" />
                <div>
                  <div
                    className="text-[#f5b544] uppercase tracking-[0.22em]"
                    style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
                  >
                    Demo Notice
                  </div>
                  <p
                    className="mt-1 text-white/60"
                    style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12px", lineHeight: 1.5 }}
                  >
                    mockUSDC has no monetary value. It exists only for testing on Monad Testnet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function formatCompactAmount(value: string) {
  const asNumber = Number(value);
  if (!Number.isFinite(asNumber)) return value;
  return asNumber.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function formatDisplayAmount(value: string) {
  const asNumber = Number(value);
  if (!Number.isFinite(asNumber)) return value;
  return asNumber.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatCooldown(seconds: number) {
  if (!seconds || seconds <= 0) return "ready";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

function getEthereumProvider() {
  if (typeof window === "undefined") return undefined;
  return (window as Window & {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }).ethereum;
}

function getErrorCode(error: unknown) {
  if (typeof error === "object" && error && "code" in error) {
    return Number((error as { code?: number | string }).code);
  }
  return undefined;
}

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "shortMessage" in error) {
    return String((error as { shortMessage?: string }).shortMessage);
  }
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message?: string }).message);
  }
  return null;
}

function StatusPill({
  color,
  label,
  active = false,
  muted = false,
}: {
  active?: boolean;
  color: string;
  label: string;
  muted?: boolean;
}) {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1"
      style={{
        borderColor: muted ? "rgba(255,255,255,0.1)" : `${color}55`,
        background: muted ? "rgba(255,255,255,0.03)" : `${color}12`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: color, boxShadow: active ? `0 0 6px ${color}` : "none", animation: active ? "pulse 1.6s ease-in-out infinite" : "none" }}
      />
      <span
        className="uppercase tracking-[0.18em]"
        style={{ color: muted ? "rgba(255,255,255,0.6)" : color, fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
      >
        {label}
      </span>
    </div>
  );
}

function KV({ icon, label, value }: { icon?: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-white/8 bg-black/20 px-3 py-2">
      <div
        className="flex items-center gap-1.5 text-white/40 uppercase tracking-[0.2em]"
        style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px" }}
      >
        {icon} {label}
      </div>
      <div
        className="mt-1 text-white"
        style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", fontWeight: 500 }}
      >
        {value}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-2 flex items-center justify-between">
      <span
        className="text-white/45 uppercase tracking-[0.2em]"
        style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px" }}
      >
        {label}
      </span>
      <span
        className="text-white"
        style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", fontWeight: 500 }}
      >
        {value}
      </span>
    </div>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <div className="rounded-[10px] border border-white/8 bg-black/20 px-3 py-2 text-white/65" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12px" }}>
      {text}
    </div>
  );
}
