import { useState } from "react";
import {
  ArrowLeft, Wallet, Check, Copy, ExternalLink, AlertTriangle,
  Coins, Droplets, CircleDollarSign, ArrowRight, Info
} from "lucide-react";

export function Faucet({ onBack }: { onBack: () => void }) {
  const [claimed, setClaimed] = useState(false);
  const [copied, setCopied] = useState(false);
  const address = "0x7a2b…41f9";
  const fullAddress = "0x7a2b4C3d1e9F8a2B4c3D1E9f8A2b4C3d1E9F41f9";
  const txHash = "0xfa91…08c4";
  const balance = claimed ? "10,000.00" : "0.00";
  const amount = "10,000";

  const copyAddr = () => {
    navigator.clipboard?.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="relative flex-1 overflow-auto">
      <div className="relative max-w-[960px] mx-auto px-10 lg:px-16 py-10">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-5 transition-colors"
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px" }}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Lobby
        </button>

        {/* header */}
        <div className="mb-8">
          <div
            className="text-[#b9aaff] uppercase tracking-[0.3em] mb-2 flex items-center gap-2"
            style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
          >
            <Droplets className="h-3 w-3" />
            // Demo Funds
          </div>
          <h1
            className="text-white"
            style={{ fontFamily: "Orbitron, sans-serif", fontSize: "36px", fontWeight: 800, letterSpacing: "-0.01em" }}
          >
            mockUSDC Faucet.
          </h1>
          <p
            className="text-white/55 mt-2 max-w-[560px]"
            style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "14px", lineHeight: 1.6 }}
          >
            Claim demo funds for testnet gameplay. Use mockUSDC to join rooms and test tomorrow's full arena flow.
          </p>
          <div className="inline-flex items-center gap-1.5 mt-4 px-2.5 py-1 rounded-full border border-[#f5b544]/30 bg-[#f5b544]/8">
            <AlertTriangle className="h-3 w-3 text-[#f5b544]" />
            <span
              className="text-[#f5b544] uppercase tracking-[0.2em]"
              style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
            >
              Not real money · Testnet only
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-5">
          {/* claim card */}
          <div
            className="relative rounded-[18px] border border-white/10 p-6 overflow-hidden"
            style={{
              background: "linear-gradient(180deg, rgba(22,20,40,0.8), rgba(10,10,18,0.8))",
              boxShadow: "0 0 0 1px rgba(110,86,249,0.12), 0 0 60px rgba(110,86,249,0.18)",
            }}
          >
            <div
              className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(110,86,249,0.3), transparent 70%)" }}
            />

            <div className="relative flex items-start justify-between mb-6">
              <div>
                <div
                  className="text-white/45 uppercase tracking-[0.25em] mb-1"
                  style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}
                >
                  Available to Claim
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-white"
                    style={{ fontFamily: "Orbitron, sans-serif", fontSize: "48px", fontWeight: 800, letterSpacing: "-0.02em", textShadow: "0 0 32px rgba(110,86,249,0.5)" }}
                  >
                    {amount}
                  </span>
                  <span
                    className="text-[#6e56f9]"
                    style={{ fontFamily: "Orbitron, sans-serif", fontSize: "18px", fontWeight: 700 }}
                  >
                    mockUSDC
                  </span>
                </div>
                <div
                  className="text-white/40 mt-1"
                  style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12px" }}
                >
                  ≈ enough for 4,000 entries at 2.5 MON
                </div>
              </div>

              <div
                className="h-14 w-14 rounded-[14px] flex items-center justify-center border"
                style={{
                  background: "linear-gradient(135deg, rgba(110,86,249,0.25), rgba(110,86,249,0.05))",
                  borderColor: "rgba(110,86,249,0.4)",
                  boxShadow: "0 0 20px rgba(110,86,249,0.4)",
                }}
              >
                <CircleDollarSign className="h-6 w-6 text-[#b9aaff]" />
              </div>
            </div>

            {/* status pills */}
            <div className="relative flex items-center gap-2 mb-5 flex-wrap">
              <StatusPill color="#22e4c7" label={claimed ? "Claimed · Cooldown 24h" : "Ready to claim"} active />
              <StatusPill color="#6e56f9" label="Daily limit available" />
              <StatusPill color="#ffffff" label="Monad Testnet" muted />
            </div>

            {/* action */}
            {!claimed ? (
              <button
                onClick={() => setClaimed(true)}
                className="group relative w-full h-14 rounded-[12px] bg-[#6e56f9] hover:bg-[#7d67ff] text-white flex items-center justify-center gap-2.5 transition-colors shadow-[0_0_32px_rgba(110,86,249,0.5)]"
                style={{ fontFamily: "Orbitron, sans-serif", fontSize: "14px", fontWeight: 700, letterSpacing: "0.12em" }}
              >
                <Droplets className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
                CLAIM mockUSDC
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ) : (
              <div
                className="relative rounded-[12px] border p-4"
                style={{
                  borderColor: "rgba(34,228,199,0.35)",
                  background: "linear-gradient(90deg, rgba(34,228,199,0.12), rgba(34,228,199,0.02))",
                  boxShadow: "0 0 24px rgba(34,228,199,0.2)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-[8px] bg-[#22e4c7]/20 border border-[#22e4c7]/50 flex items-center justify-center">
                    <Check className="h-4 w-4 text-[#22e4c7]" />
                  </div>
                  <div className="flex-1">
                    <div
                      className="text-[#22e4c7] uppercase tracking-[0.22em]"
                      style={{ fontFamily: "Orbitron, sans-serif", fontSize: "12px", fontWeight: 700 }}
                    >
                      mockUSDC Sent
                    </div>
                    <div
                      className="text-white/70 mt-0.5"
                      style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12.5px" }}
                    >
                      10,000 mockUSDC delivered to your wallet.
                    </div>
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <KV label="Tx Hash" value={txHash} icon={<ExternalLink className="h-3 w-3" />} />
                      <KV label="Balance" value={`${balance} mockUSDC`} />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setClaimed(false)}
                  className="absolute top-3 right-3 text-white/40 hover:text-white/70 transition-colors"
                  style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}
                >
                  Reset demo
                </button>
              </div>
            )}
          </div>

          {/* wallet side panel */}
          <div className="space-y-4">
            <div
              className="relative rounded-[14px] border border-white/10 p-4 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <div
                className="text-white/45 uppercase tracking-[0.25em] flex items-center gap-1.5"
                style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}
              >
                <Wallet className="h-3 w-3" /> Wallet
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div
                  className="h-7 w-7 rounded-[8px]"
                  style={{ background: "linear-gradient(135deg, #6e56f9, #22e4c7)" }}
                />
                <span
                  className="text-white"
                  style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "13px", fontWeight: 500 }}
                >
                  {address}
                </span>
                <button
                  onClick={copyAddr}
                  className="ml-auto h-7 w-7 rounded-md border border-white/10 hover:bg-white/5 text-white/50 hover:text-white flex items-center justify-center transition-colors"
                >
                  {copied ? <Check className="h-3 w-3 text-[#22e4c7]" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
              <div className="h-px bg-white/5 my-3" />
              <div className="flex items-center justify-between">
                <span
                  className="text-white/45 uppercase tracking-[0.2em]"
                  style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px" }}
                >
                  Network
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6e56f9] shadow-[0_0_6px_#6e56f9]" />
                  <span
                    className="text-white"
                    style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", fontWeight: 500 }}
                  >
                    Monad Testnet
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span
                  className="text-white/45 uppercase tracking-[0.2em]"
                  style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px" }}
                >
                  Balance
                </span>
                <span
                  className="text-white"
                  style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", fontWeight: 500 }}
                >
                  {balance} mockUSDC
                </span>
              </div>
            </div>

            <div
              className="rounded-[14px] border border-white/10 p-4 space-y-2.5"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <div
                className="text-white/45 uppercase tracking-[0.25em] flex items-center gap-1.5"
                style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}
              >
                <Info className="h-3 w-3" /> How to Use
              </div>
              <Tip text="Claim mockUSDC before the demo starts." />
              <Tip text="Use mockUSDC to pay room entry fees." />
              <Tip text="If you're on the wrong chain, switch to Monad Testnet." />
              <button
                onClick={onBack}
                className="w-full h-10 mt-2 rounded-[10px] border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white/80 hover:text-white flex items-center justify-center gap-2 transition-colors"
                style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12px", fontWeight: 500 }}
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Lobby
              </button>
            </div>

            <div
              className="rounded-[14px] border p-4"
              style={{
                borderColor: "rgba(245,181,68,0.25)",
                background: "rgba(245,181,68,0.06)",
              }}
            >
              <div className="flex items-start gap-2">
                <Coins className="h-3.5 w-3.5 text-[#f5b544] mt-0.5" />
                <div>
                  <div
                    className="text-[#f5b544] uppercase tracking-[0.22em]"
                    style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
                  >
                    Demo Notice
                  </div>
                  <p
                    className="text-white/60 mt-1"
                    style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12px", lineHeight: 1.5 }}
                  >
                    mockUSDC has no monetary value. It exists only for hackathon testing on Monad Testnet.
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

function StatusPill({ color, label, active = false, muted = false }: { color: string; label: string; active?: boolean; muted?: boolean }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
      style={{
        borderColor: muted ? "rgba(255,255,255,0.1)" : `${color}55`,
        background: muted ? "rgba(255,255,255,0.03)" : `${color}12`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          background: color,
          boxShadow: active ? `0 0 6px ${color}` : "none",
          animation: active ? "pulse 1.6s ease-in-out infinite" : "none",
        }}
      />
      <span
        className="uppercase tracking-[0.18em]"
        style={{
          color: muted ? "rgba(255,255,255,0.6)" : color,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "10px",
          fontWeight: 600,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function KV({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-white/10 bg-black/30">
      <span
        className="text-white/45 uppercase tracking-[0.18em]"
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
      {icon && <span className="text-white/40">{icon}</span>}
    </div>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="h-1 w-1 rounded-full bg-[#6e56f9] mt-1.5 shadow-[0_0_4px_#6e56f9]" />
      <span
        className="text-white/65"
        style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12.5px", lineHeight: 1.5 }}
      >
        {text}
      </span>
    </div>
  );
}
