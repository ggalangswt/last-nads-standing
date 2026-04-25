import { abi as gameFactoryAbi } from './abi/GameFactory.js';
import { abi as gameRoomAbi } from './abi/GameRoom.js';
import { abi as mockUsdcAbi } from './abi/MockUSDC.js';
import { abi as predictionPoolAbi } from './abi/PredictionPool.js';
import { monadTestnetAddresses } from './addresses/monad-testnet.js';

export { gameFactoryAbi, gameRoomAbi, mockUsdcAbi, predictionPoolAbi, monadTestnetAddresses };

export const monadTestnet = {
  chainId: monadTestnetAddresses.chainId,
  contracts: {
    mockUsdc: {
      address: monadTestnetAddresses.contracts.mockUsdc.proxy,
      implementation: monadTestnetAddresses.contracts.mockUsdc.implementation,
      abi: mockUsdcAbi,
    },
    factory: {
      address: monadTestnetAddresses.contracts.factory.proxy,
      implementation: monadTestnetAddresses.contracts.factory.implementation,
      abi: gameFactoryAbi,
    },
    predictionPool: {
      address: monadTestnetAddresses.contracts.predictionPool.proxy,
      implementation: monadTestnetAddresses.contracts.predictionPool.implementation,
      abi: predictionPoolAbi,
    },
    demoRoom: {
      address: monadTestnetAddresses.contracts.demoRoom.proxy,
      implementation: monadTestnetAddresses.contracts.demoRoom.implementation,
      abi: gameRoomAbi,
    },
    keeper: monadTestnetAddresses.contracts.keeper,
    treasury: monadTestnetAddresses.contracts.treasury,
  },
  metadata: monadTestnetAddresses.metadata,
};

export function getMonadContractConfig(name) {
  return monadTestnet.contracts[name] ?? null;
}
