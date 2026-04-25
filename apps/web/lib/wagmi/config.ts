import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";

import { monadTestnetChain } from "./chain";
import { env } from "@/lib/env";

export const wagmiConfig = createConfig({
  chains: [monadTestnetChain],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    [monadTestnetChain.id]: http(env.monadRpcUrl),
  },
  ssr: true,
});
