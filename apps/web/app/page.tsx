"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { CreateRoomModal } from "@/components/figma/create-room-modal";
import { Hero } from "@/components/figma/hero";
import { HowItWorksModal } from "@/components/figma/how-it-works-modal";
import { Lobby } from "@/components/figma/lobby";
import { TopNav } from "@/components/figma/top-nav";
import { mockRooms } from "@/lib/mock/rooms";

export default function HomePage() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [view, setView] = useState<"landing" | "lobby">("landing");

  const liveCount = mockRooms.filter((room) => room.status !== "FINISHED").length;
  const onlineCount = mockRooms.reduce((total, room) => total + room.players, 0);

  return (
    <div className="min-h-screen w-full bg-[#07070b] text-white">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(110,86,249,0.08),transparent_60%),radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(110,86,249,0.05),transparent_60%)]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <TopNav
          liveCount={liveCount}
          onlineCount={onlineCount}
          onCreateRoom={() => setCreateOpen(true)}
          onFaucet={() => router.push("/faucet")}
          onHome={() => setView("landing")}
          onHowItWorks={() => setHowOpen(true)}
          onPlay={() => setView("lobby")}
          variant={view}
        />

        {view === "landing" ? (
          <div className="flex flex-1 flex-col" style={{ minHeight: "calc(100vh - 73px)" }}>
            <Hero onHowItWorks={() => setHowOpen(true)} onPlay={() => setView("lobby")} />
          </div>
        ) : (
          <Lobby
            onCreateRoom={() => setCreateOpen(true)}
            onJoin={(roomId) => router.push(`/arena/${roomId}`)}
            onSpectate={(roomId) => router.push(`/arena/${roomId}?mode=spectate`)}
          />
        )}
      </div>

      <CreateRoomModal onClose={() => setCreateOpen(false)} open={createOpen} />
      <HowItWorksModal onClose={() => setHowOpen(false)} open={howOpen} />
    </div>
  );
}
