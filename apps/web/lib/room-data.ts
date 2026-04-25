import { useQuery } from "@tanstack/react-query";
import type { Abi, Address } from "viem";
import { formatUnits } from "viem";
import { usePublicClient } from "wagmi";

import { factoryContract, roomContract } from "@/lib/contracts/config";
import { monadTestnetChain } from "@/lib/wagmi/chain";

export type LiveRoom = {
  address: Address;
  id: number;
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
  round: number;
  nextRoundTime: number;
  winner: Address;
};

export function useRoomDirectory(decimals = 6, refreshKey = 0) {
  const publicClient = usePublicClient({ chainId: monadTestnetChain.id });

  return useQuery({
    enabled: Boolean(publicClient),
    queryKey: ["room-directory", decimals, refreshKey],
    queryFn: async () => {
      if (!publicClient) throw new Error("No public client");

      const roomCountRaw = await publicClient.readContract({
        address: factoryContract.address,
        abi: factoryContract.abi as Abi,
        functionName: "getRoomCount",
      });

      const roomCount = Number(roomCountRaw);
      if (roomCount === 0) return [] satisfies LiveRoom[];

      const roomAddressesResult = await publicClient.multicall({
        allowFailure: false,
        contracts: Array.from({ length: roomCount }, (_, index) => ({
          address: factoryContract.address,
          abi: factoryContract.abi as Abi,
          functionName: "allRooms",
          args: [BigInt(index)],
        })),
      });

      const roomAddresses = roomAddressesResult as Address[];

      const gameInfos = await publicClient.multicall({
        allowFailure: false,
        contracts: roomAddresses.map((address) => ({
          address,
          abi: roomContract.abi as Abi,
          functionName: "getGameInfo",
        })),
      });

      const basics = await publicClient.multicall({
        allowFailure: false,
        contracts: roomAddresses.flatMap((address) => [
          {
            address,
            abi: roomContract.abi as Abi,
            functionName: "roomId",
          },
          {
            address,
            abi: roomContract.abi as Abi,
            functionName: "eliminationPct",
          },
          {
            address,
            abi: roomContract.abi as Abi,
            functionName: "roundInterval",
          },
        ]),
      });

      return roomAddresses.map((address, index) => {
        const info = gameInfos[index] as {
          status: number;
          currentRound: bigint;
          prizePool: bigint;
          playersAlive: bigint;
          totalPlayers: bigint;
          winner: Address;
          lastRoundTime: bigint;
          nextRoundTime: bigint;
          entryFee: bigint;
          minPlayers: bigint;
          maxPlayers: bigint;
        };

        const roomId = Number(basics[index * 3] as bigint);
        const elimPct = Number(basics[index * 3 + 1] as bigint);
        const intervalSeconds = Number(basics[index * 3 + 2] as bigint);

        return {
          address,
          id: roomId,
          status: mapStatus(info.status),
          prize: formatUnits(info.prizePool, decimals),
          prizeRaw: info.prizePool,
          entry: formatUnits(info.entryFee, decimals),
          entryRaw: info.entryFee,
          players: Number(info.totalPlayers),
          maxPlayers: Number(info.maxPlayers),
          minPlayers: Number(info.minPlayers),
          elimPct,
          interval: `${intervalSeconds}s`,
          intervalSeconds,
          round: Number(info.currentRound),
          nextRoundTime: Number(info.nextRoundTime),
          winner: info.winner,
        } satisfies LiveRoom;
      });
    },
    refetchInterval: 8000,
  });
}

function mapStatus(status: number): LiveRoom["status"] {
  if (status === 0) return "waiting";
  if (status === 1) return "live";
  return "finished";
}
