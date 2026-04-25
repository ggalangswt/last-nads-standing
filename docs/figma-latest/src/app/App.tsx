import { useState } from "react";
import { TopNav } from "./components/TopNav";
import { Hero } from "./components/Hero";
import { Lobby } from "./components/Lobby";
import { Arena } from "./components/Arena";
import { Spectate } from "./components/Spectate";
import { Faucet } from "./components/Faucet";
import { CreateRoomModal } from "./components/CreateRoomModal";
import { HowItWorksModal } from "./components/HowItWorksModal";

type View = "landing" | "lobby" | "arena" | "spectate" | "faucet";

export default function App() {
  const [view, setView] = useState<View>("landing");
  const [createOpen, setCreateOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ background: "#07070b", color: "white" }}
    >
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(110,86,249,0.08), transparent 60%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(110,86,249,0.05), transparent 60%)",
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <TopNav
          variant={view}
          onPlay={() => setView("lobby")}
          onHome={() => setView("landing")}
          onCreateRoom={() => setCreateOpen(true)}
          onHowItWorks={() => setHowOpen(true)}
          onFaucet={() => setView("faucet")}
        />
        {view === "landing" && (
          <div className="flex-1 flex flex-col" style={{ minHeight: "calc(100vh - 73px)" }}>
            <Hero onPlay={() => setView("lobby")} onHowItWorks={() => setHowOpen(true)} />
          </div>
        )}
        {view === "lobby" && (
          <Lobby
            onCreateRoom={() => setCreateOpen(true)}
            onJoin={() => setView("arena")}
            onSpectate={() => setView("spectate")}
          />
        )}
        {view === "arena" && <Arena onBack={() => setView("lobby")} />}
        {view === "spectate" && <Spectate onBack={() => setView("lobby")} />}
        {view === "faucet" && <Faucet onBack={() => setView("lobby")} />}
      </div>

      <CreateRoomModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <HowItWorksModal open={howOpen} onClose={() => setHowOpen(false)} />
    </div>
  );
}
