import { defineChain } from "viem";

export const monadTestnetChain = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    name: "MON",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_MONAD_RPC_URL || "https://testnet-rpc.monad.xyz",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url:
        process.env.NEXT_PUBLIC_MONAD_EXPLORER_URL ||
        "https://testnet.monadexplorer.com",
    },
  },
  testnet: true,
});
