// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../src/GameRoom.sol";
import "../src/GameFactory.sol";

// ─────────────────────────────────────────────────────────────────────────────
// JoinRoom — join a room with the entry fee read from the contract
// Usage: forge script script/Interact.s.sol:JoinRoom \
//          --rpc-url $MONAD_RPC_URL --broadcast \
//          --sig "run(address)" <ROOM_ADDRESS>
// ─────────────────────────────────────────────────────────────────────────────
contract JoinRoom is Script {
    function run(address roomAddress) external {
        uint256 key = vm.envUint("PRIVATE_KEY");
        GameRoom room = GameRoom(payable(roomAddress));
        uint256 fee = room.entryFee();
        IERC20 token = room.paymentToken();

        vm.startBroadcast(key);
        token.approve(roomAddress, fee);
        room.joinRoom();
        vm.stopBroadcast();

        console.log("Joined room:", roomAddress);
        console.log("Entry fee paid (USDC 6dp):", fee);
        (uint256 total, uint256 alive) = room.getPlayerCount();
        console.log("Players total / alive:", total, alive);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// StartGame — trigger game start as keeper (requires minPlayers joined)
// Usage: forge script script/Interact.s.sol:StartGame \
//          --rpc-url $MONAD_RPC_URL --broadcast \
//          --sig "run(address)" <ROOM_ADDRESS>
// ─────────────────────────────────────────────────────────────────────────────
contract StartGame is Script {
    function run(address roomAddress) external {
        uint256 key = vm.envUint("PRIVATE_KEY");
        GameRoom room = GameRoom(payable(roomAddress));

        vm.startBroadcast(key);
        room.startGame();
        vm.stopBroadcast();

        console.log("Game started in room:", roomAddress);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ExecuteRound — trigger one elimination round as keeper
// Usage: forge script script/Interact.s.sol:ExecuteRound \
//          --rpc-url $MONAD_RPC_URL --broadcast \
//          --sig "run(address)" <ROOM_ADDRESS>
// ─────────────────────────────────────────────────────────────────────────────
contract ExecuteRound is Script {
    function run(address roomAddress) external {
        uint256 key = vm.envUint("PRIVATE_KEY");
        GameRoom room = GameRoom(payable(roomAddress));

        require(room.canExecuteRound(), "Round not ready yet");

        vm.startBroadcast(key);
        room.executeRound();
        vm.stopBroadcast();

        GameRoom.GameInfo memory info = room.getGameInfo();
        console.log("Round executed. Round number:", info.currentRound);
        console.log("Players alive:", info.playersAlive);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CheckState — read-only: print full game state to console
// Usage: forge script script/Interact.s.sol:CheckState \
//          --rpc-url $MONAD_RPC_URL \
//          --sig "run(address)" <ROOM_ADDRESS>
// ─────────────────────────────────────────────────────────────────────────────
contract CheckState is Script {
    function run(address roomAddress) external view {
        GameRoom room = GameRoom(payable(roomAddress));
        GameRoom.GameInfo memory info = room.getGameInfo();
        IERC20 token = room.paymentToken();

        string[3] memory statusNames = ["WAITING", "ACTIVE", "FINISHED"];

        console.log("=== Game Room State ===");
        console.log("Address:       ", roomAddress);
        console.log("Status:        ", statusNames[uint256(info.status)]);
        console.log("Round:         ", info.currentRound);
        console.log("Players total: ", info.totalPlayers);
        console.log("Players alive: ", info.playersAlive);
        console.log("Prize pool:    ", info.prizePool);
        console.log("Entry fee:     ", info.entryFee);
        console.log("Payment token: ", address(token));
        console.log("Winner:        ", info.winner);
        console.log("Can execute round:", room.canExecuteRound());
        console.log("Time to next round:", room.timeUntilNextRound());
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CreateRoom — create a new room from the factory
// Usage: forge script script/Interact.s.sol:CreateRoom \
//          --rpc-url $MONAD_RPC_URL --broadcast \
//          --sig "run(address,uint256)" <FACTORY_ADDRESS> <ENTRY_FEE_WEI>
// ─────────────────────────────────────────────────────────────────────────────
contract CreateRoom is Script {
    function run(address factoryAddress, uint256 entryFeeWei) external {
        uint256 key = vm.envUint("PRIVATE_KEY");
        GameFactory factory = GameFactory(factoryAddress);

        vm.startBroadcast(key);
        address roomAddr = factory.createDefaultRoom(entryFeeWei);
        vm.stopBroadcast();

        console.log("New room created:", roomAddr);
        console.log("Entry fee (wei):", entryFeeWei);
    }
}
