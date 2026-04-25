# Contracts ABI

Sumber tunggal untuk:

- ABI contract
- deployed addresses per chain
- helper export untuk frontend dan ops

## Current Assets

- `src/abi/GameFactory.json`
- `src/abi/GameRoom.json`
- `src/abi/PredictionPool.json`
- `src/addresses/monad-testnet.json`

## Usage

```js
import { monadTestnet, getMonadContractConfig } from "@last-nads-standing/contracts-abi";

const room = getMonadContractConfig("demoRoom");
const factory = monadTestnet.contracts.factory;
```
