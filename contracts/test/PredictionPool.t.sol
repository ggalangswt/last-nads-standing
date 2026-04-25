// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "../src/GameFactory.sol";
import "../src/GameRoom.sol";
import "../src/MockUSDC.sol";
import "../src/MockVRFCoordinator.sol";
import "../src/PredictionPool.sol";

contract PredictionPoolTest is Test {
    GameFactory internal factory;
    GameRoom internal room;
    PredictionPool internal predictionPool;
    MockVRFCoordinator internal mockVRF;
    MockUSDC internal mockUsdc;

    address internal keeper = makeAddr("keeper");
    address internal treasury = makeAddr("treasury");
    address internal owner = makeAddr("owner");
    address internal spectator = makeAddr("spectator");
    address internal spectator2 = makeAddr("spectator2");

    address[3] internal players;

    uint256 internal constant ENTRY_FEE = 10 * 10 ** 6;
    uint256 internal constant BET_AMOUNT = 5 * 10 ** 6;
    uint256 internal constant ROUND_INTERVAL = 12;

    function setUp() public {
        mockVRF = new MockVRFCoordinator();

        address implementation = address(new MockUSDC());
        bytes memory initData = abi.encodeCall(MockUSDC.initialize, (owner));
        mockUsdc = MockUSDC(address(new ERC1967Proxy(implementation, initData)));

        vm.prank(owner);
        factory = new GameFactory(keeper, treasury, address(mockUsdc), 5, address(mockVRF), bytes32(0), 1);

        vm.startPrank(owner);
        address roomAddr = factory.createRoom(ENTRY_FEE, 3, 10, 30, ROUND_INTERVAL);
        room = GameRoom(payable(roomAddr));
        predictionPool = new PredictionPool(keeper, address(mockUsdc));
        vm.stopPrank();

        for (uint256 i = 0; i < players.length; i++) {
            players[i] = makeAddr(string(abi.encodePacked("pp-player", i)));
            vm.prank(players[i]);
            mockUsdc.faucet();
            vm.prank(players[i]);
            mockUsdc.approve(address(room), ENTRY_FEE);
            vm.prank(players[i]);
            room.joinRoom();
        }

        vm.prank(spectator);
        mockUsdc.faucet();
        vm.prank(spectator2);
        mockUsdc.faucet();
    }

    function _playToEnd() internal returns (address winnerAddr) {
        uint256 currentTime = block.timestamp;

        vm.prank(keeper);
        room.startGame();

        for (uint256 i = 0; i < 40; i++) {
            if (room.status() != GameRoom.GameStatus.ACTIVE) {
                break;
            }
            currentTime += ROUND_INTERVAL + 1;
            vm.warp(currentTime);
            vm.prank(keeper);
            room.executeRound();
            mockVRF.fulfillRequest(room.pendingRequestId());
        }

        winnerAddr = room.winner();
    }

    function test_placeBet_requiresApproval() public {
        vm.prank(spectator);
        vm.expectRevert(
            abi.encodeWithSelector(
                IERC20Errors.ERC20InsufficientAllowance.selector, address(predictionPool), 0, BET_AMOUNT
            )
        );
        predictionPool.placeBet(address(room), players[0], BET_AMOUNT);
    }

    function test_placeBet_pullsErc20() public {
        uint256 balanceBefore = mockUsdc.balanceOf(spectator);

        vm.prank(spectator);
        mockUsdc.approve(address(predictionPool), BET_AMOUNT);

        vm.prank(spectator);
        predictionPool.placeBet(address(room), players[0], BET_AMOUNT);

        assertEq(mockUsdc.balanceOf(address(predictionPool)), BET_AMOUNT);
        assertEq(balanceBefore - mockUsdc.balanceOf(spectator), BET_AMOUNT);
        (, , uint256 totalPool, , ) = predictionPool.roomData(address(room));
        assertEq(totalPool, BET_AMOUNT);
    }

    function test_placeBet_failsWithoutBalance() public {
        address empty = makeAddr("empty");
        vm.prank(empty);
        mockUsdc.approve(address(predictionPool), BET_AMOUNT);

        vm.prank(empty);
        vm.expectRevert(
            abi.encodeWithSelector(
                IERC20Errors.ERC20InsufficientBalance.selector, empty, 0, BET_AMOUNT
            )
        );
        predictionPool.placeBet(address(room), players[0], BET_AMOUNT);
    }

    function test_claimPredictionReward_transfersErc20() public {
        vm.prank(spectator);
        mockUsdc.approve(address(predictionPool), BET_AMOUNT);
        vm.prank(spectator);
        predictionPool.placeBet(address(room), players[0], BET_AMOUNT);

        vm.prank(spectator2);
        mockUsdc.approve(address(predictionPool), BET_AMOUNT);
        vm.prank(spectator2);
        predictionPool.placeBet(address(room), players[1], BET_AMOUNT);

        address winnerAddr = _playToEnd();

        vm.prank(keeper);
        predictionPool.resolvePredictions(address(room));

        address winnerPredictor = winnerAddr == players[0] ? spectator : spectator2;
        uint256 balanceBefore = mockUsdc.balanceOf(winnerPredictor);

        vm.prank(winnerPredictor);
        predictionPool.claimPredictionReward(address(room));

        assertEq(mockUsdc.balanceOf(winnerPredictor) - balanceBefore, BET_AMOUNT * 2);
    }
}
