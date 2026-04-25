import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { formatUnits } from "viem";

import { env } from "@/lib/env";

export type LiveRoom = {
  address: Address;
  id: number;
  source: "ops" | "mock";
  status: "waiting" | "live" | "finished";
  prize: string;
  prizeRaw: bigint;
  entry: string;
  entryRaw: bigint;
  players: number;
  maxPlayers: number;
  minPlayers: number;
  elimPct: number;
  interval: string;
  intervalSeconds: number;
  intervalLabel: string;
  round: number;
  nextRoundTime: number;
  winner: Address;
};

type OpsRoomResponse = {
  address: Address;
  status: string;
  statusCode: number;
  round: string | number;
  alive: string | number;
  totalPlayers: string | number;
  gameInfo: {
    prizePool: string;
    entryFee: string;
    minPlayers: string;
    maxPlayers: string;
    winner: Address;
  };
  roomConfig?: {
    roomId?: string | number;
    eliminationPct?: string | number;
    roundInterval?: string | number;
  };
  timeUntilNext: string | number;
};

export function useRoomDirectory(decimals = 6, refreshKey = 0) {
  return useQuery({
    queryKey: ["room-directory", "ops", decimals, refreshKey],
    placeholderData: (previous) => previous,
    retry: 2,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      let rooms: OpsRoomResponse[] = [];
      try {
        const response = await fetch(`${env.opsUrl}/api/rooms`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const payload = (await response.json()) as { rooms?: OpsRoomResponse[] };
          rooms = payload.rooms ?? [];
        }
      } catch {
        rooms = [];
      }

      const roomSet = rooms.length > 0 ? [...rooms, ...getMockRooms()] : getMockRooms();
      const seen = new Set<string>();

      const mockAddresses = new Set(getMockRooms().map((item) => item.address.toLowerCase()));

      return roomSet
        .filter((room) => {
          const key = room.address.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map((room, index) => {
        const prizeRaw = BigInt(room.gameInfo.prizePool);
        const entryRaw = BigInt(room.gameInfo.entryFee);
        const minPlayers = Number(room.gameInfo.minPlayers);
        const maxPlayers = Number(room.gameInfo.maxPlayers);
        const round = Number(room.round);
        const nextRoundTime = Number(room.timeUntilNext);
        const elimPct = Number(room.roomConfig?.eliminationPct ?? 0);
        const intervalSeconds = Number(room.roomConfig?.roundInterval ?? 0);
        const roomId = Number(room.roomConfig?.roomId ?? index + 1);
        const intervalLabel = intervalSeconds > 0 ? `${intervalSeconds}s` : "5s";

        return {
          address: room.address,
          id: roomId,
          source: mockAddresses.has(room.address.toLowerCase()) ? "mock" : "ops",
          status: mapStatus(room.statusCode, room.status),
          prize: formatUnits(prizeRaw, decimals),
          prizeRaw,
          entry: formatUnits(entryRaw, decimals),
          entryRaw,
          players: Number(room.totalPlayers),
          maxPlayers,
          minPlayers,
          elimPct,
          interval: intervalLabel,
          intervalSeconds,
          intervalLabel,
          round,
          nextRoundTime,
          winner: room.gameInfo.winner,
        } satisfies LiveRoom;
        });
    },
    refetchInterval: 5000,
  });
}

function getMockRooms(): OpsRoomResponse[] {
  const zero = "0x0000000000000000000000000000000000000000" as Address;

  return [
    {
      address: "0xaddbeBf119a6CB87e2E221ed3cE8cFf35aB3c774",
      status: "WAITING",
      statusCode: 0,
      round: 0,
      alive: 1,
      totalPlayers: 1,
      gameInfo: {
        prizePool: "10000000",
        entryFee: "1000000",
        minPlayers: "3",
        maxPlayers: "10",
        winner: zero,
      },
      roomConfig: { roomId: "1", eliminationPct: "30", roundInterval: "5" },
      timeUntilNext: "0",
    },
    {
      address: "0x1111111111111111111111111111111111111111",
      status: "ACTIVE",
      statusCode: 1,
      round: 4,
      alive: 6,
      totalPlayers: 8,
      gameInfo: {
        prizePool: "32000000",
        entryFee: "2000000",
        minPlayers: "3",
        maxPlayers: "10",
        winner: zero,
      },
      roomConfig: { roomId: "2", eliminationPct: "30", roundInterval: "5" },
      timeUntilNext: "8",
    },
    {
      address: "0x2222222222222222222222222222222222222222",
      status: "WAITING",
      statusCode: 0,
      round: 0,
      alive: 3,
      totalPlayers: 5,
      gameInfo: {
        prizePool: "15000000",
        entryFee: "1000000",
        minPlayers: "3",
        maxPlayers: "10",
        winner: zero,
      },
      roomConfig: { roomId: "3", eliminationPct: "40", roundInterval: "5" },
      timeUntilNext: "0",
    },
    {
      address: "0x3333333333333333333333333333333333333333",
      status: "FINISHED",
      statusCode: 2,
      round: 7,
      alive: 1,
      totalPlayers: 10,
      gameInfo: {
        prizePool: "50000000",
        entryFee: "5000000",
        minPlayers: "3",
        maxPlayers: "10",
        winner: "0x7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a" as Address,
      },
      roomConfig: { roomId: "4", eliminationPct: "20", roundInterval: "5" },
      timeUntilNext: "0",
    },
    {
      address: "0x4444444444444444444444444444444444444444",
      status: "ACTIVE",
      statusCode: 1,
      round: 2,
      alive: 9,
      totalPlayers: 10,
      gameInfo: {
        prizePool: "9000000",
        entryFee: "1000000",
        minPlayers: "3",
        maxPlayers: "10",
        winner: zero,
      },
      roomConfig: { roomId: "5", eliminationPct: "30", roundInterval: "5" },
      timeUntilNext: "3",
    },
  ];
}

function mapStatus(statusCode: number, fallbackStatus: string): LiveRoom["status"] {
  if (statusCode === 0) return "waiting";
  if (statusCode === 1) return "live";
  if (statusCode === 2) return "finished";
  if (fallbackStatus === "ACTIVE") return "live";
  if (fallbackStatus === "FINISHED") return "finished";
  return "waiting";
}
