"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { Abi } from "viem";
import { maxUint256 } from "viem";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract, usePublicClient } from "wagmi";

import { SearchIcon, SlidersHorizontalIcon } from "@/components/figma/icons";
import { RoomCard, type RoomStatus } from "@/components/figma/room-card";
import { mockUsdcContract, roomContract } from "@/lib/contracts/config";
import { getErrorMessage, switchToMonadNetwork } from "@/lib/network";
import { useRoomDirectory, type LiveRoom } from "@/lib/room-data";
import { monadTestnetChain } from "@/lib/wagmi/chain";

const FILTERS: { key: "all" | RoomStatus; label: string }[] = [
  { key: "all", label: "All Rooms" },
  { key: "live", label: "Live" },
  { key: "waiting", label: "Waiting" },
  { key: "finished", label: "Finished" },
];

export function Lobby({
  onCreateRoom,
  onJoin,
  onRoomsLoaded,
  onSpectate,
  refreshKey = 0,
}: {
  onCreateRoom?: () => void;
  onJoin?: (roomId: number) => void;
  onRoomsLoaded?: (rooms: LiveRoom[]) => void;
  onSpectate?: (roomId: number) => void;
  refreshKey?: number;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | RoomStatus>("all");
  const [actionRoomId, setActionRoomId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<"approve" | "join" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { address, chain, isConnected } = useAccount();
  const isOnMonad = chain?.id === monadTestnetChain.id;
  const decimalsQuery = useReadContract({
    ...mockUsdcContract,
    chainId: monadTestnetChain.id,
    functionName: "decimals",
  });
  const roomsQuery = useRoomDirectory(Number(decimalsQuery.data ?? 6), refreshKey);
  const liveRooms = useMemo(() => roomsQuery.data ?? [], [roomsQuery.data]);

  const { data: writeHash, error: writeError, isPending: isWritePending, writeContract } = useWriteContract();
  const { isSuccess: txSuccess, isLoading: isReceiptLoading } = useWaitForTransactionReceipt({ hash: writeHash });

  const publicClient = usePublicClient({ chainId: monadTestnetChain.id });

  const rooms = useMemo(
    () => (filter === "all" ? liveRooms : liveRooms.filter((room) => room.status === filter)),
    [filter, liveRooms],
  );

  useEffect(() => {
    if (roomsQuery.data) onRoomsLoaded?.(roomsQuery.data);
  }, [onRoomsLoaded, roomsQuery.data]);

  const roomWalletStateQuery = useQuery({
    enabled: Boolean(publicClient && address && liveRooms.length),
    queryKey: ["room-wallet-state", address, liveRooms.map((room) => room.address).join(",")],
    queryFn: async () => {
      if (!publicClient || !address) {
        return {
          allowances: {} as Record<number, bigint>,
          joined: {} as Record<number, boolean>,
        };
      }

      const allowances: Record<number, bigint> = {};
      const joined: Record<number, boolean> = {};

      for (const room of liveRooms) {
        const allowance = await publicClient.readContract({
          address: mockUsdcContract.address,
          abi: mockUsdcContract.abi as Abi,
          functionName: "allowance",
          args: [address, room.address],
        });

        allowances[room.id] = allowance as bigint;

        const player = await publicClient.readContract({
          address: room.address,
          abi: roomContract.abi as Abi,
          functionName: "getPlayerInfo",
          args: [address],
        });

        joined[room.id] = Boolean((player as { hasJoined: boolean }).hasJoined);
      }

      return {
        allowances,
        joined,
      };
    },
    refetchInterval: 8000,
  });

  const roomAllowances: Record<number, bigint> = roomWalletStateQuery.data?.allowances ?? {};
  const roomJoined: Record<number, boolean> = roomWalletStateQuery.data?.joined ?? {};

  useEffect(() => {
    if (!txSuccess) return;
    void roomsQuery.refetch();
    void roomWalletStateQuery.refetch();
    if (actionType === "approve" && actionRoomId) {
      const room = liveRooms.find((item) => item.id === actionRoomId);
      if (room) {
        setActionType("join");
        void roomWalletStateQuery.refetch().then(() => {
          writeContract({
            ...roomContract,
            address: room.address,
            chainId: monadTestnetChain.id,
            functionName: "joinRoom",
          });
        });
      }
      return;
    }
    if (actionType === "join" && actionRoomId) {
      onJoin ? onJoin(actionRoomId) : router.push(`/arena/${actionRoomId}`);
    }
  }, [actionRoomId, actionType, liveRooms, onJoin, roomWalletStateQuery, roomsQuery, router, txSuccess, writeContract]);

  const handlePrimaryAction = async (room: LiveRoom) => {
    setActionError(null);
    setActionRoomId(room.id);
    if (!isConnected || !address) return;
    if (!isOnMonad) {
      try {
        await switchToMonadNetwork();
      } catch (error) {
        setActionError(getErrorMessage(error) || "Failed to switch network.");
      }
      return;
    }
    if (room.status !== "waiting") {
      onSpectate ? onSpectate(room.id) : router.push(`/arena/${room.id}?mode=spectate`);
      return;
    }
    if (roomJoined[room.id]) {
      onJoin ? onJoin(room.id) : router.push(`/arena/${room.id}`);
      return;
    }
    const allowance = roomAllowances[room.id] ?? BigInt(0);
    try {
      if (allowance < room.entryRaw) {
        setActionType("approve");
        writeContract({
          ...mockUsdcContract,
          chainId: monadTestnetChain.id,
          functionName: "approve",
          args: [room.address, maxUint256],
        });
        return;
      }
      setActionType("join");
      writeContract({
        ...roomContract,
        address: room.address,
        chainId: monadTestnetChain.id,
        functionName: "joinRoom",
      });
    } catch (error) {
      setActionError(getErrorMessage(error) || "Failed to submit room action.");
    }
  };

  return (
    <section className="relative flex-1 overflow-auto">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at top, black 20%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1440px] px-10 py-10 lg:px-16">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div
              className="mb-2 text-[#6e56f9] uppercase tracking-[0.3em]"
              style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 600 }}
            >
              {"// Lobby"}
            </div>
            <h1
              className="text-white"
              style={{
                fontFamily: "Orbitron, sans-serif",
                fontSize: "36px",
                fontWeight: 800,
                letterSpacing: "-0.01em",
              }}
            >
              Choose Your Arena.
            </h1>
            <p
              className="mt-2 max-w-[520px] text-white/50"
              style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "14px", lineHeight: 1.6 }}
            >
              Join an active room, queue for the next round, or spectate a live match. All rooms
              are non-custodial and settled on Monad.
            </p>
            {actionError || writeError ? (
              <div
                className="mt-3 text-[#ff9aaa]"
                style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12px" }}
              >
                {actionError || getErrorMessage(writeError) || "Room action failed."}
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-10 w-[240px] items-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.03] px-3.5">
              <SearchIcon className="h-3.5 w-3.5 text-white/40" />
              <input
                className="flex-1 bg-transparent text-white outline-none placeholder:text-white/30"
                placeholder="Search room #"
                style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "13px" }}
              />
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.03] text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white">
              <SlidersHorizontalIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mb-6 flex w-fit items-center gap-1.5 rounded-[12px] border border-white/8 bg-white/[0.02] p-1">
          {FILTERS.map((filterOption) => {
            const active = filter === filterOption.key;
            const count =
              filterOption.key === "all"
                ? liveRooms.length
                : liveRooms.filter((room) => room.status === filterOption.key).length;

            return (
              <button
                key={filterOption.key}
                className="flex items-center gap-2 rounded-[8px] px-3.5 py-1.5 transition-colors"
                onClick={() => setFilter(filterOption.key)}
                style={{
                  background: active ? "rgba(110,86,249,0.18)" : "transparent",
                  color: active ? "#ffffff" : "rgba(255,255,255,0.55)",
                  border: active ? "1px solid rgba(110,86,249,0.4)" : "1px solid transparent",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: "12px",
                  fontWeight: 500,
                }}
                type="button"
              >
                {filterOption.label}
                <span
                  className="rounded-md px-1.5 py-0.5"
                  style={{
                    background: active ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.05)",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "10px",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              onJoin={() => void handlePrimaryAction(room)}
              onSpectate={() =>
                onSpectate ? onSpectate(room.id) : router.push(`/arena/${room.id}?mode=spectate`)
              }
              primaryDisabled={
                room.source === "mock" || (isWritePending || isReceiptLoading ? actionRoomId !== room.id : undefined)
              }
              primaryLabel={getPrimaryLabel({
                actionRoomId,
                address,
                isConnected,
                isOnMonad,
                joined: roomJoined[room.id],
                loading: isWritePending || isReceiptLoading,
                room,
                roomAllowance: roomAllowances[room.id] ?? BigInt(0),
                actionType,
              })}
              room={room}
            />
          ))}
        </div>

        <div
          className="mt-10 text-center text-white/30 uppercase tracking-[0.3em]"
          style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px" }}
        >
          {roomsQuery.isLoading
            ? "— Loading rooms —"
            : roomsQuery.isError
              ? "— Ops room cache unavailable —"
              : "— Live ops room cache —"}
        </div>
      </div>
    </section>
  );
}

function getPrimaryLabel({
  actionRoomId,
  address,
  isConnected,
  isOnMonad,
  joined,
  loading,
  room,
  roomAllowance,
  actionType,
}: {
  actionRoomId: number | null;
  address?: string;
  isConnected: boolean;
  isOnMonad: boolean;
  joined?: boolean;
  loading: boolean;
  room: LiveRoom;
  roomAllowance: bigint;
  actionType: "approve" | "join" | null;
}) {
  if (room.source === "mock") return "PREVIEW";
  if (room.status === "finished") return "CLOSED";
  if (!isConnected || !address) return "CONNECT";
  if (!isOnMonad) return "SWITCH";
  if (room.status === "live") return "WATCH";
  if (joined) return "ENTER";
  if (loading && actionRoomId === room.id) {
    return actionType === "approve" ? "APPROVING..." : "JOINING...";
  }
  return roomAllowance < room.entryRaw ? "APPROVE USDC" : "JOIN ROOM";
}
