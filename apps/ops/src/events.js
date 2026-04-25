import { getContract } from "viem";
import { opsContracts } from "./contracts.js";

const FACTORY_EVENT_MAP = {
  RoomCreated: "room_created",
};

const ROOM_EVENT_MAP = {
  PlayerJoined: "player_joined",
  GameStarted: "game_started",
  RoundStarted: "round_started",
  RoundExecuted: "round_executed",
  PlayerEliminated: "player_eliminated",
  ShieldBlocked: "shield_blocked",
  GameFinished: "game_finished",
  WinnerDeclared: "game_winner",
  PrizeClaimed: "prize_claimed",
};

export class EventMonitor {
  constructor(publicClient, onBroadcast) {
    this.publicClient = publicClient;
    this.onBroadcast = onBroadcast;
    this.unwatchers = [];
  }

  async startMonitoring() {
    this.stopAll();

    const factoryContract = getContract({
      address: opsContracts.factory.address,
      abi: opsContracts.factory.abi,
      client: this.publicClient,
    });

    this.unwatchers.push(
      this.publicClient.watchContractEvent({
        address: factoryContract.address,
        abi: factoryContract.abi,
        onLogs: (logs) => {
          for (const log of logs) {
            const type = FACTORY_EVENT_MAP[log.eventName];
            if (!type) continue;

            this.onBroadcast(type, {
              roomAddress: log.args?.roomAddress,
              creator: log.args?.creator,
              roomId: log.args?.roomId,
              entryFee: log.args?.entryFee,
              transactionHash: log.transactionHash,
            });
          }
        },
      })
    );

    const [activeRooms, waitingRooms] = await Promise.all([
      factoryContract.read.getActiveRooms().catch(() => []),
      factoryContract.read.getWaitingRooms().catch(() => []),
    ]);
    const roomAddresses = Array.from(new Set([...activeRooms, ...waitingRooms]));
    for (const roomAddress of roomAddresses) {
      this.watchRoom(roomAddress);
    }

    this.unwatchers.push(
      this.publicClient.watchContractEvent({
      address: factoryContract.address,
      abi: factoryContract.abi,
        eventName: "RoomCreated",
        onLogs: (logs) => {
          for (const log of logs) {
            const roomAddress = log.args?.roomAddress;
            if (!roomAddress) continue;
            this.watchRoom(roomAddress);
          }
        },
      })
    );
  }

  watchRoom(roomAddress) {
    const unwatch = this.publicClient.watchContractEvent({
      address: roomAddress,
      abi: opsContracts.demoRoom.abi,
      onLogs: (logs) => {
        for (const log of logs) {
          const type = ROOM_EVENT_MAP[log.eventName];
          if (!type) continue;

          this.onBroadcast(type, {
            roomAddress,
            ...Object.fromEntries(
              Object.entries(log.args ?? {}).filter(([key]) => Number.isNaN(Number(key)))
            ),
            transactionHash: log.transactionHash,
          });
        }
      },
    });

    this.unwatchers.push(unwatch);
  }

  stopAll() {
    for (const stop of this.unwatchers) {
      try {
        stop();
      } catch {}
    }
    this.unwatchers = [];
  }
}
