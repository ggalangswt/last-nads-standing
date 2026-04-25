import { monadTestnet } from "@last-nads-standing/contracts-abi";

const deployedAddresses = {
  mockUsdc: "0xEb9D52718442f3A7Bfc7a31bf6D834232a796760",
  factory: "0x6267646B062C3Cae3c66ECfFc2151f148aec448B",
  predictionPool: "0x899aA02ff07e9F6147f5B627b69b8E0CBe8dB85A",
  demoRoom: "0xaddbeBf119a6CB87e2E221ed3cE8cFf35aB3c774",
} as const;

export const factoryContract = {
  address: deployedAddresses.factory,
  abi: monadTestnet.contracts.factory.abi,
} as const;

export const mockUsdcContract = {
  address: deployedAddresses.mockUsdc,
  abi: monadTestnet.contracts.mockUsdc.abi,
} as const;

export const roomContract = {
  address: deployedAddresses.demoRoom,
  abi: monadTestnet.contracts.demoRoom.abi,
} as const;

export const predictionPoolContract = {
  address: deployedAddresses.predictionPool,
  abi: monadTestnet.contracts.predictionPool.abi,
} as const;
