// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "../src/GameFactory.sol";
import "../src/GameRoom.sol";
import "../src/MockUSDC.sol";
import "../src/MockVRFCoordinator.sol";

contract GameFactoryTest is Test {
    event RoomCreated(address indexed roomAddress, address indexed creator, uint256 indexed roomId, uint256 entryFee);

    GameFactory internal factory;
    MockVRFCoordinator internal mockVRF;
    MockUSDC internal mockUsdc;

    address internal keeper = makeAddr("keeper");
    address internal treasury = makeAddr("treasury");
    address internal owner = makeAddr("owner");
    address internal user = makeAddr("user");

    uint256 internal constant ENTRY_FEE = 10 * 10 ** 6;

    function setUp() public {
        mockVRF = new MockVRFCoordinator();

        address implementation = address(new MockUSDC());
        bytes memory initData = abi.encodeCall(MockUSDC.initialize, (owner));
        mockUsdc = MockUSDC(address(new ERC1967Proxy(implementation, initData)));

        vm.prank(owner);
        factory = new GameFactory(keeper, treasury, address(mockUsdc), 5, address(mockVRF), bytes32(0), 1);
    }

    function test_constructor_setsState() public view {
        assertEq(factory.keeper(), keeper);
        assertEq(factory.treasury(), treasury);
        assertEq(factory.paymentToken(), address(mockUsdc));
        assertEq(factory.platformFeePct(), 5);
        assertEq(factory.owner(), owner);
        (address coord,,) = factory.vrfConfig();
        assertEq(coord, address(mockVRF));
    }

    function test_constructor_zeroKeeper_reverts() public {
        vm.expectRevert("Factory: zero keeper");
        new GameFactory(address(0), treasury, address(mockUsdc), 5, address(mockVRF), bytes32(0), 1);
    }

    function test_constructor_zeroTreasury_reverts() public {
        vm.expectRevert("Factory: zero treasury");
        new GameFactory(keeper, address(0), address(mockUsdc), 5, address(mockVRF), bytes32(0), 1);
    }

    function test_constructor_zeroToken_reverts() public {
        vm.expectRevert("Factory: zero token");
        new GameFactory(keeper, treasury, address(0), 5, address(mockVRF), bytes32(0), 1);
    }

    function test_constructor_feeTooHigh_reverts() public {
        vm.expectRevert("Factory: fee too high");
        new GameFactory(keeper, treasury, address(mockUsdc), 21, address(mockVRF), bytes32(0), 1);
    }

    function test_constructor_zeroCoordinator_reverts() public {
        vm.expectRevert("Factory: zero coordinator");
        new GameFactory(keeper, treasury, address(mockUsdc), 5, address(0), bytes32(0), 1);
    }

    function test_constructor_invalidSubscriptionId_reverts() public {
        vm.expectRevert("Factory: invalid subscription");
        new GameFactory(keeper, treasury, address(mockUsdc), 5, address(mockVRF), bytes32(0), 0);
    }

    function test_createRoom_success() public {
        vm.prank(user);
        address roomAddr = factory.createRoom(ENTRY_FEE, 3, 10, 30, 12);
        assertNotEq(roomAddr, address(0));
        assertEq(address(GameRoom(payable(roomAddr)).paymentToken()), address(mockUsdc));
        assertEq(GameRoom(payable(roomAddr)).roomAdmin(), user);
    }

    function test_createRoom_usesDefaults_whenZeroPassed() public {
        vm.prank(user);
        address roomAddr = factory.createRoom(ENTRY_FEE, 0, 0, 0, 0);
        GameRoom room = GameRoom(payable(roomAddr));
        assertEq(room.minPlayers(), factory.defaultMinPlayers());
        assertEq(room.maxPlayers(), factory.defaultMaxPlayers());
        assertEq(room.eliminationPct(), factory.defaultEliminationPct());
        assertEq(room.roundInterval(), factory.defaultRoundInterval());
    }

    function test_createRoom_zeroFee_reverts() public {
        vm.prank(user);
        vm.expectRevert("Factory: entry fee must be > 0");
        factory.createRoom(0, 3, 10, 30, 12);
    }

    function test_createRoom_incrementsCounter() public {
        vm.prank(user);
        address r1 = factory.createRoom(ENTRY_FEE, 0, 0, 0, 0);
        address r2 = factory.createRoom(ENTRY_FEE, 0, 0, 0, 0);

        assertEq(GameRoom(payable(r1)).roomId(), 1);
        assertEq(GameRoom(payable(r2)).roomId(), 2);
    }

    function test_createRoom_registersInAllRooms() public {
        vm.prank(user);
        address roomAddr = factory.createRoom(ENTRY_FEE, 0, 0, 0, 0);
        assertEq(factory.allRooms(0), roomAddr);
        assertEq(factory.getRoomCount(), 1);
    }

    function test_createRoom_registersInRoomById() public {
        vm.prank(user);
        address roomAddr = factory.createRoom(ENTRY_FEE, 0, 0, 0, 0);
        assertEq(factory.roomById(1), roomAddr);
    }

    function test_createRoom_registersInCreatorMapping() public {
        vm.prank(user);
        factory.createRoom(ENTRY_FEE, 0, 0, 0, 0);
        address[] memory byCreator = factory.getRoomsByCreator(user);
        assertEq(byCreator.length, 1);
    }

    function test_createRoom_emitsEvent() public {
        vm.prank(user);
        vm.expectEmit(false, true, true, true, address(factory));
        emit RoomCreated(address(0), user, 1, ENTRY_FEE);
        factory.createRoom(ENTRY_FEE, 0, 0, 0, 0);
    }

    function test_createDefaultRoom_success() public {
        vm.prank(user);
        address roomAddr = factory.createDefaultRoom(ENTRY_FEE);
        assertNotEq(roomAddr, address(0));
        assertEq(GameRoom(payable(roomAddr)).entryFee(), ENTRY_FEE);
    }

    function test_getActiveRooms_returnsWaitingRooms() public {
        vm.prank(user);
        factory.createDefaultRoom(ENTRY_FEE);
        address[] memory active = factory.getActiveRooms();
        assertEq(active.length, 1);
    }

    function test_getWaitingRooms_returnsOnlyWaiting() public {
        vm.prank(user);
        factory.createDefaultRoom(ENTRY_FEE);
        address[] memory waiting = factory.getWaitingRooms();
        assertEq(waiting.length, 1);
    }

    function test_updateKeeper_success() public {
        address newKeeper = makeAddr("newKeeper");
        vm.prank(owner);
        factory.updateKeeper(newKeeper);
        assertEq(factory.keeper(), newKeeper);
    }

    function test_updateKeeper_onlyOwner_reverts() public {
        vm.prank(user);
        vm.expectRevert();
        factory.updateKeeper(makeAddr("x"));
    }

    function test_updateTreasury_success() public {
        address newTreasury = makeAddr("newTreasury");
        vm.prank(owner);
        factory.updateTreasury(newTreasury);
        assertEq(factory.treasury(), newTreasury);
    }

    function test_updatePaymentToken_success() public {
        address newToken = makeAddr("newToken");
        vm.prank(owner);
        factory.updatePaymentToken(newToken);
        assertEq(factory.paymentToken(), newToken);
    }

    function test_updatePlatformFee_success() public {
        vm.prank(owner);
        factory.updatePlatformFee(10);
        assertEq(factory.platformFeePct(), 10);
    }

    function test_updatePlatformFee_tooHigh_reverts() public {
        vm.prank(owner);
        vm.expectRevert("Factory: fee too high");
        factory.updatePlatformFee(21);
    }

    function test_updateVRFConfig_success() public {
        address newCoord = makeAddr("newCoord");
        bytes32 newKeyHash = bytes32(uint256(1));
        vm.prank(owner);
        factory.updateVRFConfig(newCoord, newKeyHash, 99);
        (address coord, bytes32 kh, uint256 subId) = factory.vrfConfig();
        assertEq(coord, newCoord);
        assertEq(kh, newKeyHash);
        assertEq(subId, 99);
    }

    function test_updateDefaults_success() public {
        vm.prank(owner);
        factory.updateDefaults(5, 50, 40, 15);
        assertEq(factory.defaultMinPlayers(), 5);
        assertEq(factory.defaultMaxPlayers(), 50);
        assertEq(factory.defaultEliminationPct(), 40);
        assertEq(factory.defaultRoundInterval(), 15);
    }
}
