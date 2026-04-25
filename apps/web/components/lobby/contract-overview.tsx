"use client";

import { useReadContract } from "wagmi";

import { factoryContract, roomContract } from "@/lib/contracts/config";

function formatResult(value: unknown): string {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map(formatResult).join(" | ");
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export function ContractOverview() {
  const roomCount = useReadContract({
    ...factoryContract,
    functionName: "getRoomCount",
  });

  const playerCount = useReadContract({
    ...roomContract,
    functionName: "getPlayerCount",
  });

  const gameInfo = useReadContract({
    ...roomContract,
    functionName: "getGameInfo",
  });

  return (
    <section className="panel">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Monad Testnet</p>
          <h2>Contract Wiring</h2>
        </div>
      </div>

      <div className="statsGrid">
        <article className="statCard">
          <span>Factory</span>
          <strong>{factoryContract.address}</strong>
        </article>
        <article className="statCard">
          <span>Demo Room</span>
          <strong>{roomContract.address}</strong>
        </article>
        <article className="statCard">
          <span>Total Rooms</span>
          <strong>{roomCount.data ? formatResult(roomCount.data) : "..."}</strong>
        </article>
        <article className="statCard">
          <span>Player Count</span>
          <strong>{playerCount.data ? formatResult(playerCount.data) : "..."}</strong>
        </article>
      </div>

      <div className="readBlock">
        <span>getGameInfo()</span>
        <code>{gameInfo.data ? formatResult(gameInfo.data) : "Loading on-chain state..."}</code>
      </div>
    </section>
  );
}
