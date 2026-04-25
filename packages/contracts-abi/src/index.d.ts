export declare const addresses: {
  monadTestnet: {
    chainId: number;
    contracts: {
      mockUsdc: {
        proxy: `0x${string}`;
        implementation: `0x${string}` | null;
      };
      factory: {
        proxy: `0x${string}`;
        implementation: `0x${string}` | null;
      };
      predictionPool: {
        proxy: `0x${string}`;
        implementation: `0x${string}` | null;
      };
      demoRoom: {
        proxy: `0x${string}`;
        implementation: `0x${string}` | null;
      };
      keeper: {
        address: `0x${string}`;
      };
      treasury: {
        address: `0x${string}`;
      };
    };
  };
};

export declare const abis: {
  gameFactory: readonly unknown[];
  gameRoom: readonly unknown[];
  mockUsdc: readonly unknown[];
  predictionPool: readonly unknown[];
};

export declare const monadTestnet: {
  chainId: number;
  contracts: {
    mockUsdc: {
      address: `0x${string}`;
      proxyAddress: `0x${string}`;
      implementationAddress: `0x${string}` | null;
      abi: readonly unknown[];
    };
    factory: {
      address: `0x${string}`;
      proxyAddress: `0x${string}`;
      implementationAddress: `0x${string}` | null;
      abi: readonly unknown[];
    };
    predictionPool: {
      address: `0x${string}`;
      proxyAddress: `0x${string}`;
      implementationAddress: `0x${string}` | null;
      abi: readonly unknown[];
    };
    demoRoom: {
      address: `0x${string}`;
      proxyAddress: `0x${string}`;
      implementationAddress: `0x${string}` | null;
      abi: readonly unknown[];
    };
    keeper: {
      address: `0x${string}`;
    };
    treasury: {
      address: `0x${string}`;
    };
  };
};

export declare function getMonadContractConfig(
  name: keyof typeof monadTestnet.contracts,
): (typeof monadTestnet.contracts)[keyof typeof monadTestnet.contracts];
