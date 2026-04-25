import type { Address } from "viem";

import { env } from "@/lib/env";
import { monadTestnetChain } from "@/lib/wagmi/chain";

type InjectedProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

export function getEthereumProvider() {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { ethereum?: InjectedProvider }).ethereum;
}

export async function switchToMonadNetwork() {
  const ethereum = getEthereumProvider();
  if (!ethereum) throw new Error("No injected wallet found.");

  const chainIdHex = `0x${monadTestnetChain.id.toString(16)}`;

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
    return;
  } catch (error) {
    const code = getErrorCode(error);
    if (code !== 4902) {
      throw new Error(getErrorMessage(error) || "Failed to switch wallet network.");
    }
  }

  await ethereum.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: chainIdHex,
        chainName: monadTestnetChain.name,
        nativeCurrency: monadTestnetChain.nativeCurrency,
        rpcUrls: [env.monadRpcUrl],
        blockExplorerUrls: [env.monadExplorerUrl],
      },
    ],
  });

  await ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: chainIdHex }],
  });
}

export function formatWallet(address: Address | string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getErrorCode(error: unknown) {
  if (typeof error === "object" && error && "code" in error) {
    return Number((error as { code?: number | string }).code);
  }
  return undefined;
}

export function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "shortMessage" in error) {
    return String((error as { shortMessage?: string }).shortMessage);
  }
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message?: string }).message);
  }
  return null;
}
