// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "../src/GameRoom.sol";
import "../src/GameFactory.sol";
import "../src/MockUSDC.sol";
import "../src/MockVRFCoordinator.sol";

contract GameRoomIntegrationTest is Test {
    GameFactory internal factory;
    MockVRFCoordinator internal mockVRF;
    MockUSDC internal mockUsdc;

    address internal keeper = makeAddr("keeper");
    address internal treasury = makeAddr("treasury");
    address internal owner = makeAddr("owner");

    uint256 internal constant ENTRY_FEE = 10 * 10 ** 6;
    uint256 internal constant PLATFORM_FEE_PCT = 5;
    uint256 internal constant ROUND_INTERVAL = 12;

    function _makeRoom(uint256 minP, uint256 maxP) internal returns (GameRoom) {
        vm.prank(owner);
        address addr = factory.createRoom(ENTRY_FEE, minP, maxP, 30, ROUND_INTERVAL);
        return GameRoom(payable(addr));
    }

    function _fundAndApprove(address user, address spender, uint256 amount) internal {
        vm.prank(user);
        mockUsdc.faucet();
        vm.prank(user);
        mockUsdc.approve(spender, amount);
    }

    function _executeRound(GameRoom room) internal {
        vm.prank(keeper);
        room.executeRound();
        uint256 requestId = room.pendingRequestId();
        mockVRF.fulfillRequest(requestId);
    }

    function setUp() public {
        mockVRF = new MockVRFCoordinator();

        address implementation = address(new MockUSDC());
        bytes memory initData = abi.encodeCall(MockUSDC.initialize, (owner));
        mockUsdc = MockUSDC(address(new ERC1967Proxy(implementation, initData)));

        vm.prank(owner);
        factory = new GameFactory(
            keeper,
            treasury,
            address(mockUsdc),
            PLATFORM_FEE_PCT,
            address(mockVRF),
            bytes32(0),
            1
        );
    }

    function test_fullGameLoop() public {
        GameRoom room = _makeRoom(3, 10);
        uint256 numPlayers = 5;
        address[] memory playerAddrs = new address[](numPlayers);
        uint256 currentTime = block.timestamp;

        uint256 totalPrize = 0;
        for (uint256 i = 0; i < numPlayers; i++) {
            playerAddrs[i] = makeAddr(string(abi.encodePacked("gplayer", i)));
            _fundAndApprove(playerAddrs[i], address(room), ENTRY_FEE);
            vm.prank(playerAddrs[i]);
            room.joinRoom();
            totalPrize += ENTRY_FEE;
        }

        assertEq(room.prizePool(), totalPrize);
        assertEq(uint256(room.status()), uint256(GameRoom.GameStatus.WAITING));

        vm.prank(keeper);
        room.startGame();
        assertEq(uint256(room.status()), uint256(GameRoom.GameStatus.ACTIVE));

        uint256 round = 0;
        uint256 maxRounds = 50;
        while (room.status() == GameRoom.GameStatus.ACTIVE && round < maxRounds) {
            currentTime += ROUND_INTERVAL + 1;
            vm.warp(currentTime);
            _executeRound(room);
            round++;

            (, uint256 alive) = room.getPlayerCount();
            assertEq(room.prizePool(), totalPrize);

            if (room.status() == GameRoom.GameStatus.ACTIVE) {
                assertGt(alive, 1);
            }
        }

        assertEq(uint256(room.status()), uint256(GameRoom.GameStatus.FINISHED));

        address winnerAddr = room.winner();
        assertNotEq(winnerAddr, address(0));

        uint256 expectedFee = (totalPrize * PLATFORM_FEE_PCT) / 100;
        uint256 expectedPrize = totalPrize - expectedFee;
        assertEq(room.winnerPrize(), expectedPrize);

        assertEq(room.pendingTreasuryFee(), expectedFee);
        vm.prank(treasury);
        room.withdrawTreasuryFee();
        assertEq(mockUsdc.balanceOf(treasury), expectedFee);

        uint256 winnerBalBefore = mockUsdc.balanceOf(winnerAddr);
        vm.prank(winnerAddr);
        room.claimPrize();
        assertEq(mockUsdc.balanceOf(winnerAddr) - winnerBalBefore, expectedPrize);
        assertTrue(room.prizeClaimed());

        for (uint256 i = 0; i < numPlayers; i++) {
            if (playerAddrs[i] != winnerAddr) {
                vm.prank(playerAddrs[i]);
                vm.expectRevert("GameRoom: not winner");
                room.claimPrize();
                break;
            }
        }
    }

    function test_shieldSavesPlayer_inFullGame() public {
        GameRoom room = _makeRoom(3, 10);
        uint256 currentTime = block.timestamp;

        address[] memory playerAddrs = new address[](5);
        for (uint256 i = 0; i < 5; i++) {
            playerAddrs[i] = makeAddr(string(abi.encodePacked("sp", i)));
            _fundAndApprove(playerAddrs[i], address(room), ENTRY_FEE);
            vm.prank(playerAddrs[i]);
            room.joinRoom();
        }

        vm.prank(keeper);
        room.startGame();

        bool shieldFired = false;

        for (uint256 r = 0; r < 30; r++) {
            if (room.status() != GameRoom.GameStatus.ACTIVE) break;
            currentTime += ROUND_INTERVAL + 1;
            vm.warp(currentTime);
            vm.recordLogs();
            _executeRound(room);

            Vm.Log[] memory logs = vm.getRecordedLogs();
            for (uint256 l = 0; l < logs.length; l++) {
                if (logs[l].topics[0] == keccak256("ShieldBlocked(address,uint256)")) {
                    shieldFired = true;
                }
            }
        }

        for (uint256 i = 0; i < 5; i++) {
            GameRoom.PlayerInfo memory pInfo = room.getPlayerInfo(playerAddrs[i]);
            if (pInfo.shieldUsed) {
                assertTrue(pInfo.hasShield, "shieldUsed but hasShield false");
                shieldFired = true;
            }
        }

        assertEq(uint256(room.status()), uint256(GameRoom.GameStatus.FINISHED));
        assertTrue(shieldFired);
    }

    function test_emergencyScenario_afterTimeout() public {
        GameRoom room = _makeRoom(3, 10);
        uint256 currentTime = block.timestamp;

        uint256 numPlayers = 4;
        address[] memory playerAddrs = new address[](numPlayers);
        for (uint256 i = 0; i < numPlayers; i++) {
            playerAddrs[i] = makeAddr(string(abi.encodePacked("ep", i)));
            _fundAndApprove(playerAddrs[i], address(room), ENTRY_FEE);
            vm.prank(playerAddrs[i]);
            room.joinRoom();
        }

        vm.prank(keeper);
        room.startGame();

        currentTime += ROUND_INTERVAL + 1;
        vm.warp(currentTime);
        _executeRound(room);

        currentTime += 7200 + 1;
        vm.warp(currentTime);

        uint256 contractBalance = mockUsdc.balanceOf(address(room));
        assertGt(contractBalance, 0);

        address roomOwner = room.roomAdmin();

        vm.prank(roomOwner);
        room.emergencyWithdraw("test timeout");

        assertEq(mockUsdc.balanceOf(address(room)), 0);
    }

    function test_twoPlayerGame_completes() public {
        vm.prank(owner);
        address addr = factory.createRoom(ENTRY_FEE, 2, 2, 30, ROUND_INTERVAL);
        GameRoom room = GameRoom(payable(addr));
        uint256 currentTime = block.timestamp;

        address p1 = makeAddr("tp1");
        address p2 = makeAddr("tp2");
        _fundAndApprove(p1, address(room), ENTRY_FEE);
        _fundAndApprove(p2, address(room), ENTRY_FEE);

        vm.prank(p1);
        room.joinRoom();

        vm.prank(p2);
        room.joinRoom();

        assertEq(uint256(room.status()), uint256(GameRoom.GameStatus.ACTIVE));

        for (uint256 i = 0; i < 20; i++) {
            if (room.status() != GameRoom.GameStatus.ACTIVE) break;
            currentTime += ROUND_INTERVAL + 1;
            vm.warp(currentTime);
            _executeRound(room);
        }

        assertEq(uint256(room.status()), uint256(GameRoom.GameStatus.FINISHED));
        assertNotEq(room.winner(), address(0));
    }
}
