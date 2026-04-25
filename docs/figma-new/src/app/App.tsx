import { useState } from "react";
import { TopNav } from "./components/TopNav";
import { Hero } from "./components/Hero";
import { Lobby } from "./components/Lobby";
import { Arena } from "./components/Arena";
import { CreateRoomModal } from "./components/CreateRoomModal";

export default function App() {
  const [view, setView] = useState<"landing" | "lobby" | "arena">("landing");
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        background: "#07070b",
        color: "white",
      }}
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
        />
        {view === "landing" && (
          <div className="flex-1 flex flex-col" style={{ minHeight: "calc(100vh - 73px)" }}>
            <Hero onPlay={() => setView("lobby")} />
          </div>
        )}
        {view === "lobby" && (
          <Lobby
            onCreateRoom={() => setCreateOpen(true)}
            onJoin={() => setView("arena")}
          />
        )}
        {view === "arena" && <Arena onBack={() => setView("lobby")} />}
      </div>

      <CreateRoomModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
