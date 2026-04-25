import { useState } from "react";
import { TopNav } from "./components/TopNav";
import { Hero } from "./components/Hero";
import { Lobby } from "./components/Lobby";

export default function App() {
  const [view, setView] = useState<"landing" | "lobby">("landing");

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        background: "#07070b",
        color: "white",
      }}
    >
      {/* ambient vignette */}
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
        />
        {view === "landing" ? (
          <div className="flex-1 flex flex-col" style={{ minHeight: "calc(100vh - 73px)" }}>
            <Hero onPlay={() => setView("lobby")} />
          </div>
        ) : (
          <Lobby />
        )}
      </div>
    </div>
  );
}
