import { useEffect } from "react";
import { X, LogIn, Hourglass, Swords, Shield, Trophy, Eye, ShieldCheck, Zap } from "lucide-react";

const STEPS = [
  { n: "01", icon: LogIn, title: "Join a Room", desc: "Connect your wallet, pay the entry fee, and you're locked in. Each room holds 20–50 players.", color: "#6e56f9" },
  { n: "02", icon: Hourglass, title: "Wait for Start", desc: "The match begins once minimum players are reached or the lobby countdown hits zero.", color: "#b9aaff" },
  { n: "03", icon: Swords, title: "Survive the Arena", desc: "Every 10–15 seconds a round triggers — a random % of alive wallets are eliminated on-chain.", color: "#ff3b5c" },
  { n: "04", icon: Shield, title: "Use Your Shield", desc: "Each player has one shield. It blocks exactly one elimination — time it right.", color: "#22e4c7" },
  { n: "05", icon: Trophy, title: "Last Wallet Wins", desc: "The final survivor claims the entire prize pool. Payout is instant and on-chain.", color: "#f5b544" },
];

export function HowItWorksModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0"
        style={{ background: "rgba(4,4,8,0.72)", backdropFilter: "blur(10px)" }}
      />

      <div
        className="relative w-full max-w-[640px] max-h-[90vh] overflow-auto rounded-[20px] border border-white/10"
        style={{
          background: "linear-gradient(180deg, rgba(22,20,40,0.96), rgba(10,10,18,0.98))",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(110,86,249,0.15), 0 0 60px rgba(110,86,249,0.25)",
        }}
      >
        <div
          className="absolute top-0 inset-x-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #6e56f9, transparent)" }}
        />
        <Cross style={{ top: 10, left: 10 }} />
        <Cross style={{ top: 10, right: 10 }} />
        <Cross style={{ bottom: 10, left: 10 }} />
        <Cross style={{ bottom: 10, right: 10 }} />

        {/* header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-start gap-3">
            <div
              className="h-10 w-10 rounded-[10px] flex items-center justify-center border border-[#6e56f9]/40"
              style={{ background: "rgba(110,86,249,0.15)", boxShadow: "0 0 20px rgba(110,86,249,0.3)" }}
            >
              <Swords className="h-4 w-4 text-[#b9aaff]" />
            </div>
            <div>
              <div
                className="text-[#b9aaff] uppercase tracking-[0.3em] mb-1"
                style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
              >
                // Rules · Fairness · Prize
              </div>
              <h2
                className="text-white"
                style={{ fontFamily: "Orbitron, sans-serif", fontSize: "22px", fontWeight: 800, letterSpacing: "-0.01em" }}
              >
                How It Works
              </h2>
              <p
                className="text-white/50 mt-1 max-w-[420px]"
                style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px", lineHeight: 1.5 }}
              >
                Last-Nad Standing is a real-time on-chain survival arena on Monad. Five steps. One survivor.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-[8px] border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* steps timeline */}
        <div className="px-6 pb-5 space-y-2.5">
          {STEPS.map((s, i) => (
            <StepRow key={s.n} step={s} last={i === STEPS.length - 1} />
          ))}
        </div>

        <div className="h-px bg-white/5 mx-6" />

        {/* bottom cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-6">
          <InfoCard
            icon={<Eye className="h-3.5 w-3.5" />}
            label="Spectate"
            text="Watch any live arena even if you're not playing."
            color="#6e56f9"
          />
          <InfoCard
            icon={<ShieldCheck className="h-3.5 w-3.5" />}
            label="Verifiable"
            text="Randomness is transparent and fully on-chain."
            color="#22e4c7"
          />
          <InfoCard
            icon={<Zap className="h-3.5 w-3.5" />}
            label="Why Monad"
            text="Fast enough for real-time on-chain game loops."
            color="#f5b544"
          />
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2.5 px-6 pb-6">
          <button
            onClick={onClose}
            className="h-11 px-5 rounded-[10px] border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white/80 hover:text-white transition-colors"
            style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px", fontWeight: 500 }}
          >
            Close
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-[10px] bg-[#6e56f9] hover:bg-[#7d67ff] text-white flex items-center justify-center gap-2 transition-colors shadow-[0_0_24px_rgba(110,86,249,0.45)]"
            style={{ fontFamily: "Orbitron, sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em" }}
          >
            ENTER ARENA
          </button>
        </div>
      </div>
    </div>
  );
}

function StepRow({ step, last }: { step: typeof STEPS[number]; last: boolean }) {
  const Icon = step.icon;
  return (
    <div className="relative flex gap-4">
      {/* left rail */}
      <div className="relative flex flex-col items-center">
        <div
          className="h-10 w-10 rounded-[10px] border flex items-center justify-center relative z-10"
          style={{
            borderColor: `${step.color}55`,
            background: `${step.color}12`,
            boxShadow: `0 0 16px ${step.color}30`,
          }}
        >
          <Icon className="h-4 w-4" style={{ color: step.color }} />
        </div>
        {!last && (
          <div
            className="w-px flex-1 mt-1"
            style={{ background: `linear-gradient(180deg, ${step.color}40, rgba(255,255,255,0.05))`, minHeight: "20px" }}
          />
        )}
      </div>

      {/* content */}
      <div className="flex-1 pb-2">
        <div className="flex items-baseline gap-2.5">
          <span
            className="uppercase tracking-[0.25em]"
            style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 700, color: step.color }}
          >
            {step.n}
          </span>
          <h3
            className="text-white"
            style={{ fontFamily: "Orbitron, sans-serif", fontSize: "14px", fontWeight: 700, letterSpacing: "0.02em" }}
          >
            {step.title}
          </h3>
        </div>
        <p
          className="text-white/55 mt-1"
          style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12.5px", lineHeight: 1.55 }}
        >
          {step.desc}
        </p>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, text, color }: { icon: React.ReactNode; label: string; text: string; color: string }) {
  return (
    <div
      className="relative rounded-[12px] border p-3.5 overflow-hidden"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-[2px]"
        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
      />
      <div
        className="flex items-center gap-1.5 uppercase tracking-[0.2em]"
        style={{ color, fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
      >
        {icon} {label}
      </div>
      <p
        className="text-white/65 mt-1.5"
        style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12px", lineHeight: 1.5 }}
      >
        {text}
      </p>
    </div>
  );
}

function Cross({ style }: { style: React.CSSProperties }) {
  return (
    <div className="absolute h-2.5 w-2.5 pointer-events-none" style={style}>
      <span className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-[#6e56f9]/50" />
      <span className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-[#6e56f9]/50" />
    </div>
  );
}
