"use client";

export const dynamic = "force-dynamic";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { CreateRoomModal } from "@/components/figma/create-room-modal";
import { Faucet } from "@/components/figma/faucet";
import { Hero } from "@/components/figma/hero";
import { HowItWorksModal } from "@/components/figma/how-it-works-modal";
import { Lobby } from "@/components/figma/lobby";
import { TopNav } from "@/components/figma/top-nav";
import type { LiveRoom } from "@/lib/room-data";

export default function HomePage() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [view, setView] = useState<"landing" | "lobby" | "faucet">("landing");
  const [roomRefreshKey, setRoomRefreshKey] = useState(0);
  const [rooms, setRooms] = useState<LiveRoom[]>([]);

  const liveCount = rooms.filter((room) => room.status !== "finished").length;
  const onlineCount = rooms.reduce((total, room) => total + room.players, 0);
  const handleRoomCreated = useCallback(() => {
    setRoomRefreshKey((current) => current + 1);
  }, []);
  const handleCloseCreate = useCallback(() => setCreateOpen(false), []);
  const handleCloseHow = useCallback(() => setHowOpen(false), []);
  const handleHome = useCallback(() => setView("landing"), []);
  const handleLobby = useCallback(() => setView("lobby"), []);
  const handleFaucet = useCallback(() => setView("faucet"), []);

  return (
    <div className="min-h-screen w-full bg-[#07070b] text-white">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(110,86,249,0.08),transparent_60%),radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(110,86,249,0.05),transparent_60%)]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <TopNav
          liveCount={liveCount || 12}
          onlineCount={onlineCount || 2384}
          onCreateRoom={() => setCreateOpen(true)}
          onFaucet={handleFaucet}
          onHome={handleHome}
          onHowItWorks={() => setHowOpen(true)}
          onPlay={handleLobby}
          variant={view}
        />
        {view === "landing" ? (
          <div className="flex flex-1 flex-col" style={{ minHeight: "calc(100vh - 73px)" }}>
            <Hero onHowItWorks={() => setHowOpen(true)} onPlay={handleLobby} />
          </div>
        ) : view === "faucet" ? (
          <Faucet onBack={handleLobby} />
        ) : (
          <Lobby
            onCreateRoom={() => setCreateOpen(true)}
            onJoin={(roomId) => router.push(`/arena/${roomId}`)}
            onRoomsLoaded={setRooms}
            onSpectate={(roomId) => router.push(`/arena/${roomId}?mode=spectate`)}
            refreshKey={roomRefreshKey}
          />
        )}
      </div>
      <CreateRoomModal onClose={handleCloseCreate} onCreated={handleRoomCreated} open={createOpen} />
      <HowItWorksModal onClose={handleCloseHow} open={howOpen} />
    </div>
  );
}
