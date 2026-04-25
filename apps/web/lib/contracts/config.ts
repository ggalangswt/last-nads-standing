import { monadTestnet } from "@last-nads-standing/contracts-abi";

export const factoryContract = {
  address: monadTestnet.contracts.factory.address,
  abi: monadTestnet.contracts.factory.abi,
} as const;

export const mockUsdcContract = {
  address: monadTestnet.contracts.mockUsdc.address,
  abi: monadTestnet.contracts.mockUsdc.abi,
} as const;

export const roomContract = {
  address: monadTestnet.contracts.demoRoom.address,
  abi: monadTestnet.contracts.demoRoom.abi,
} as const;

export const predictionPoolContract = {
  address: monadTestnet.contracts.predictionPool.address,
  abi: monadTestnet.contracts.predictionPool.abi,
} as const;
