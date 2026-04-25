import { useQuery } from "@tanstack/react-query";
import type { Abi, Address } from "viem";
import { usePublicClient } from "wagmi";

import { factoryContract, roomContract } from "@/lib/contracts/config";
import { monadTestnetChain } from "@/lib/wagmi/chain";

export type RoomPlayerState = {
  address: Address;
  hasJoined: boolean;
  isAlive: boolean;
  eliminatedAtRound: number;
};

export function useRoomState(roomId: string) {
  const publicClient = usePublicClient({ chainId: monadTestnetChain.id });

  return useQuery({
    enabled: Boolean(publicClient && roomId),
    queryKey: ["room-state", roomId],
    queryFn: async () => {
      if (!publicClient) throw new Error("No public client");

      const roomAddress = (await publicClient.readContract({
        address: factoryContract.address,
        abi: factoryContract.abi as Abi,
        functionName: "roomById",
        args: [BigInt(roomId)],
      })) as Address;

      const zeroAddress = "0x0000000000000000000000000000000000000000";
      if (roomAddress.toLowerCase() === zeroAddress) {
        throw new Error("Room not found");
      }

      const [gameInfo, allPlayers, alivePlayers] = await Promise.all([
        publicClient.readContract({
          address: roomAddress,
          abi: roomContract.abi as Abi,
          functionName: "getGameInfo",
        }),
        publicClient.readContract({
          address: roomAddress,
          abi: roomContract.abi as Abi,
          functionName: "getAllPlayers",
        }),
        publicClient.readContract({
          address: roomAddress,
          abi: roomContract.abi as Abi,
          functionName: "getAlivePlayers",
        }),
      ]);

      const playerInfos = await publicClient.multicall({
        allowFailure: false,
        contracts: (allPlayers as Address[]).map((player) => ({
          address: roomAddress,
          abi: roomContract.abi as Abi,
          functionName: "getPlayerInfo",
          args: [player],
        })),
      });

      const normalizedPlayers: RoomPlayerState[] = (allPlayers as Address[]).map((player, index) => {
        const info = playerInfos[index] as {
          hasJoined: boolean;
          isAlive: boolean;
          eliminatedAtRound: bigint;
        };

        return {
          address: player,
          hasJoined: info.hasJoined,
          isAlive: info.isAlive,
          eliminatedAtRound: Number(info.eliminatedAtRound),
        };
      });

      return {
        roomAddress,
        gameInfo: gameInfo as {
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
        },
        allPlayers: allPlayers as Address[],
        alivePlayers: alivePlayers as Address[],
        players: normalizedPlayers,
      };
    },
    refetchInterval: 5000,
  });
}
