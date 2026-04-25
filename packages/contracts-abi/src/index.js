import gameFactoryAbi from "./abi/GameFactory.js";
import gameRoomAbi from "./abi/GameRoom.js";
import mockUsdcAbi from "./abi/MockUSDC.js";
import predictionPoolAbi from "./abi/PredictionPool.js";
import monadTestnetAddresses from "./addresses/monad-testnet.js";

export const addresses = {
  monadTestnet: monadTestnetAddresses,
};

export const abis = {
  gameFactory: gameFactoryAbi,
  gameRoom: gameRoomAbi,
  mockUsdc: mockUsdcAbi,
  predictionPool: predictionPoolAbi,
};

function makeContractConfig(contractMeta, abi) {
  return {
    address: contractMeta.proxy,
    proxyAddress: contractMeta.proxy,
    implementationAddress: contractMeta.implementation,
    abi,
  };
}

export const monadTestnet = {
  chainId: monadTestnetAddresses.chainId,
  contracts: {
    mockUsdc: makeContractConfig(monadTestnetAddresses.contracts.mockUsdc, mockUsdcAbi),
    factory: makeContractConfig(monadTestnetAddresses.contracts.factory, gameFactoryAbi),
    predictionPool: makeContractConfig(monadTestnetAddresses.contracts.predictionPool, predictionPoolAbi),
    demoRoom: makeContractConfig(monadTestnetAddresses.contracts.demoRoom, gameRoomAbi),
    keeper: {
      address: monadTestnetAddresses.contracts.keeper.address,
    },
    treasury: {
      address: monadTestnetAddresses.contracts.treasury.address,
    },
  },
};

export function getMonadContractConfig(name) {
  return monadTestnet.contracts[name];
}
