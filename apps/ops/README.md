# Ops App

Backend ringan pakai `Node.js + Express + Socket.IO` untuk Last Nads Standing.

## Sebelum Mulai

Jalankan dari root repo:

```bash
pnpm install
```

Kalau nanti butuh env backend/keeper, tambahkan di root env project sesuai kebutuhan tim.

## Run

```bash
pnpm dev:ops
```

Start biasa:

```bash
pnpm --filter ops start
```

## Yang Sudah Tersambung

- Express server dasar
- endpoint `/health`
- endpoint `/contracts`
- API PDF-compatible di `/api/rooms`
- Socket.IO server di URL backend yang sama
- Keeper service untuk start game dan eksekusi ronde otomatis
- Event monitoring untuk relay events ke frontend
- Room state caching
- import contract metadata dari `@last-nads-standing/contracts-abi`

## File Penting

- `src/server.js`: entry backend saat ini
- `src/keeper.js`: keeper service untuk transaksi keeper
- `src/events.js`: event monitoring untuk relay ke frontend
- `.env`: environment variables

## Environment Variables

Buat file `.env` di folder ini:

```env
# Express + Socket.IO run on one URL
OPS_PORT=3001

# Monad Testnet RPC
MONAD_RPC_URL=https://testnet-rpc.monad.xyz

# Keeper wallet for startGame() and executeRound()
# KEEPER_PRIVATE_KEY=your_private_key_here

# Optional tuning
# KEEPER_INTERVAL_MS=5000
# GAME_STATUS_INTERVAL_MS=5000
# CACHE_TTL=5000
# AUTO_START_GAMES=true
```

## API Endpoints

### HTTP Endpoints

- `GET /health` - Health check
- `GET /` - API info
- `GET /contracts` - Contract addresses dan ABIs
- `GET /api/rooms` - List active rooms + status
- `GET /api/rooms/:address` - Room details + players
- `GET /api/rooms/:address/players` - Player details untuk room
- `POST /api/rooms/start/:address` - Manual game start sebagai keeper
- `POST /api/rooms/:address/execute-round` - Manual round execution sebagai keeper

Route lama `/rooms/*` tetap tersedia sebagai compatibility alias.

### Socket.IO Events

Server broadcast events ke semua connected clients menggunakan Socket.IO:

- `room_created` - New room created
- `player_joined` - Player joined a room
- `game_started` - Game started
- `round_started` - Countdown/status ronde baru untuk FE
- `round_executed` - Round executed
- `player_eliminated` - Player eliminated
- `shield_blocked` - Shield blocked elimination
- `game_finished` - Game finished
- `game_winner` - Alias PDF untuk winner screen
- `prize_claimed` - Prize claimed
- `round_ready` - Round ready for execution
- `game_status` - Update status berkala
- `spectator_react` - Relay emoji/reaksi spectator

## Aturan Kerja BE

- jangan copy ABI manual ke `apps/ops`
- ambil contract metadata dari package shared `@last-nads-standing/contracts-abi`
- kalau deploy contract berubah, sync dari `packages/contracts-abi`
- keeper service perlu private key untuk eksekusi transaksi
- event monitoring menggunakan viem watchers
- caching menggunakan in-memory cache dengan TTL

## Production Setup

Untuk production:

1. Set `KEEPER_PRIVATE_KEY` dengan wallet yang authorized sebagai keeper
2. Configure proper RPC endpoint
3. Set up monitoring dan alerting
4. Configure rate limiting jika perlu
5. Set up proper logging dan error handling

## Frontend Integration

Gunakan `OpsClient` dari `apps/ops/src/client.js` untuk integrasi dengan frontend:

```javascript
import OpsClient from "./path/to/ops/src/client.js";

const opsClient = new OpsClient("http://localhost:3001");

opsClient.connect();

opsClient.onRoundStarted((data) => {
  console.log("Round started:", data);
});

opsClient.onPlayerEliminated((data) => {
  console.log("Player eliminated:", data);
});

opsClient.onGameWinner((data) => {
  console.log("Winner:", data);
});

const rooms = await opsClient.getActiveRooms();
const roomInfo = await opsClient.getRoom("0x...");
```

**Dependencies untuk frontend:**

```bash
npm install socket.io-client
```

Socket.IO akan otomatis handle reconnection dan fallback ke polling jika WebSocket tidak tersedia.
