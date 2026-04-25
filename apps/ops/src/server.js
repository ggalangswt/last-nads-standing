import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
import { createPublicClient, getContract, http, isAddress, parseUnits } from "viem";
import { KeeperService } from "./keeper.js";
import { EventMonitor } from "./events.js";
import { opsContracts } from "./contracts.js";

dotenv.config();

const rpcUrl = process.env.MONAD_RPC_URL || "https://testnet-rpc.monad.xyz";
const port = Number(process.env.OPS_PORT || 3001);
const host = process.env.OPS_HOST || "127.0.0.1";
const cacheTtlMs = Number(process.env.CACHE_TTL || 5000);
const keeperIntervalMs = Number(process.env.KEEPER_INTERVAL_MS || 5000);
const statusIntervalMs = Number(process.env.GAME_STATUS_INTERVAL_MS || 5000);
const maxListedRooms = Number(process.env.MAX_LISTED_ROOMS || 8);
const autoStartGames = process.env.AUTO_START_GAMES !== "false";
const demoEntryFee = process.env.DEMO_ENTRY_FEE || "1";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

const chain = {
  id: opsContracts.chainId,
  name: "Monad Testnet",
  nativeCurrency: {
    name: "MON",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [rpcUrl],
    },
  },
};

const publicClient = createPublicClient({
  chain,
  transport: http(rpcUrl),
});

const factoryContract = getContract({
  address: opsContracts.factory.address,
  abi: opsContracts.factory.abi,
  client: publicClient,
});

const keeperService = new KeeperService(rpcUrl, process.env.KEEPER_PRIVATE_KEY);
const roomCache = new Map();
const eventMonitor = new EventMonitor(publicClient, broadcastUpdate);
const gameStatusLabels = ["WAITING", "ACTIVE", "FINISHED"];
const invalidatingEvents = new Set([
  "room_created",
  "player_joined",
  "game_started",
  "round_started",
  "round_executed",
  "player_eliminated",
  "shield_blocked",
  "game_finished",
  "game_winner",
  "prize_claimed",
]);

let keeperTickInProgress = false;
let demoRoomBootstrapInProgress = false;

app.set("json replacer", (_key, value) => {
  if (typeof value === "bigint") return value.toString();
  return value;
});

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

function toJsonValue(value) {
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map(toJsonValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => Number.isNaN(Number(key)))
        .map(([key, item]) => [key, toJsonValue(item)])
    );
  }
  return value;
}

function getStatusLabel(status) {
  return gameStatusLabels[Number(status)] || "UNKNOWN";
}

function normalizeGameInfo(gameInfo) {
  const serialized = toJsonValue(gameInfo);
  const statusCode = Number(gameInfo.status);

  return {
    ...serialized,
    status: statusCode,
    statusLabel: getStatusLabel(statusCode),
  };
}

function validateAddressParam(address, res) {
  if (!isAddress(address)) {
    res.status(400).json({ error: "Invalid room address" });
    return false;
  }
  return true;
}

function getRoomContract(roomAddress) {
  return getContract({
    address: roomAddress,
    abi: opsContracts.demoRoom.abi,
    client: publicClient,
  });
}

function getCachedRoom(roomAddress) {
  const cached = roomCache.get(roomAddress.toLowerCase());
  if (cached && Date.now() - cached.timestamp < cacheTtlMs) {
    return cached.data;
  }
  return null;
}

function setCachedRoom(roomAddress, data) {
  roomCache.set(roomAddress.toLowerCase(), {
    data,
    timestamp: Date.now(),
  });
}

function invalidateRoom(roomAddress) {
  if (roomAddress) {
    roomCache.delete(roomAddress.toLowerCase());
  }
}

async function ensureDemoRoomExists() {
  if (!keeperService.hasWallet || demoRoomBootstrapInProgress) {
    return;
  }

  demoRoomBootstrapInProgress = true;

  try {
    const configured = await keeperService.configureDemoDefaults();
    if (!configured.success) {
      console.log("Demo room bootstrap: could not configure defaults:", configured.reason || configured.error);
    }

    const roomAddresses = await getRoomAddresses();
    if (roomAddresses.length > 0) {
      const demoRoom = opsContracts.demoRoom.address;
      const demoRoomState = await getRoomInfo(demoRoom, { force: true, includePlayers: true }).catch(() => null);
      if (demoRoomState && Number(demoRoomState.totalPlayers) < 8) {
        const seeded = await keeperService.bootstrapDemoRoom(demoRoom, 8);
        if (seeded.success) {
          roomCache.clear();
        }
      }
      return;
    }

    const result = await keeperService.createDefaultRoom(parseUnits(demoEntryFee, 6));
    if (result.success) {
      roomCache.clear();
      console.log(`Demo room bootstrap: created ${result.roomAddress || "new demo room"} tx=${result.transactionHash}`);
    } else {
      console.log("Demo room bootstrap: failed to create room:", result.reason || result.error);
    }
  } catch (error) {
    console.error("Demo room bootstrap error:", error);
  } finally {
    demoRoomBootstrapInProgress = false;
  }
}

function broadcastUpdate(type, data = {}) {
  const payload = toJsonValue(data);

  if (type === "room_created") {
    roomCache.clear();
  } else if (invalidatingEvents.has(type) && payload.roomAddress) {
    invalidateRoom(payload.roomAddress);
  }

  const message = {
    type,
    ...payload,
    data: payload,
    timestamp: Date.now(),
  };

  io.emit(type, message);

  if (type === "player_joined" && autoStartGames && payload.roomAddress) {
    setTimeout(() => {
      void progressRoom(payload.roomAddress);
    }, 800);
  }
}

async function getPlayerDetails(roomContract, playerAddresses) {
  const players = await Promise.all(
    playerAddresses.map(async (playerAddress) => {
      const playerInfo = await roomContract.read.getPlayerInfo([playerAddress]);
      return {
        address: playerAddress,
        ...toJsonValue(playerInfo),
      };
    })
  );

  return players;
}

async function getRoomInfo(roomAddress, { force = false, includePlayers = false } = {}) {
  if (!force && !includePlayers) {
    const cached = getCachedRoom(roomAddress);
    if (cached) return cached;
  }

  try {
    const roomContract = getRoomContract(roomAddress);
    const [
      rawGameInfo,
      canExecute,
      timeUntilNext,
      roomId,
      eliminationPct,
      roundInterval,
    ] =
      await Promise.all([
        roomContract.read.getGameInfo(),
        roomContract.read.canExecuteRound(),
        roomContract.read.timeUntilNextRound(),
        roomContract.read.roomId(),
        roomContract.read.eliminationPct(),
        roomContract.read.roundInterval(),
      ]);

    const gameInfo = normalizeGameInfo(rawGameInfo);
    const roomData = {
      address: roomAddress,
      status: gameInfo.statusLabel,
      statusCode: gameInfo.status,
      round: gameInfo.currentRound,
      alive: gameInfo.playersAlive,
      totalPlayers: gameInfo.totalPlayers,
      gameInfo,
      roomConfig: {
        roomId: roomId.toString(),
        eliminationPct: eliminationPct.toString(),
        roundInterval: roundInterval.toString(),
      },
      canExecute,
      timeUntilNext: timeUntilNext.toString(),
      lastUpdated: Date.now(),
    };

    if (!includePlayers) {
      setCachedRoom(roomAddress, roomData);
      return roomData;
    }

    const [allPlayers, alivePlayers] = await Promise.all([
      roomContract.read.getAllPlayers(),
      roomContract.read.getAlivePlayers(),
    ]);
    const playerDetails = await getPlayerDetails(roomContract, allPlayers);

    return {
      ...roomData,
      players: playerDetails,
      playerAddresses: toJsonValue(allPlayers),
      alivePlayers: toJsonValue(alivePlayers),
    };
  } catch (error) {
    console.error(`Error fetching room info for ${roomAddress}:`, error);
    return null;
  }
}

async function getRoomAddresses() {
  const [activeRooms, waitingRooms] = await Promise.all([
    factoryContract.read.getActiveRooms().catch(() => []),
    factoryContract.read.getWaitingRooms().catch(() => []),
  ]);

  const roomAddresses = Array.from(new Set([...activeRooms, ...waitingRooms]));
  return roomAddresses.slice(-maxListedRooms);
}

function getGameStatusPayload(roomInfo) {
  return {
    roomAddress: roomInfo.address,
    status: roomInfo.status,
    statusCode: roomInfo.statusCode,
    round: roomInfo.round,
    alive: roomInfo.alive,
    playersAlive: roomInfo.alive,
    totalPlayers: roomInfo.totalPlayers,
    canExecute: roomInfo.canExecute,
    timeUntilNext: roomInfo.timeUntilNext,
    keeperConfigured: keeperService.hasWallet,
  };
}

async function getActiveRoomsData({ force = false } = {}) {
  const roomAddresses = await getRoomAddresses();
  const rooms = await Promise.all(
    roomAddresses.map((roomAddress) => getRoomInfo(roomAddress, { force }))
  );

  return rooms.filter(Boolean);
}

async function broadcastGameStatuses() {
  try {
    const rooms = await getActiveRoomsData({ force: true });
    rooms.forEach((roomInfo) => {
      broadcastUpdate("game_status", getGameStatusPayload(roomInfo));
    });

    if (rooms.length === 0) {
      await ensureDemoRoomExists();
    }
  } catch (error) {
    console.error("Error broadcasting game status:", error);
  }
}

async function progressRoom(roomAddress) {
  const status = await keeperService.getRoomStatus(roomAddress);
  if (!status) return;

  if (autoStartGames && status.canStart) {
    if (!keeperService.hasWallet) {
      broadcastUpdate("game_status", {
        roomAddress,
        status: "WAITING",
        canStart: true,
        keeperConfigured: false,
        note: "Keeper wallet not configured for automatic game start",
      });
      return;
    }

    console.log(`Keeper: Starting game for room ${roomAddress}`);
    const result = await keeperService.startGame(roomAddress);
    invalidateRoom(roomAddress);

    if (!result.success) {
      console.log(`Keeper: Failed to start game for ${roomAddress}: ${result.reason || result.error}`);
    }
    return;
  }

  if (!status.canExecute) return;

  if (!keeperService.hasWallet) {
    broadcastUpdate("round_ready", {
      roomAddress,
      canExecute: true,
      keeperConfigured: false,
      note: "Keeper wallet not configured for automatic execution",
    });
    return;
  }

  console.log(`Keeper: Executing round for room ${roomAddress}`);
  const result = await keeperService.executeRound(roomAddress);
  invalidateRoom(roomAddress);

  if (!result.success) {
    console.log(`Keeper: Failed to execute round for ${roomAddress}: ${result.reason || result.error}`);
  }
}

async function checkAndProgressGames() {
  if (keeperTickInProgress) return;
  keeperTickInProgress = true;

  try {
    const activeRooms = await getRoomAddresses();
    await Promise.all(activeRooms.map((roomAddress) => progressRoom(roomAddress)));
    if (activeRooms.length === 0) {
      await ensureDemoRoomExists();
    }
  } catch (error) {
    console.error("Keeper: Error in game progress loop:", error);
  } finally {
    keeperTickInProgress = false;
  }
}

io.on("connection", (socket) => {
  console.log("Socket.IO client connected:", socket.id);

  socket.emit("connected", {
    type: "connected",
    message: "Connected to Last Nads Standing ops server",
    socketId: socket.id,
    timestamp: Date.now(),
  });

  socket.on("spectator_react", (data = {}) => {
    broadcastUpdate("spectator_react", {
      roomAddress: data.roomAddress,
      emoji: data.emoji,
      from: data.from || socket.id,
    });
  });

  socket.on("disconnect", () => {
    console.log("Socket.IO client disconnected:", socket.id);
  });

  socket.on("error", (error) => {
    console.error("Socket.IO error:", error);
  });
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "ops",
    port,
    socketUrl: `https://ops-production-edd1.up.railway.app`,
    chainId: opsContracts.chainId,
    keeperConfigured: keeperService.hasWallet,
    keeperIntervalMs,
    statusIntervalMs,
    timestamp: Date.now(),
  });
});

app.get("/", (_req, res) => {
  res.json({
    name: "Last Nads Standing Ops",
    status: "ready",
    endpoints: [
      "GET /health",
      "GET /contracts",
      "GET /api/rooms",
      "GET /api/rooms/:address",
      "GET /api/rooms/:address/players",
      "POST /api/rooms/start/:address",
      "POST /api/rooms/:address/execute-round",
    ],
    socketEvents: [
      "player_joined",
      "player_eliminated",
      "round_started",
      "game_winner",
      "game_status",
      "spectator_react",
    ],
  });
});

app.get("/contracts", (_req, res) => {
  res.json(opsContracts);
});

async function handleGetRooms(_req, res) {
  try {
    const rooms = await getActiveRoomsData();
    res.json({
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    console.error("Error fetching active rooms:", error);
    res.status(500).json({ error: "Failed to fetch active rooms" });
  }
}

async function handleGetRoom(req, res) {
  const { address } = req.params;
  if (!validateAddressParam(address, res)) return;

  try {
    const roomInfo = await getRoomInfo(address, { includePlayers: true });

    if (!roomInfo) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json(roomInfo);
  } catch (error) {
    console.error(`Error fetching room ${address}:`, error);
    res.status(500).json({ error: "Failed to fetch room info" });
  }
}

async function handleGetPlayers(req, res) {
  const { address } = req.params;
  if (!validateAddressParam(address, res)) return;

  try {
    const roomInfo = await getRoomInfo(address, { includePlayers: true });

    if (!roomInfo) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json({
      roomAddress: address,
      players: roomInfo.players,
    });
  } catch (error) {
    console.error(`Error fetching players for room ${address}:`, error);
    res.status(500).json({ error: "Failed to fetch player info" });
  }
}

async function handleStartGame(req, res) {
  const { address } = req.params;
  if (!validateAddressParam(address, res)) return;

  try {
    const status = await keeperService.getRoomStatus(address);

    if (!status?.canStart) {
      return res.status(400).json({
        error: "Game cannot be started yet",
        canStart: false,
        status: toJsonValue(status),
      });
    }

    if (!keeperService.hasWallet) {
      return res.status(400).json({
        error: "Keeper wallet not configured",
        canStart: true,
        note: "Set KEEPER_PRIVATE_KEY to enable keeper transactions",
      });
    }

    const result = await keeperService.startGame(address);
    invalidateRoom(address);

    if (!result.success) {
      return res.status(500).json({
        error: "Failed to start game",
        details: result.error || result.reason,
      });
    }

    res.json({
      success: true,
      roomAddress: address,
      transactionHash: result.transactionHash,
    });
  } catch (error) {
    console.error(`Error starting game for ${address}:`, error);
    res.status(500).json({ error: "Failed to start game" });
  }
}

async function handleExecuteRound(req, res) {
  const { address } = req.params;
  if (!validateAddressParam(address, res)) return;

  try {
    const status = await keeperService.getRoomStatus(address);

    if (!status?.canExecute) {
      return res.status(400).json({
        error: "Round cannot be executed yet",
        canExecute: false,
        timeUntilNext: status?.timeUntilNext || "0",
      });
    }

    if (!keeperService.hasWallet) {
      return res.status(400).json({
        error: "Keeper wallet not configured",
        canExecute: true,
        note: "Set KEEPER_PRIVATE_KEY to enable keeper transactions",
      });
    }

    const result = await keeperService.executeRound(address);
    invalidateRoom(address);

    if (!result.success) {
      return res.status(500).json({
        error: "Failed to execute round",
        details: result.error || result.reason,
      });
    }

    res.json({
      success: true,
      roomAddress: address,
      transactionHash: result.transactionHash,
    });
  } catch (error) {
    console.error(`Error executing round for ${address}:`, error);
    res.status(500).json({ error: "Failed to execute round" });
  }
}

app.get("/api/rooms", handleGetRooms);
app.get("/api/rooms/:address/players", handleGetPlayers);
app.post("/api/rooms/start/:address", handleStartGame);
app.post("/api/rooms/:address/execute-round", handleExecuteRound);
app.get("/api/rooms/:address", handleGetRoom);

// Backwards-compatible routes used by the existing ops README/client.
app.get("/rooms/active", handleGetRooms);
app.get("/rooms/:address/players", handleGetPlayers);
app.post("/rooms/start/:address", handleStartGame);
app.post("/rooms/:address/execute-round", handleExecuteRound);
app.get("/rooms/:address", handleGetRoom);

async function startEventMonitoring() {
  try {
    await eventMonitor.startMonitoring();
  } catch (error) {
    console.error("Error setting up event monitoring:", error);
  }
}

const keeperTimer = keeperService.hasWallet ? setInterval(checkAndProgressGames, keeperIntervalMs) : null;
const statusTimer = setInterval(broadcastGameStatuses, statusIntervalMs);

httpServer.listen(port, host, () => {
  console.log(`Ops HTTP + Socket.IO server listening on http://${host}:${port}`);
  startEventMonitoring();
  setTimeout(ensureDemoRoomExists, 1000);
  if (keeperService.hasWallet) {
    setTimeout(checkAndProgressGames, 1000);
  }
  setTimeout(broadcastGameStatuses, 1500);
});

function shutdown() {
  console.log("Shutting down ops server...");
  if (keeperTimer) clearInterval(keeperTimer);
  clearInterval(statusTimer);
  eventMonitor.stopAll();
  io.close();
  httpServer.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
