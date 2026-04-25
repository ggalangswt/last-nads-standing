import { createPublicClient, createWalletClient, http, getContract, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { opsContracts } from "./contracts.js";

const DEMO_DUMMY_PRIVATE_KEYS = [
  "0x0000000000000000000000000000000000000000000000000000000000000001",
  "0x0000000000000000000000000000000000000000000000000000000000000002",
  "0x0000000000000000000000000000000000000000000000000000000000000003",
  "0x0000000000000000000000000000000000000000000000000000000000000004",
  "0x0000000000000000000000000000000000000000000000000000000000000005",
  "0x0000000000000000000000000000000000000000000000000000000000000006",
  "0x0000000000000000000000000000000000000000000000000000000000000007",
];

// Keeper service for executing rounds
export class KeeperService {
  constructor(rpcUrl, privateKey) {
    this.rpcUrl = rpcUrl;
    this.privateKey = privateKey;
    this.chain = {
      id: opsContracts.chainId,
      name: "Monad Testnet",
      nativeCurrency: {
        name: "MON",
        symbol: "MON",
        decimals: 18,
      },
      rpcUrls: {
        default: { http: [rpcUrl] },
      },
    };

    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(rpcUrl),
    });

    if (privateKey) {
      this.account = privateKeyToAccount(privateKey);
      this.walletClient = createWalletClient({
        account: this.account,
        chain: this.chain,
        transport: http(rpcUrl),
      });
    }
  }

  get hasWallet() {
    return Boolean(this.walletClient);
  }

  getRoomContract(roomAddress, client = this.publicClient) {
    return getContract({
      address: roomAddress,
      abi: opsContracts.demoRoom.abi,
      client,
    });
  }

  getFactoryContract(client = this.publicClient) {
    return getContract({
      address: opsContracts.factory.address,
      abi: opsContracts.factory.abi,
      client,
    });
  }

  getMockUsdcContract(client = this.publicClient) {
    return getContract({
      address: opsContracts.mockUsdc.address,
      abi: opsContracts.mockUsdc.abi,
      client,
    });
  }

  async configureDemoDefaults() {
    if (!this.walletClient) {
      return { success: false, reason: "Keeper wallet not configured" };
    }

    try {
      const factoryContract = this.getFactoryContract(this.walletClient);
      const hash = await factoryContract.write.updateDefaults([2n, 10n, 30n, 5n]);
      await this.publicClient.waitForTransactionReceipt({ hash });
      return { success: true, transactionHash: hash };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createDefaultRoom(entryFee) {
    if (!this.walletClient) {
      return { success: false, reason: "Keeper wallet not configured" };
    }

    try {
      const factoryContract = this.getFactoryContract(this.walletClient);
      const hash = await factoryContract.write.createDefaultRoom([entryFee]);
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
      return {
        success: true,
        transactionHash: hash,
        blockNumber: receipt.blockNumber?.toString(),
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getDemoAccounts() {
    return DEMO_DUMMY_PRIVATE_KEYS.map((privateKey) => privateKeyToAccount(privateKey));
  }

  async bootstrapDemoRoom(roomAddress, requiredPlayers = 8) {
    if (!this.walletClient) {
      return { success: false, reason: "Keeper wallet not configured", roomAddress };
    }

    try {
      const roomContract = this.getRoomContract(roomAddress);
      const gameInfo = await roomContract.read.getGameInfo();
      const totalPlayers = Number(gameInfo.totalPlayers);
      if (totalPlayers >= requiredPlayers) {
        return { success: true, roomAddress, seeded: 0, skipped: true };
      }

      const entryFee = BigInt(gameInfo.entryFee);
      const demoAccounts = this.getDemoAccounts();
      const mockUsdc = this.getMockUsdcContract(this.walletClient);
      let seeded = 0;

      for (const account of demoAccounts) {
        const playerInfo = await roomContract.read.getPlayerInfo([account.address]).catch(() => ({
          hasJoined: false,
        }));
        if (playerInfo.hasJoined) continue;

        const seedWallet = createWalletClient({
          account,
          chain: this.chain,
          transport: http(this.rpcUrl),
        });
        const seedRoomContract = this.getRoomContract(roomAddress, seedWallet);
        const seedUsdcContract = this.getMockUsdcContract(seedWallet);

        const topUp = parseEther("0.05");
        const keeperBalance = await this.publicClient.getBalance({ address: this.account.address });
        if (keeperBalance > topUp) {
          await this.walletClient.sendTransaction({
            to: account.address,
            value: topUp,
          });
        }

        const balance = await seedUsdcContract.read.balanceOf([account.address]);
        if (balance === 0n) {
          try {
            await seedUsdcContract.write.faucet();
          } catch {}
        }

        await seedUsdcContract.write.approve([roomAddress, entryFee]);
        await seedRoomContract.write.joinRoom();
        seeded += 1;
      }

      return { success: true, roomAddress, seeded };
    } catch (error) {
      return { success: false, error: error.message, roomAddress };
    }
  }

  async startGame(roomAddress) {
    if (!this.walletClient) {
      return { success: false, reason: "Keeper wallet not configured", roomAddress };
    }

    try {
      const roomContract = this.getRoomContract(roomAddress, this.walletClient);
      const hash = await roomContract.write.startGame();
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });

      console.log(`Keeper: Game started for room ${roomAddress}, tx: ${hash}`);

      return {
        success: true,
        transactionHash: hash,
        blockNumber: receipt.blockNumber?.toString(),
        roomAddress,
      };
    } catch (error) {
      console.error(`Keeper: Error starting game for ${roomAddress}:`, error);
      return {
        success: false,
        error: error.message,
        roomAddress,
      };
    }
  }

  async executeRound(roomAddress) {
    if (!this.walletClient) {
      return { success: false, reason: "Keeper wallet not configured", roomAddress };
    }

    try {
      const roomContract = this.getRoomContract(roomAddress, this.walletClient);

      // Check if round can be executed
      const canExecute = await roomContract.read.canExecuteRound();
      if (!canExecute) {
        return { success: false, reason: "Round not ready" };
      }

      // Execute the round
      const hash = await roomContract.write.executeRound();
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });

      console.log(`Keeper: Round executed for room ${roomAddress}, tx: ${hash}`);

      return {
        success: true,
        transactionHash: hash,
        blockNumber: receipt.blockNumber?.toString(),
        roomAddress
      };

    } catch (error) {
      console.error(`Keeper: Error executing round for ${roomAddress}:`, error);
      return {
        success: false,
        error: error.message,
        roomAddress
      };
    }
  }

  async getRoomStatus(roomAddress) {
    try {
      const roomContract = this.getRoomContract(roomAddress);

      const gameInfo = await roomContract.read.getGameInfo();
      const canExecute = await roomContract.read.canExecuteRound();
      const timeUntilNext = await roomContract.read.timeUntilNextRound();
      const status = Number(gameInfo.status);
      const totalPlayers = Number(gameInfo.totalPlayers);
      const minPlayers = Number(gameInfo.minPlayers);

      return {
        roomAddress,
        gameInfo,
        status,
        canStart: status === 0 && totalPlayers >= minPlayers,
        canExecute,
        timeUntilNext: timeUntilNext.toString(),
      };

    } catch (error) {
      console.error(`Keeper: Error getting status for ${roomAddress}:`, error);
      return null;
    }
  }
}
