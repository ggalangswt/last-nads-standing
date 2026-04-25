// Simple test script for ops server
// Run with: node src/test.js
// Tests contract connections, keeper service, and basic functionality
// Note: Socket.IO server testing requires the server to be running

import { createPublicClient, http } from "viem";
import { monadTestnet } from "@last-nads-standing/contracts-abi";

async function testContractsConnection() {
  console.log("Testing contract connections...");

  const client = createPublicClient({
    chain: {
      id: monadTestnet.chainId,
      name: "Monad Testnet",
      nativeCurrency: {
        name: "MON",
        symbol: "MON",
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ["https://testnet-rpc.monad.xyz"],
        },
      },
    },
    transport: http("https://testnet-rpc.monad.xyz"),
  });

  try {
    // Test factory contract
    const activeRooms = await client.readContract({
      address: monadTestnet.contracts.factory.address,
      abi: monadTestnet.contracts.factory.abi,
      functionName: "getActiveRooms",
    });

    console.log(`✅ Factory contract connected. Active rooms: ${activeRooms.length}`);

    // Test demo room contract
    const gameInfo = await client.readContract({
      address: monadTestnet.contracts.demoRoom.address,
      abi: monadTestnet.contracts.demoRoom.abi,
      functionName: "getGameInfo",
    });

    console.log(`✅ Demo room contract connected. Status: ${gameInfo.status}`);

    return true;
  } catch (error) {
    console.error("❌ Contract connection test failed:", error);
    return false;
  }
}

async function testKeeperService() {
  console.log("Testing keeper service...");

  try {
    const { KeeperService } = await import("./keeper.js");
    const keeper = new KeeperService("https://testnet-rpc.monad.xyz");

    const status = await keeper.getRoomStatus(monadTestnet.contracts.demoRoom.address);

    if (status) {
      console.log(`✅ Keeper service working. Room status: ${status.gameInfo.status}`);
      return true;
    } else {
      console.log("❌ Keeper service returned null status");
      return false;
    }
  } catch (error) {
    console.error("❌ Keeper service test failed:", error);
    return false;
  }
}

async function runTests() {
  console.log("Running ops server tests...\n");

  const contractTest = await testContractsConnection();
  const keeperTest = await testKeeperService();

  console.log("\nTest Results:");
  console.log(`Contracts: ${contractTest ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Keeper: ${keeperTest ? "✅ PASS" : "❌ FAIL"}`);

  if (contractTest && keeperTest) {
    console.log("\n🎉 All tests passed! Ops server is ready.");
  } else {
    console.log("\n⚠️  Some tests failed. Check configuration.");
  }
}

runTests().catch(console.error);