"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { CreateRoomModal } from "@/components/figma/create-room-modal";
import { Faucet } from "@/components/figma/faucet";
import { HowItWorksModal } from "@/components/figma/how-it-works-modal";
import { TopNav } from "@/components/figma/top-nav";

export default function FaucetPage() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#07070b] text-white">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(110,86,249,0.08),transparent_60%),radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(110,86,249,0.05),transparent_60%)]" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <TopNav
          liveCount={12}
          onlineCount={2384}
          onCreateRoom={() => setCreateOpen(true)}
          onFaucet={() => router.push("/faucet")}
          onHome={() => router.push("/")}
          onHowItWorks={() => setHowOpen(true)}
          onPlay={() => router.push("/")}
          variant="faucet"
        />
        <Faucet onBack={() => router.push("/")} />
      </div>

      <CreateRoomModal onClose={() => setCreateOpen(false)} open={createOpen} />
      <HowItWorksModal onClose={() => setHowOpen(false)} open={howOpen} />
    </div>
  );
}
