# Web App

Frontend dApp pakai `Next.js`.

## Sebelum Mulai

Jalankan dari root repo:

```bash
pnpm install
cp .env.example .env.local
```

## Run

```bash
pnpm dev:web
```

Build check:

```bash
pnpm --filter web build
pnpm --filter web exec eslint .
```

## Yang Sudah Tersambung

- `wagmi + viem` ke Monad testnet
- contract config dari `@last-nads-standing/contracts-abi`
- wallet connect dasar via injected wallet
- homepage sudah bisa read contract state

## File Penting

- `app/page.tsx`: halaman lobby saat ini
- `app/arena/[roomId]/page.tsx`: route arena
- `components/providers.tsx`: provider wagmi/react-query
- `components/wallet/connect-button.tsx`: tombol wallet
- `components/lobby/contract-overview.tsx`: contoh contract reads
- `lib/contracts/config.ts`: source contract config yang dipakai frontend
- `lib/wagmi/`: chain dan wagmi config

## Aturan Kerja FE

- jangan hardcode ABI/address langsung di komponen
- ambil semua config dari `lib/contracts/config.ts`
- kalau ABI/address berubah, update dulu `packages/contracts-abi`
