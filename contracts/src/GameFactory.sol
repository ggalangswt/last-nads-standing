// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./GameRoom.sol";

/// @title GameFactory — deploys and tracks Last Nads Standing game rooms
/// @notice Anyone can create a room with custom parameters; the factory wires
///         in the shared keeper, treasury, fee, and VRF settings automatically.
contract GameFactory is Ownable {
    // ─────────────────────────────────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────────────────────────────────

    struct RoomConfig {
        address roomAddress;
        address creator;
        uint256 entryFee;
        uint256 createdAt;
        bool isActive;
    }

    struct VRFConfig {
        address coordinator;
        bytes32 keyHash;
        uint256 subscriptionId;
    }

    address public keeper;
    address public treasury;
    address public paymentToken;
    uint256 public platformFeePct;
    uint256 private _roomCounter;

    VRFConfig public vrfConfig;

    address[] public allRooms;
    mapping(address => RoomConfig) public roomConfigs;
    mapping(address => address[]) public roomsByCreator;
    mapping(uint256 => address) public roomById;

    // Defaults used when caller passes 0 for a parameter
    uint256 public defaultMinPlayers = 3;
    uint256 public defaultMaxPlayers = 20;
    uint256 public defaultEliminationPct = 30;
    uint256 public defaultRoundInterval = 12;

    // ─────────────────────────────────────────────────────────────────────────
    // Events
    // ─────────────────────────────────────────────────────────────────────────

    event RoomCreated(
        address indexed roomAddress,
        address indexed creator,
        uint256 indexed roomId,
        uint256 entryFee
    );
    event KeeperUpdated(address indexed oldKeeper, address indexed newKeeper);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event PaymentTokenUpdated(address indexed oldToken, address indexed newToken);
    event PlatformFeeUpdated(uint256 oldPct, uint256 newPct);
    event VRFConfigUpdated(address coordinator, bytes32 keyHash, uint256 subscriptionId);
    event DefaultsUpdated(
        uint256 minPlayers,
        uint256 maxPlayers,
        uint256 elimPct,
        uint256 interval
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Constructor
    // ─────────────────────────────────────────────────────────────────────────

    /// @param _keeper         Address that will control game progression for all rooms
    /// @param _treasury       Address that receives platform fees
    /// @param _paymentToken   ERC20 token used by all rooms for entry and payouts
    /// @param _platformFeePct Fee percentage (0-20) taken from each prize pool
    /// @param _vrfCoordinator Chainlink VRF coordinator address
    /// @param _keyHash        VRF key hash (gas lane)
    /// @param _subscriptionId Chainlink VRF subscription ID funded with LINK
    constructor(
        address _keeper,
        address _treasury,
        address _paymentToken,
        uint256 _platformFeePct,
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint256 _subscriptionId
    ) Ownable(msg.sender) {
        require(_keeper != address(0), "Factory: zero keeper");
        require(_treasury != address(0), "Factory: zero treasury");
        require(_paymentToken != address(0), "Factory: zero token");
        require(_platformFeePct <= 20, "Factory: fee too high");
        require(_vrfCoordinator != address(0), "Factory: zero coordinator");
        require(_subscriptionId > 0, "Factory: invalid subscription");

        keeper = _keeper;
        treasury = _treasury;
        paymentToken = _paymentToken;
        platformFeePct = _platformFeePct;
        vrfConfig = VRFConfig({
            coordinator: _vrfCoordinator,
            keyHash: _keyHash,
            subscriptionId: _subscriptionId
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Room Creation
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Deploy a new GameRoom with fully custom parameters
    /// @dev Pass 0 for any parameter to use the factory default
    /// @param entryFee MON amount required to join (must be > 0)
    /// @param minPlayers Minimum players before game can start (0 = default)
    /// @param maxPlayers Maximum players; room auto-starts when reached (0 = default)
    /// @param eliminationPct Percentage eliminated per round, 10-50 (0 = default)
    /// @param roundInterval Seconds between rounds, min 5 (0 = default)
    /// @return roomAddress Address of the deployed GameRoom contract
    function createRoom(
        uint256 entryFee,
        uint256 minPlayers,
        uint256 maxPlayers,
        uint256 eliminationPct,
        uint256 roundInterval
    ) external returns (address roomAddress) {
        require(entryFee > 0, "Factory: entry fee must be > 0");

        uint256 _minP    = minPlayers     == 0 ? defaultMinPlayers     : minPlayers;
        uint256 _maxP    = maxPlayers     == 0 ? defaultMaxPlayers     : maxPlayers;
        uint256 _elimP   = eliminationPct == 0 ? defaultEliminationPct : eliminationPct;
        uint256 _interval = roundInterval == 0 ? defaultRoundInterval  : roundInterval;

        _roomCounter++;
        uint256 newRoomId = _roomCounter;

        VRFConfig memory vrf = vrfConfig;

        GameRoom room = new GameRoom(
            newRoomId,
            entryFee,
            _minP,
            _maxP,
            _elimP,
            _interval,
            treasury,
            platformFeePct,
            keeper,
            msg.sender,
            address(this),
            paymentToken,
            vrf.coordinator,
            vrf.keyHash,
            vrf.subscriptionId
        );

        roomAddress = address(room);
        allRooms.push(roomAddress);
        roomById[newRoomId] = roomAddress;
        roomsByCreator[msg.sender].push(roomAddress);
        roomConfigs[roomAddress] = RoomConfig({
            roomAddress: roomAddress,
            creator: msg.sender,
            entryFee: entryFee,
            createdAt: block.timestamp,
            isActive: true
        });

        emit RoomCreated(roomAddress, msg.sender, newRoomId, entryFee);
    }

    /// @notice Convenience wrapper: create a room with all factory defaults
    /// @param entryFee MON amount required to join
    /// @return Address of the deployed GameRoom
    function createDefaultRoom(uint256 entryFee) external returns (address) {
        require(entryFee > 0, "Factory: entry fee must be > 0");

        _roomCounter++;
        uint256 newRoomId = _roomCounter;

        VRFConfig memory vrf = vrfConfig;

        GameRoom room = new GameRoom(
            newRoomId,
            entryFee,
            defaultMinPlayers,
            defaultMaxPlayers,
            defaultEliminationPct,
            defaultRoundInterval,
            treasury,
            platformFeePct,
            keeper,
            msg.sender,
            address(this),
            paymentToken,
            vrf.coordinator,
            vrf.keyHash,
            vrf.subscriptionId
        );

        address roomAddress = address(room);
        allRooms.push(roomAddress);
        roomById[newRoomId] = roomAddress;
        roomsByCreator[msg.sender].push(roomAddress);
        roomConfigs[roomAddress] = RoomConfig({
            roomAddress: roomAddress,
            creator: msg.sender,
            entryFee: entryFee,
            createdAt: block.timestamp,
            isActive: true
        });

        emit RoomCreated(roomAddress, msg.sender, newRoomId, entryFee);
        return roomAddress;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // View Functions
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Returns all rooms currently in WAITING or ACTIVE state
    function getActiveRooms() external view returns (address[] memory) {
        uint256 count = 0;
        uint256 len = allRooms.length;
        for (uint256 i = 0; i < len; i++) {
            GameRoom room = GameRoom(payable(allRooms[i]));
            GameRoom.GameStatus s = room.status();
            if (s == GameRoom.GameStatus.WAITING || s == GameRoom.GameStatus.ACTIVE) {
                count++;
            }
        }

        address[] memory active = new address[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < len; i++) {
            GameRoom room = GameRoom(payable(allRooms[i]));
            GameRoom.GameStatus s = room.status();
            if (s == GameRoom.GameStatus.WAITING || s == GameRoom.GameStatus.ACTIVE) {
                active[idx++] = allRooms[i];
            }
        }
        return active;
    }

    /// @notice Returns all rooms currently in WAITING state (joinable)
    function getWaitingRooms() external view returns (address[] memory) {
        uint256 count = 0;
        uint256 len = allRooms.length;
        for (uint256 i = 0; i < len; i++) {
            if (GameRoom(payable(allRooms[i])).status() == GameRoom.GameStatus.WAITING) {
                count++;
            }
        }

        address[] memory waiting = new address[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < len; i++) {
            if (GameRoom(payable(allRooms[i])).status() == GameRoom.GameStatus.WAITING) {
                waiting[idx++] = allRooms[i];
            }
        }
        return waiting;
    }

    /// @notice Total number of rooms ever created
    function getRoomCount() external view returns (uint256) {
        return allRooms.length;
    }

    /// @notice Returns all rooms created by a specific address
    /// @param creator The creator's wallet address
    function getRoomsByCreator(address creator) external view returns (address[] memory) {
        return roomsByCreator[creator];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Admin
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Update the keeper address used for future rooms
    function updateKeeper(address newKeeper) external onlyOwner {
        require(newKeeper != address(0), "Factory: zero address");
        address old = keeper;
        keeper = newKeeper;
        emit KeeperUpdated(old, newKeeper);
    }

    /// @notice Update the treasury address used for future rooms
    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Factory: zero address");
        address old = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(old, newTreasury);
    }

    /// @notice Update the ERC20 payment token used for future rooms
    function updatePaymentToken(address newPaymentToken) external onlyOwner {
        require(newPaymentToken != address(0), "Factory: zero address");
        address old = paymentToken;
        paymentToken = newPaymentToken;
        emit PaymentTokenUpdated(old, newPaymentToken);
    }

    /// @notice Update the platform fee percentage for future rooms
    /// @param newPct New fee percentage, max 20
    function updatePlatformFee(uint256 newPct) external onlyOwner {
        require(newPct <= 20, "Factory: fee too high");
        uint256 old = platformFeePct;
        platformFeePct = newPct;
        emit PlatformFeeUpdated(old, newPct);
    }

    /// @notice Update the Chainlink VRF configuration for future rooms
    /// @dev Existing deployed rooms are unaffected — they bake VRF config at deploy time
    function updateVRFConfig(
        address _coordinator,
        bytes32 _keyHash,
        uint256 _subscriptionId
    ) external onlyOwner {
        require(_coordinator != address(0), "Factory: zero coordinator");
        require(_subscriptionId > 0, "Factory: invalid subscription");
        vrfConfig = VRFConfig({
            coordinator: _coordinator,
            keyHash: _keyHash,
            subscriptionId: _subscriptionId
        });
        emit VRFConfigUpdated(_coordinator, _keyHash, _subscriptionId);
    }

    /// @notice Update default room parameters applied when callers pass 0
    function updateDefaults(
        uint256 _minPlayers,
        uint256 _maxPlayers,
        uint256 _elimPct,
        uint256 _interval
    ) external onlyOwner {
        require(_minPlayers >= 2, "Factory: min 2 players");
        require(_maxPlayers >= _minPlayers, "Factory: max < min");
        require(_maxPlayers <= 100, "Factory: exceeds hard cap");
        require(_elimPct >= 10 && _elimPct <= 50, "Factory: invalid elim pct");
        require(_interval >= 5, "Factory: interval too short");

        defaultMinPlayers = _minPlayers;
        defaultMaxPlayers = _maxPlayers;
        defaultEliminationPct = _elimPct;
        defaultRoundInterval = _interval;

        emit DefaultsUpdated(_minPlayers, _maxPlayers, _elimPct, _interval);
    }
}
