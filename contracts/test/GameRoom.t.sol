// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "../src/GameRoom.sol";
import "../src/GameFactory.sol";
import "../src/MockUSDC.sol";
import "../src/MockVRFCoordinator.sol";

contract GameRoomTest is Test {
    event RoundRequested(uint256 indexed roundNumber, uint256 indexed requestId);
    event RoundExecuted(uint256 indexed roundNumber, uint256 eliminated, uint256 playersRemaining);

    GameFactory internal factory;
    GameRoom internal room;
    MockVRFCoordinator internal mockVRF;
    MockUSDC internal mockUsdc;

    address internal keeper = makeAddr("keeper");
    address internal treasury = makeAddr("treasury");
    address internal owner = makeAddr("owner");

    address[10] internal players;

    uint256 internal constant ENTRY_FEE = 10 * 10 ** 6;
    uint256 internal constant MIN_PLAYERS = 3;
    uint256 internal constant MAX_PLAYERS = 10;
    uint256 internal constant ELIM_PCT = 30;
    uint256 internal constant ROUND_INTERVAL = 12;
    uint256 internal constant PLATFORM_FEE_PCT = 5;

    function setUp() public {
        mockVRF = new MockVRFCoordinator();

        address implementation = address(new MockUSDC());
        bytes memory initData = abi.encodeCall(MockUSDC.initialize, (owner));
        mockUsdc = MockUSDC(address(new ERC1967Proxy(implementation, initData)));

        vm.startPrank(owner);
        factory = new GameFactory(
            keeper,
            treasury,
            address(mockUsdc),
            PLATFORM_FEE_PCT,
            address(mockVRF),
            bytes32(0),
            1
        );
        address roomAddr = factory.createRoom(ENTRY_FEE, MIN_PLAYERS, MAX_PLAYERS, ELIM_PCT, ROUND_INTERVAL);
        room = GameRoom(payable(roomAddr));
        vm.stopPrank();

        for (uint256 i = 0; i < players.length; i++) {
            players[i] = makeAddr(string(abi.encodePacked("player", i)));
            vm.prank(players[i]);
            mockUsdc.faucet();
        }
    }

    function _approvePlayer(address player, uint256 amount) internal {
        vm.prank(player);
        mockUsdc.approve(address(room), amount);
    }

    function _joinN(uint256 n) internal {
        for (uint256 i = 0; i < n; i++) {
            _approvePlayer(players[i], ENTRY_FEE);
            vm.prank(players[i]);
            room.joinRoom();
        }
    }

    function _startAfterJoin(uint256 n) internal {
        _joinN(n);
        vm.prank(keeper);
        room.startGame();
    }

    function _warpAndExecute() internal {
        vm.warp(block.timestamp + ROUND_INTERVAL + 1);
        vm.prank(keeper);
        room.executeRound();
        uint256 requestId = room.pendingRequestId();
        mockVRF.fulfillRequest(requestId);
    }

    function test_joinRoom_success() public {
        _approvePlayer(players[0], ENTRY_FEE);

        vm.prank(players[0]);
        room.joinRoom();

        GameRoom.PlayerInfo memory info = room.getPlayerInfo(players[0]);
        assertTrue(info.hasJoined);
        assertTrue(info.isAlive);
        assertEq(mockUsdc.balanceOf(address(room)), ENTRY_FEE);
    }

    function test_joinRoom_requiresAllowance() public {
        vm.prank(players[0]);
        vm.expectRevert(
            abi.encodeWithSelector(
                IERC20Errors.ERC20InsufficientAllowance.selector, address(room), 0, ENTRY_FEE
            )
        );
        room.joinRoom();
    }

    function test_joinRoom_failsWithoutBalance() public {
        address poorPlayer = makeAddr("poorPlayer");
        vm.prank(poorPlayer);
        mockUsdc.approve(address(room), ENTRY_FEE);

        vm.prank(poorPlayer);
        vm.expectRevert(
            abi.encodeWithSelector(
                IERC20Errors.ERC20InsufficientBalance.selector, poorPlayer, 0, ENTRY_FEE
            )
        );
        room.joinRoom();
    }

    function test_joinRoom_duplicateJoin_reverts() public {
        _approvePlayer(players[0], ENTRY_FEE * 2);

        vm.startPrank(players[0]);
        room.joinRoom();
        vm.expectRevert("GameRoom: already joined");
        room.joinRoom();
        vm.stopPrank();
    }

    function test_joinRoom_roomFull_reverts() public {
        _joinN(MAX_PLAYERS);
        address extra = makeAddr("extra");
        vm.prank(extra);
        mockUsdc.faucet();
        vm.prank(extra);
        mockUsdc.approve(address(room), ENTRY_FEE);
        vm.prank(extra);
        vm.expectRevert("GameRoom: wrong status");
        room.joinRoom();
    }

    function test_joinRoom_gameActive_reverts() public {
        _startAfterJoin(MIN_PLAYERS);
        address extra = makeAddr("extra");
        vm.prank(extra);
        mockUsdc.faucet();
        vm.prank(extra);
        mockUsdc.approve(address(room), ENTRY_FEE);
        vm.prank(extra);
        vm.expectRevert("GameRoom: wrong status");
        room.joinRoom();
    }

    function test_joinRoom_setsShield() public {
        _approvePlayer(players[0], ENTRY_FEE);
        vm.prank(players[0]);
        room.joinRoom();
        GameRoom.PlayerInfo memory info = room.getPlayerInfo(players[0]);
        assertTrue(info.hasShield);
        assertFalse(info.shieldUsed);
    }

    function test_joinRoom_updatesPrizePool() public {
        _joinN(3);
        assertEq(room.prizePool(), ENTRY_FEE * 3);
    }

    function test_joinRoom_autoStartsWhenFull() public {
        _joinN(MAX_PLAYERS);
        assertEq(uint256(room.status()), uint256(GameRoom.GameStatus.ACTIVE));
    }

    function test_startGame_success() public {
        _joinN(MIN_PLAYERS);
        vm.prank(keeper);
        room.startGame();
        assertEq(uint256(room.status()), uint256(GameRoom.GameStatus.ACTIVE));
    }

    function test_startGame_notKeeper_reverts() public {
        _joinN(MIN_PLAYERS);
        vm.prank(players[0]);
        vm.expectRevert("GameRoom: not keeper");
        room.startGame();
    }

    function test_startGame_notEnoughPlayers_reverts() public {
        _joinN(MIN_PLAYERS - 1);
        vm.prank(keeper);
        vm.expectRevert("GameRoom: not enough players");
        room.startGame();
    }

    function test_startGame_alreadyActive_reverts() public {
        _startAfterJoin(MIN_PLAYERS);
        vm.prank(keeper);
        vm.expectRevert("GameRoom: wrong status");
        room.startGame();
    }

    function test_executeRound_requestsVRF_andIncrementsRound() public {
        _startAfterJoin(5);
        vm.warp(block.timestamp + ROUND_INTERVAL + 1);
        vm.prank(keeper);
        room.executeRound();

        assertEq(room.currentRound(), 1);
        assertTrue(room.roundPending());
        assertGt(room.pendingRequestId(), 0);
    }

    function test_executeRound_fulfillCompletes() public {
        _startAfterJoin(5);
        _warpAndExecute();

        assertEq(room.currentRound(), 1);
        assertFalse(room.roundPending());
    }

    function test_executeRound_notKeeper_reverts() public {
        _startAfterJoin(5);
        vm.warp(block.timestamp + ROUND_INTERVAL + 1);
        vm.prank(players[0]);
        vm.expectRevert("GameRoom: not keeper");
        room.executeRound();
    }

    function test_executeRound_tooSoon_reverts() public {
        _startAfterJoin(5);
        vm.prank(keeper);
        vm.expectRevert("GameRoom: round too soon");
        room.executeRound();
    }

    function test_executeRound_pendingRound_reverts() public {
        _startAfterJoin(5);
        vm.warp(block.timestamp + ROUND_INTERVAL + 1);
        vm.prank(keeper);
        room.executeRound();

        vm.warp(block.timestamp + ROUND_INTERVAL + 1);
        vm.prank(keeper);
        vm.expectRevert("GameRoom: round already pending");
        room.executeRound();
    }

    function test_executeRound_eliminatesCorrectPct() public {
        _joinN(10);
        (, uint256 aliveBefore) = room.getPlayerCount();

        _warpAndExecute();

        (, uint256 aliveAfter) = room.getPlayerCount();
        assertLe(aliveAfter, aliveBefore);
        assertGe(aliveAfter, aliveBefore - 3);
    }

    function test_executeRound_neverEliminatesAll() public {
        _startAfterJoin(3);
        for (uint256 i = 0; i < 20; i++) {
            if (room.status() != GameRoom.GameStatus.ACTIVE) break;
            _warpAndExecute();
            (, uint256 alive) = room.getPlayerCount();
            if (room.status() == GameRoom.GameStatus.ACTIVE) {
                assertGt(alive, 1);
            }
        }
    }

    function test_executeRound_emitsRoundRequested() public {
        _startAfterJoin(5);
        vm.warp(block.timestamp + ROUND_INTERVAL + 1);

        vm.expectEmit(true, false, false, false, address(room));
        emit RoundRequested(1, 0);

        vm.prank(keeper);
        room.executeRound();
    }

    function test_executeRound_emitsRoundExecuted_afterFulfill() public {
        _startAfterJoin(5);
        vm.warp(block.timestamp + ROUND_INTERVAL + 1);

        vm.prank(keeper);
        room.executeRound();
        uint256 requestId = room.pendingRequestId();

        vm.expectEmit(true, false, false, false, address(room));
        emit RoundExecuted(1, 0, 0);

        mockVRF.fulfillRequest(requestId);
    }

    function test_shield_setOnJoin() public {
        _approvePlayer(players[0], ENTRY_FEE);
        vm.prank(players[0]);
        room.joinRoom();
        GameRoom.PlayerInfo memory info = room.getPlayerInfo(players[0]);
        assertTrue(info.hasShield);
        assertFalse(info.shieldUsed);
    }

    function test_shield_blocksElimination() public {
        _startAfterJoin(3);
        (, uint256 aliveBefore) = room.getPlayerCount();

        _warpAndExecute();

        (, uint256 aliveAfter) = room.getPlayerCount();
        assertGe(aliveAfter, 1);
        assertLe(aliveAfter, aliveBefore);
    }

    function test_shield_canOnlyBeUsedOnce() public {
        _startAfterJoin(5);

        for (uint256 i = 0; i < 10; i++) {
            if (room.status() != GameRoom.GameStatus.ACTIVE) break;
            _warpAndExecute();
        }

        for (uint256 i = 0; i < 5; i++) {
            GameRoom.PlayerInfo memory info = room.getPlayerInfo(players[i]);
            if (info.shieldUsed) {
                assertTrue(info.hasShield && info.shieldUsed);
            }
        }
    }

    function _playToEnd(uint256 numPlayers) internal returns (address winnerAddr) {
        _startAfterJoin(numPlayers);
        for (uint256 i = 0; i < 50; i++) {
            if (room.status() != GameRoom.GameStatus.ACTIVE) break;
            _warpAndExecute();
        }
        winnerAddr = room.winner();
    }

    function test_endGame_setsWinner() public {
        address w = _playToEnd(5);
        assertNotEq(w, address(0));
        assertEq(uint256(room.status()), uint256(GameRoom.GameStatus.FINISHED));
    }

    function test_endGame_storesTreasuryFeeForPull() public {
        _playToEnd(5);
        uint256 expectedFee = (ENTRY_FEE * 5 * PLATFORM_FEE_PCT) / 100;
        assertEq(room.pendingTreasuryFee(), expectedFee);
        assertEq(mockUsdc.balanceOf(treasury), 0);
    }

    function test_endGame_treasuryCanWithdrawFee() public {
        _playToEnd(5);
        uint256 expectedFee = (ENTRY_FEE * 5 * PLATFORM_FEE_PCT) / 100;

        vm.prank(treasury);
        room.withdrawTreasuryFee();

        assertEq(mockUsdc.balanceOf(treasury), expectedFee);
        assertEq(room.pendingTreasuryFee(), 0);
    }

    function test_endGame_storesPrizeForClaim() public {
        _playToEnd(5);
        uint256 expectedPrize = (ENTRY_FEE * 5) - (ENTRY_FEE * 5 * PLATFORM_FEE_PCT) / 100;
        assertEq(room.winnerPrize(), expectedPrize);
    }

    function test_claimPrize_winnerCanClaim() public {
        address w = _playToEnd(5);
        uint256 prize = room.winnerPrize();
        uint256 balanceBefore = mockUsdc.balanceOf(w);

        vm.prank(w);
        room.claimPrize();

        assertEq(mockUsdc.balanceOf(w) - balanceBefore, prize);
        assertTrue(room.prizeClaimed());
    }

    function test_claimPrize_nonWinnerReverts() public {
        _playToEnd(5);
        if (room.winner() != players[0]) {
            vm.prank(players[0]);
            vm.expectRevert("GameRoom: not winner");
            room.claimPrize();
        }
    }

    function test_claimPrize_doubleClaimReverts() public {
        address w = _playToEnd(5);
        vm.prank(w);
        room.claimPrize();

        vm.prank(w);
        vm.expectRevert("GameRoom: already claimed");
        room.claimPrize();
    }

    function test_getAlivePlayers_returnsCorrect() public {
        _joinN(5);
        address[] memory alive = room.getAlivePlayers();
        assertEq(alive.length, 5);
    }

    function test_getGameInfo_returnsAccurate() public {
        _joinN(3);
        GameRoom.GameInfo memory info = room.getGameInfo();
        assertEq(info.totalPlayers, 3);
        assertEq(info.prizePool, ENTRY_FEE * 3);
        assertEq(uint256(info.status), uint256(GameRoom.GameStatus.WAITING));
    }

    function test_getPlayerCount_returnsCorrect() public {
        _startAfterJoin(5);
        (uint256 total, uint256 alive) = room.getPlayerCount();
        assertEq(total, 5);
        assertEq(alive, 5);
    }

    function test_canExecuteRound_timing() public {
        _startAfterJoin(3);
        assertFalse(room.canExecuteRound());
        vm.warp(block.timestamp + ROUND_INTERVAL + 1);
        assertTrue(room.canExecuteRound());
    }

    function test_canExecuteRound_falseWhenPending() public {
        _startAfterJoin(3);
        vm.warp(block.timestamp + ROUND_INTERVAL + 1);
        vm.prank(keeper);
        room.executeRound();
        assertFalse(room.canExecuteRound());

        uint256 requestId = room.pendingRequestId();
        mockVRF.fulfillRequest(requestId);
    }

    function test_updateKeeper_success() public {
        address newKeeper = makeAddr("newKeeper");
        vm.prank(room.roomAdmin());
        room.updateKeeper(newKeeper);
        assertEq(room.keeper(), newKeeper);
    }

    function test_updateKeeper_onlyOwner() public {
        vm.prank(players[0]);
        vm.expectRevert();
        room.updateKeeper(makeAddr("x"));
    }

    function test_emergencyWithdraw_afterTimeout() public {
        _startAfterJoin(5);

        vm.warp(block.timestamp + 7200 + 1);

        uint256 balanceBefore = mockUsdc.balanceOf(room.roomAdmin());
        uint256 contractBalance = mockUsdc.balanceOf(address(room));

        vm.prank(room.roomAdmin());
        room.emergencyWithdraw("timeout");

        assertEq(mockUsdc.balanceOf(address(room)), 0);
        assertGe(mockUsdc.balanceOf(room.roomAdmin()), balanceBefore);
        assertEq(mockUsdc.balanceOf(address(room)), 0);
        assertEq(contractBalance, ENTRY_FEE * 5);
    }
}
