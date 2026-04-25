# Last Nads Standing

Monorepo untuk proyek hackathon `Last Nads Standing`, dipisah antara frontend dApp, backend automation/realtime, dan smart contract.

## Workspace

- `apps/web`: Next.js dApp untuk lobby, arena, wallet, dan contract reads/writes.
- `apps/ops`: backend ringan untuk keeper, event relay, dan endpoint realtime.
- `contracts`: Foundry workspace untuk smart contract game.
- `packages/shared`: tempat type/schema shared kalau nanti dibutuhkan.
- `packages/contracts-abi`: ABI dan address contract yang dipakai FE/BE.

## Prasyarat

Semua orang di tim sebaiknya punya ini dulu:

- `Node.js` 20+
- `pnpm` 10+
- `git`

Tambahan untuk track smart contract:

- `foundry` (`forge`, `cast`, `anvil`)

## First Setup

Jalankan ini dulu sekali dari root repo setelah clone:

```bash
pnpm install
```

Kalau kamu pegang smart contract juga, lanjut:

```bash
cd contracts
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts
```

## Env

Untuk frontend:

```bash
cp .env.example .env.local
```

Untuk smart contract:

```bash
cd contracts
cp .env.example .env
```

## Track Frontend

Folder kerja:

```bash
apps/web
```

Yang perlu dilakukan sebelum mulai ngoding:

1. `pnpm install` di root repo.
2. Copy env frontend: `cp .env.example .env.local`.
3. Pastikan ABI/address terbaru sudah ada di `packages/contracts-abi`.

Command penting:

```bash
pnpm dev:web
pnpm --filter web build
pnpm --filter web exec eslint .
```

Scope frontend saat ini:

- Next.js App Router sudah terpasang
- `wagmi + viem` sudah terhubung ke Monad testnet
- contract config sudah diambil dari `packages/contracts-abi`

Kalau frontend butuh contract function baru, cek dulu:

- `packages/contracts-abi/src/index.js`
- `apps/web/lib/contracts/config.ts`

## Track Backend

Folder kerja:

```bash
apps/ops
```

Yang perlu dilakukan sebelum mulai ngoding:

1. `pnpm install` di root repo.
2. Copy env backend: `cp apps/ops/.env.example apps/ops/.env` (kalau ada).
3. Pastikan tahu contract address yang dipakai dari `packages/contracts-abi`.
4. Kalau butuh env tambahan untuk keeper/backend, tambahkan ke root `.env` atau `.env.local` sesuai kebutuhan tim.

Command penting:

```bash
pnpm dev:ops
pnpm --filter ops start
pnpm --filter ops test
```

Scope backend saat ini:

- ✅ Express server dengan Socket.IO support (bukan WebSocket biasa)
- ✅ Keeper service untuk monitoring dan eksekusi ronde otomatis
- ✅ Event monitoring untuk relay real-time ke frontend
- ✅ Room state caching untuk performance
- ✅ REST API endpoints untuk game status
- ✅ Contract metadata dari `@last-nads-standing/contracts-abi`
- ✅ Client library untuk frontend integration

Features utama:

- **Keeper Service**: Monitor active rooms dan execute rounds otomatis setiap 30 detik
- **Real-time Events**: Socket.IO broadcast untuk game events (join, eliminate, finish, etc.) dengan automatic reconnection
- **Caching**: In-memory cache dengan TTL untuk room states
- **API Endpoints**: REST endpoints untuk room info, player data, manual execution
- **Event Relay**: Listen ke contract events dan broadcast ke connected clients
- **Cross-platform**: Socket.IO support untuk berbagai browser dan device

Untuk production setup:

1. Set `KEEPER_PRIVATE_KEY` di env untuk enable transaction execution
2. Configure proper RPC endpoint
3. Set up monitoring dan error handling

## Track Smart Contract

Folder kerja:

```bash
contracts
```

Yang perlu dilakukan sebelum mulai ngoding:

1. Install Foundry kalau belum ada.
2. Masuk ke folder `contracts`.
3. Copy env: `cp .env.example .env`.
4. Install dependency Foundry kalau `lib/` belum ada.

Command penting:

```bash
cd contracts
forge build
forge test -vv
```

Isi workspace contract:

- `src/`: `GameFactory.sol`, `GameRoom.sol`, `PredictionPool.sol`
- `script/`: deploy dan interaction script
- `test/`: unit + integration test
- `deployments/`: ABI dan address deploy

Catatan:

- `contracts/lib` tidak di-commit ke repo. Kalau dependency hilang, install ulang dengan `forge install`.
- Setelah deploy baru, update artifact/address yang relevan supaya FE/BE pakai data terbaru.

## Cara Kerja Tim

Urutan yang aman sebelum masing-masing jalan sendiri:

1. Smart contract pastikan ABI dan address terbaru valid.
2. Update `packages/contracts-abi` kalau ada perubahan deploy.
3. Frontend dan backend baru sync dari package itu, jangan copy ABI manual dari tempat lain.

Prinsip repo ini:

- FE tidak hardcode ABI/address di app
- BE tidak hardcode ABI/address di app
- source of truth contract integration ada di `packages/contracts-abi`
