"use client";

import { useState } from "react";

import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  CheckIcon,
  CircleDollarSignIcon,
  CoinsIcon,
  CopyIcon,
  DropletsIcon,
  ExternalLinkIcon,
  InfoIcon,
  WalletIcon,
} from "@/components/figma/icons";

export function Faucet({ onBack }: { onBack: () => void }) {
  const [claimed, setClaimed] = useState(false);
  const fullAddress = "0x3516A2bF4aE1f9c0b7D2A1F8c4E2aAa3C2AA3c";
  const txHash = "0x4f2a...8b19";

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
            Claim demo funds for testnet gameplay. This is a UI shell for the branch, so the balance and claim result are mocked.
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
                    style={{
                      fontFamily: "Orbitron, sans-serif",
                      fontSize: "48px",
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                      textShadow: "0 0 32px rgba(110,86,249,0.5)",
                    }}
                  >
                    2,000
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
              <StatusPill active color="#22e4c7" label="Ready to claim" />
              <StatusPill color="#6e56f9" label="Monad Testnet" muted />
            </div>

            {claimed ? (
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
                      2,000 mockUSDC delivered to your wallet.
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <KV icon={<ExternalLinkIcon className="h-3 w-3" />} label="Tx Hash" value={txHash} />
                      <KV label="Balance" value="2,000.00 mockUSDC" />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <button
              className="group mt-0 flex h-14 w-full items-center justify-center gap-2.5 rounded-[12px] bg-[#6e56f9] text-white shadow-[0_0_32px_rgba(110,86,249,0.5)] transition-colors hover:bg-[#7d67ff]"
              onClick={() => setClaimed(true)}
              style={{ fontFamily: "Orbitron, sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em" }}
              type="button"
            >
              <CoinsIcon className="h-4 w-4" />
              {claimed ? "Claim Again" : "Claim mockUSDC"}
            </button>
          </div>

          <div className="space-y-4">
            <Panel title="Wallet" icon={<WalletIcon className="h-3.5 w-3.5" />}>
              <div className="space-y-3">
                <Row label="Address" value={fullAddress} />
                <Row label="Network" value="Monad Testnet" />
                <button
                  className="inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.03] px-3 py-2 text-white/75 transition-colors hover:bg-white/[0.08] hover:text-white"
                  type="button"
                >
                  <CopyIcon className="h-3.5 w-3.5" /> Copy Address
                </button>
              </div>
            </Panel>

            <Panel title="Usage" icon={<InfoIcon className="h-3.5 w-3.5" />}>
              <ul className="space-y-2 text-white/65" style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12px" }}>
                <li>Use mockUSDC to join rooms.</li>
                <li>Claim before the demo starts.</li>
                <li>If the wallet is wrong, switch to Monad Testnet.</li>
              </ul>
            </Panel>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusPill({
  active,
  color,
  label,
  muted,
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
        background: active ? `${color}12` : "rgba(255,255,255,0.03)",
        borderColor: `${color}33`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      <span
        className={muted ? "uppercase tracking-[0.2em] text-white/65" : "uppercase tracking-[0.2em] text-white"}
        style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
      >
        {label}
      </span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-white/8 bg-white/[0.02] px-3.5 py-3">
      <div className="text-white/40 uppercase tracking-[0.2em]" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px" }}>
        {label}
      </div>
      <div className="mt-1 break-all text-white" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px" }}>
        {value}
      </div>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-[16px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4">
      <div className="flex items-center gap-2 text-white/65 uppercase tracking-[0.22em]" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}>
        {icon}
        {title}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function KV({ icon, label, value }: { icon?: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-white/8 bg-black/20 px-3 py-2">
      <div className="flex items-center gap-1.5 text-white/45 uppercase tracking-[0.18em]" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px" }}>
        {icon}
        {label}
      </div>
      <div className="mt-0.5 text-white" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }}>
        {value}
      </div>
    </div>
  );
}
