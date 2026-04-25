export const env = {
  opsUrl: process.env.NEXT_PUBLIC_OPS_URL || "http://127.0.0.1:3001",
  monadRpcUrl:
    process.env.NEXT_PUBLIC_MONAD_RPC_URL || "https://testnet-rpc.monad.xyz",
  monadExplorerUrl:
    process.env.NEXT_PUBLIC_MONAD_EXPLORER_URL ||
    "https://testnet.monadexplorer.com",
};
