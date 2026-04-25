// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./GameRoom.sol";

/// @title PredictionPool — spectator prediction market for Last Nads Standing rooms
/// @notice Spectators bet on who will win a specific game room. Winners split
///         the pool proportionally to their stake.
contract PredictionPool is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    // ─────────────────────────────────────────────────────────────────────────
    // Structs
    // ─────────────────────────────────────────────────────────────────────────

    struct Prediction {
        address predictor;
        address predictedWinner;
        uint256 amount;
        bool claimed;
    }

    struct RoomPredictions {
        bool resolved;
        address actualWinner;
        uint256 totalPool;
        uint256 winningPool; // sum of stakes on the actual winner
        uint256 predictionCount;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────────────────────────────────

    address public keeper;
    IERC20 public immutable paymentToken;

    // roomAddress => predictor => list of prediction indices
    mapping(address => mapping(address => uint256[])) private _userPredictions;
    // roomAddress => all predictions
    mapping(address => Prediction[]) private _roomPredictions;
    // roomAddress => aggregated data
    mapping(address => RoomPredictions) public roomData;

    uint256 public constant MIN_BET = 1 * 10 ** 6;

    // ─────────────────────────────────────────────────────────────────────────
    // Events
    // ─────────────────────────────────────────────────────────────────────────

    event PredictionPlaced(
        address indexed roomAddress,
        address indexed predictor,
        address indexed predictedWinner,
        uint256 amount
    );
    event PredictionResolved(
        address indexed roomAddress,
        address indexed actualWinner,
        uint256 totalPool,
        uint256 winningPool
    );
    event RewardClaimed(
        address indexed roomAddress,
        address indexed predictor,
        uint256 amount
    );
    event KeeperUpdated(address indexed oldKeeper, address indexed newKeeper);

    // ─────────────────────────────────────────────────────────────────────────
    // Modifiers
    // ─────────────────────────────────────────────────────────────────────────

    modifier onlyKeeper() {
        require(msg.sender == keeper, "PredictionPool: not keeper");
        _;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Constructor
    // ─────────────────────────────────────────────────────────────────────────

    constructor(address _keeper, address _paymentToken) Ownable(msg.sender) {
        require(_keeper != address(0), "PredictionPool: zero keeper");
        require(_paymentToken != address(0), "PredictionPool: zero token");
        keeper = _keeper;
        paymentToken = IERC20(_paymentToken);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Spectator Actions
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Place a bet on who will win a specific game room
    /// @param roomAddress The GameRoom contract address to bet on
    /// @param predictedWinner The player you think will win
    function placeBet(address roomAddress, address predictedWinner, uint256 amount)
        external
        nonReentrant
    {
        require(amount >= MIN_BET, "PredictionPool: bet too small");
        require(!roomData[roomAddress].resolved, "PredictionPool: already resolved");

        GameRoom room = GameRoom(payable(roomAddress));
        GameRoom.GameStatus roomStatus = room.status();
        require(
            roomStatus == GameRoom.GameStatus.WAITING ||
            roomStatus == GameRoom.GameStatus.ACTIVE,
            "PredictionPool: game not open"
        );

        // Predicted winner must be a live participant
        GameRoom.PlayerInfo memory pInfo = room.getPlayerInfo(predictedWinner);
        require(pInfo.hasJoined, "PredictionPool: not a player");
        require(pInfo.isAlive, "PredictionPool: player already eliminated");

        paymentToken.safeTransferFrom(msg.sender, address(this), amount);

        uint256 idx = _roomPredictions[roomAddress].length;
        _roomPredictions[roomAddress].push(Prediction({
            predictor: msg.sender,
            predictedWinner: predictedWinner,
            amount: amount,
            claimed: false
        }));

        _userPredictions[roomAddress][msg.sender].push(idx);

        RoomPredictions storage rd = roomData[roomAddress];
        rd.totalPool += amount;
        rd.predictionCount++;

        emit PredictionPlaced(roomAddress, msg.sender, predictedWinner, amount);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Keeper Actions
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Resolve predictions for a finished room by reading its winner
    /// @dev Must be called after GameRoom emits GameFinished
    /// @param roomAddress The room to resolve
    function resolvePredictions(address roomAddress) external onlyKeeper {
        RoomPredictions storage rd = roomData[roomAddress];
        require(!rd.resolved, "PredictionPool: already resolved");

        GameRoom room = GameRoom(payable(roomAddress));
        require(
            room.status() == GameRoom.GameStatus.FINISHED,
            "PredictionPool: game not finished"
        );

        address actualWinner = room.winner();
        require(actualWinner != address(0), "PredictionPool: no winner set");

        rd.resolved = true;
        rd.actualWinner = actualWinner;

        // Tally how much was staked on the correct winner
        uint256 len = _roomPredictions[roomAddress].length;
        uint256 winPool = 0;
        for (uint256 i = 0; i < len; i++) {
            if (_roomPredictions[roomAddress][i].predictedWinner == actualWinner) {
                winPool += _roomPredictions[roomAddress][i].amount;
            }
        }
        rd.winningPool = winPool;

        emit PredictionResolved(roomAddress, actualWinner, rd.totalPool, winPool);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Claim
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Claim proportional share of the pool if your prediction was correct
    /// @param roomAddress The room whose predictions you want to claim from
    function claimPredictionReward(address roomAddress) external nonReentrant {
        RoomPredictions storage rd = roomData[roomAddress];
        require(rd.resolved, "PredictionPool: not resolved yet");

        uint256[] storage indices = _userPredictions[roomAddress][msg.sender];
        require(indices.length > 0, "PredictionPool: no predictions");

        uint256 totalReward = 0;

        for (uint256 i = 0; i < indices.length; i++) {
            Prediction storage pred = _roomPredictions[roomAddress][indices[i]];
            if (!pred.claimed && pred.predictedWinner == rd.actualWinner) {
                pred.claimed = true;
                // Proportional share: (my stake / winning pool) * total pool
                uint256 reward = (pred.amount * rd.totalPool) / rd.winningPool;
                totalReward += reward;
            }
        }

        require(totalReward > 0, "PredictionPool: nothing to claim");

        paymentToken.safeTransfer(msg.sender, totalReward);

        emit RewardClaimed(roomAddress, msg.sender, totalReward);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // View Functions
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Returns all predictions made on a room
    function getRoomPredictions(address roomAddress)
        external
        view
        returns (Prediction[] memory)
    {
        return _roomPredictions[roomAddress];
    }

    /// @notice Returns indices of predictions made by a specific user on a room
    function getUserPredictionIndices(address roomAddress, address predictor)
        external
        view
        returns (uint256[] memory)
    {
        return _userPredictions[roomAddress][predictor];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Admin
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Update the keeper address
    function updateKeeper(address newKeeper) external onlyOwner {
        require(newKeeper != address(0), "PredictionPool: zero address");
        address old = keeper;
        keeper = newKeeper;
        emit KeeperUpdated(old, newKeeper);
    }
}
