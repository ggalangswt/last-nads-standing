import { createPublicClient, createWalletClient, http, getContract } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "@last-nads-standing/contracts-abi";

// Keeper service for executing rounds
export class KeeperService {
  constructor(rpcUrl, privateKey) {
    this.rpcUrl = rpcUrl;
    this.privateKey = privateKey;
    this.chain = {
      id: monadTestnet.chainId,
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
      abi: monadTestnet.contracts.demoRoom.abi,
      client,
    });
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