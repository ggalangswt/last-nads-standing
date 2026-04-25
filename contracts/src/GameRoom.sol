// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

/// @title GameRoom — Last Nads Standing single game instance
/// @notice Manages the full lifecycle of one game: join → rounds → winner
contract GameRoom is VRFConsumerBaseV2Plus, ReentrancyGuard {
    using SafeERC20 for IERC20;
    // ─────────────────────────────────────────────────────────────────────────
    // Enums
    // ─────────────────────────────────────────────────────────────────────────

    enum GameStatus {
        WAITING,  // room open, accepting players
        ACTIVE,   // game running, rounds executing
        FINISHED  // game over, winner determined
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Structs
    // ─────────────────────────────────────────────────────────────────────────

    struct PlayerInfo {
        bool hasJoined;
        bool isAlive;
        bool hasShield;
        bool shieldUsed;
        uint256 eliminatedAtRound; // 0 if still alive or winner
    }

    struct GameInfo {
        GameStatus status;
        uint256 currentRound;
        uint256 prizePool;
        uint256 playersAlive;
        uint256 totalPlayers;
        address winner;
        uint256 lastRoundTime;
        uint256 nextRoundTime;
        uint256 entryFee;
        uint256 minPlayers;
        uint256 maxPlayers;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Constants
    // ─────────────────────────────────────────────────────────────────────────

    uint256 public constant MAX_GAME_DURATION = 7200;      // 2 hours
    uint256 public constant MAX_PLAYERS_HARD_CAP = 100;
    uint256 public constant MIN_ELIMINATION_PCT = 10;
    uint256 public constant MAX_ELIMINATION_PCT = 50;

    // VRF request config — generous gas for up to 100-player elimination rounds
    uint16  public constant REQUEST_CONFIRMATIONS = 3;
    uint32  public constant CALLBACK_GAS_LIMIT    = 1_500_000;
    uint32  public constant NUM_WORDS             = 1;

    // ─────────────────────────────────────────────────────────────────────────
    // Immutables (set in constructor, never change)
    // ─────────────────────────────────────────────────────────────────────────

    uint256 public immutable roomId;
    uint256 public immutable entryFee;
    uint256 public immutable minPlayers;
    uint256 public immutable maxPlayers;
    uint256 public immutable eliminationPct;  // e.g. 30 = 30%
    uint256 public immutable roundInterval;   // seconds between rounds
    uint256 public immutable platformFeePct;  // e.g. 5 = 5%
    address public immutable treasury;
    address public immutable factory;
    address public immutable roomAdmin;
    IERC20 public immutable paymentToken;

    // Chainlink VRF v2.5
    bytes32 public immutable keyHash;
    uint256 public immutable subscriptionId;

    // ─────────────────────────────────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────────────────────────────────

    address public keeper;

    GameStatus public status;
    address[] private _allPlayers;
    mapping(address => PlayerInfo) public players;

    address public winner;
    uint256 public currentRound;
    uint256 public lastRoundTime;
    uint256 public gameStartTime;
    uint256 public prizePool;

    uint256 public winnerPrize;
    bool public prizeClaimed;

    // Treasury fee is held here until treasury pulls it (safe in VRF callback context)
    uint256 public pendingTreasuryFee;

    // VRF round state
    bool    public roundPending;
    uint256 public pendingRequestId;
    mapping(uint256 => uint256) private _requestIdToRound;

    // ─────────────────────────────────────────────────────────────────────────
    // Events
    // ─────────────────────────────────────────────────────────────────────────

    event PlayerJoined(address indexed player, uint256 totalPlayers, uint256 prizePool);
    event GameStarted(uint256 indexed roomId, uint256 timestamp, uint256 totalPlayers, uint256 prizePool);
    event RoundRequested(uint256 indexed roundNumber, uint256 indexed requestId);
    event RoundExecuted(uint256 indexed roundNumber, uint256 eliminated, uint256 playersRemaining);
    event PlayerEliminated(address indexed player, uint256 indexed round, uint256 playersRemaining);
    event ShieldBlocked(address indexed player, uint256 indexed round);
    event GameFinished(address indexed winner, uint256 prize, uint256 totalRounds, uint256 gameDuration);
    event PrizeClaimed(address indexed winner, uint256 amount);
    event TreasuryFeeWithdrawn(address indexed treasury, uint256 amount);
    event KeeperUpdated(address indexed oldKeeper, address indexed newKeeper);
    event EmergencyWithdraw(address indexed by, uint256 amount, string reason);

    // ─────────────────────────────────────────────────────────────────────────
    // Modifiers
    // ─────────────────────────────────────────────────────────────────────────

    modifier onlyKeeper() {
        require(msg.sender == keeper, "GameRoom: not keeper");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == roomAdmin, "GameRoom: not admin");
        _;
    }

    modifier onlyStatus(GameStatus _status) {
        require(status == _status, "GameRoom: wrong status");
        _;
    }

    modifier gameActive() {
        require(status == GameStatus.ACTIVE, "GameRoom: not active");
        _;
    }

    modifier notExpired() {
        if (status == GameStatus.ACTIVE) {
            require(
                block.timestamp <= gameStartTime + MAX_GAME_DURATION,
                "GameRoom: game expired"
            );
        }
        _;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Constructor
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Create a new game room with fixed parameters
    /// @param _roomId       Unique identifier for this room (set by factory)
    /// @param _entryFee     MON amount each player must pay to join
    /// @param _minPlayers   Minimum players needed before keeper can start
    /// @param _maxPlayers   Maximum players allowed; auto-starts when reached
    /// @param _eliminationPct Percentage of alive players eliminated each round
    /// @param _roundInterval  Minimum seconds between rounds
    /// @param _treasury     Address that receives the platform fee
    /// @param _platformFeePct Percentage of prize pool taken as platform fee
    /// @param _keeper       Address authorized to trigger game progression
    /// @param _owner        Address with admin controls for the room
    /// @param _factory      Address of the factory that created this room
    /// @param _paymentToken ERC20 token used for entry and payouts
    /// @param _vrfCoordinator Chainlink VRF coordinator address
    /// @param _keyHash      VRF key hash (gas lane)
    /// @param _subscriptionId Chainlink VRF subscription ID
    constructor(
        uint256 _roomId,
        uint256 _entryFee,
        uint256 _minPlayers,
        uint256 _maxPlayers,
        uint256 _eliminationPct,
        uint256 _roundInterval,
        address _treasury,
        uint256 _platformFeePct,
        address _keeper,
        address _owner,
        address _factory,
        address _paymentToken,
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint256 _subscriptionId
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        require(_entryFee > 0, "GameRoom: entry fee must be > 0");
        require(_minPlayers >= 2, "GameRoom: min 2 players");
        require(_maxPlayers <= MAX_PLAYERS_HARD_CAP, "GameRoom: exceeds hard cap");
        require(_maxPlayers >= _minPlayers, "GameRoom: max < min");
        require(
            _eliminationPct >= MIN_ELIMINATION_PCT && _eliminationPct <= MAX_ELIMINATION_PCT,
            "GameRoom: invalid elimination pct"
        );
        require(_roundInterval >= 5, "GameRoom: interval too short");
        require(_treasury != address(0), "GameRoom: zero treasury");
        require(_keeper != address(0), "GameRoom: zero keeper");
        require(_owner != address(0), "GameRoom: zero owner");
        require(_paymentToken != address(0), "GameRoom: zero token");
        require(_platformFeePct <= 20, "GameRoom: fee too high");
        require(_vrfCoordinator != address(0), "GameRoom: zero coordinator");
        require(_subscriptionId > 0, "GameRoom: invalid subscription");

        roomId = _roomId;
        entryFee = _entryFee;
        minPlayers = _minPlayers;
        maxPlayers = _maxPlayers;
        eliminationPct = _eliminationPct;
        roundInterval = _roundInterval;
        treasury = _treasury;
        platformFeePct = _platformFeePct;
        keeper = _keeper;
        roomAdmin = _owner;
        factory = _factory;
        paymentToken = IERC20(_paymentToken);
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
        status = GameStatus.WAITING;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Player Actions
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Join the game room by paying the entry fee
    /// @dev Automatically starts the game if maxPlayers is reached
    function joinRoom() external onlyStatus(GameStatus.WAITING) nonReentrant {
        require(!players[msg.sender].hasJoined, "GameRoom: already joined");
        require(_allPlayers.length < maxPlayers, "GameRoom: room full");

        paymentToken.safeTransferFrom(msg.sender, address(this), entryFee);

        _allPlayers.push(msg.sender);
        players[msg.sender] = PlayerInfo({
            hasJoined: true,
            isAlive: true,
            hasShield: true,
            shieldUsed: false,
            eliminatedAtRound: 0
        });
        prizePool += entryFee;

        emit PlayerJoined(msg.sender, _allPlayers.length, prizePool);

        if (_allPlayers.length >= maxPlayers) {
            _startGame();
        }
    }

    /// @notice Winner calls this to receive their prize after game ends
    function claimPrize() external nonReentrant onlyStatus(GameStatus.FINISHED) {
        require(msg.sender == winner, "GameRoom: not winner");
        require(!prizeClaimed, "GameRoom: already claimed");

        prizeClaimed = true;
        uint256 amount = winnerPrize;

        paymentToken.safeTransfer(winner, amount);

        emit PrizeClaimed(winner, amount);
    }

    /// @notice Treasury pulls its platform fee after game ends
    function withdrawTreasuryFee() external nonReentrant onlyStatus(GameStatus.FINISHED) {
        require(msg.sender == treasury, "GameRoom: not treasury");
        uint256 fee = pendingTreasuryFee;
        require(fee > 0, "GameRoom: no fee pending");

        pendingTreasuryFee = 0;
        paymentToken.safeTransfer(treasury, fee);

        emit TreasuryFeeWithdrawn(treasury, fee);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Keeper Actions
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Manually start the game (requires minPlayers already joined)
    function startGame() external onlyKeeper onlyStatus(GameStatus.WAITING) {
        require(_allPlayers.length >= minPlayers, "GameRoom: not enough players");
        _startGame();
    }

    /// @notice Request a Chainlink VRF random word to drive the next elimination round
    /// @dev The actual eliminations happen in fulfillRandomWords once the oracle responds.
    ///      The keeper calls this; Chainlink calls back fulfillRandomWords automatically.
    function executeRound() external onlyKeeper gameActive notExpired nonReentrant {
        require(!roundPending, "GameRoom: round already pending");
        require(
            block.timestamp >= lastRoundTime + roundInterval,
            "GameRoom: round too soon"
        );

        address[] memory alive = _getAlivePlayers();
        require(alive.length > 1, "GameRoom: game should be finished");

        currentRound++;
        roundPending = true;

        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash:              keyHash,
                subId:                subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit:     CALLBACK_GAS_LIMIT,
                numWords:             NUM_WORDS,
                extraArgs:            VRFV2PlusClient._argsToBytes(
                                          VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                                      )
            })
        );

        pendingRequestId = requestId;
        _requestIdToRound[requestId] = currentRound;

        emit RoundRequested(currentRound, requestId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Chainlink VRF Callback
    // ─────────────────────────────────────────────────────────────────────────

    /// @dev Called by the VRF coordinator once randomness is ready.
    ///      Only the coordinator can call this (enforced by VRFConsumerBaseV2Plus).
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        uint256 round = _requestIdToRound[requestId];
        require(round != 0 && pendingRequestId == requestId, "GameRoom: unknown request");

        roundPending = false;

        if (status != GameStatus.ACTIVE) return;

        address[] memory alive = _getAlivePlayers();

        uint256 eliminatedCount = _processEliminations(randomWords[0], alive);

        lastRoundTime = block.timestamp;

        address[] memory survivors = _getAlivePlayers();
        emit RoundExecuted(round, eliminatedCount, survivors.length);

        if (survivors.length <= 1) {
            address gameWinner = survivors.length == 1
                ? survivors[0]
                : _getLastAlivePlayer();
            _endGame(gameWinner);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Internal
    // ─────────────────────────────────────────────────────────────────────────

    function _startGame() internal {
        status = GameStatus.ACTIVE;
        gameStartTime = block.timestamp;
        lastRoundTime = block.timestamp;
        currentRound = 0;

        emit GameStarted(roomId, block.timestamp, _allPlayers.length, prizePool);
    }

    /// @dev Fisher-Yates partial shuffle selects elimination targets.
    ///      randomWord is the verifiable random value from Chainlink VRF.
    ///      Shields are checked before marking elimination — a shielded player
    ///      survives the round and their shield is permanently consumed.
    ///      The invariant "at least 1 survivor" is enforced before the loop.
    function _processEliminations(
        uint256 randomWord,
        address[] memory alive
    ) internal returns (uint256 eliminatedCount) {
        uint256 elimCount = (alive.length * eliminationPct) / 100;
        if (elimCount == 0) elimCount = 1;

        // Never eliminate everyone — always leave at least 1 survivor
        if (elimCount >= alive.length) {
            elimCount = alive.length - 1;
        }

        uint256 aliveLen = alive.length;

        for (uint256 i = 0; i < elimCount; i++) {
            uint256 rand = uint256(keccak256(abi.encodePacked(randomWord, i)));
            uint256 j = i + (rand % (aliveLen - i));

            // Swap positions
            address tmp = alive[i];
            alive[i] = alive[j];
            alive[j] = tmp;

            address target = alive[i];

            if (players[target].hasShield && !players[target].shieldUsed) {
                // Shield absorbs this elimination; player stays alive
                players[target].shieldUsed = true;
                emit ShieldBlocked(target, currentRound);
            } else {
                players[target].isAlive = false;
                players[target].eliminatedAtRound = currentRound;
                eliminatedCount++;

                uint256 remaining = _countAlive();
                emit PlayerEliminated(target, currentRound, remaining);
            }
        }
    }

    /// @dev Sets game to FINISHED and stores treasury fee for pull withdrawal.
    ///      Treasury fee is NOT transferred here — keeps this safe to call from
    ///      fulfillRandomWords where external call failures would lock the game.
    function _endGame(address _winner) internal {
        winner = _winner;
        status = GameStatus.FINISHED;

        uint256 platformFee = (prizePool * platformFeePct) / 100;
        pendingTreasuryFee = platformFee;
        winnerPrize = prizePool - platformFee;

        uint256 duration = block.timestamp - gameStartTime;
        emit GameFinished(_winner, winnerPrize, currentRound, duration);
    }

    function _getAlivePlayers() internal view returns (address[] memory) {
        uint256 count = _countAlive();
        address[] memory alive = new address[](count);
        uint256 idx = 0;
        uint256 len = _allPlayers.length;
        for (uint256 i = 0; i < len; i++) {
            if (players[_allPlayers[i]].isAlive) {
                alive[idx++] = _allPlayers[i];
            }
        }
        return alive;
    }

    function _countAlive() internal view returns (uint256 count) {
        uint256 len = _allPlayers.length;
        for (uint256 i = 0; i < len; i++) {
            if (players[_allPlayers[i]].isAlive) count++;
        }
    }

    function _getLastAlivePlayer() internal view returns (address) {
        uint256 len = _allPlayers.length;
        for (uint256 i = 0; i < len; i++) {
            if (players[_allPlayers[i]].isAlive) return _allPlayers[i];
        }
        revert("GameRoom: no alive player found");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // View Functions
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Returns addresses of all currently alive players
    function getAlivePlayers() external view returns (address[] memory) {
        return _getAlivePlayers();
    }

    /// @notice Returns the full list of players who joined (alive or not)
    function getAllPlayers() external view returns (address[] memory) {
        return _allPlayers;
    }

    /// @notice Returns total player count and how many are still alive
    /// @return total All players who joined
    /// @return alive Players still in the game
    function getPlayerCount() external view returns (uint256 total, uint256 alive) {
        total = _allPlayers.length;
        alive = _countAlive();
    }

    /// @notice Returns a snapshot of the current game state
    function getGameInfo() external view returns (GameInfo memory) {
        return GameInfo({
            status: status,
            currentRound: currentRound,
            prizePool: prizePool,
            playersAlive: _countAlive(),
            totalPlayers: _allPlayers.length,
            winner: winner,
            lastRoundTime: lastRoundTime,
            nextRoundTime: lastRoundTime + roundInterval,
            entryFee: entryFee,
            minPlayers: minPlayers,
            maxPlayers: maxPlayers
        });
    }

    /// @notice Returns the PlayerInfo struct for a given address
    function getPlayerInfo(address player) external view returns (PlayerInfo memory) {
        return players[player];
    }

    /// @notice Returns true if the keeper can call executeRound() right now
    function canExecuteRound() external view returns (bool) {
        return (
            status == GameStatus.ACTIVE &&
            !roundPending &&
            block.timestamp >= lastRoundTime + roundInterval &&
            block.timestamp <= gameStartTime + MAX_GAME_DURATION
        );
    }

    /// @notice Seconds until the next round can be triggered (0 if ready)
    function timeUntilNextRound() external view returns (uint256) {
        if (status != GameStatus.ACTIVE) return 0;
        uint256 nextRound = lastRoundTime + roundInterval;
        if (block.timestamp >= nextRound) return 0;
        return nextRound - block.timestamp;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Admin
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Transfer keeper role to a new address
    /// @param newKeeper New keeper address (cannot be zero)
    function updateKeeper(address newKeeper) external onlyAdmin {
        require(newKeeper != address(0), "GameRoom: zero address");
        address old = keeper;
        keeper = newKeeper;
        emit KeeperUpdated(old, newKeeper);
    }

    /// @notice Emergency exit: refunds players if game is stuck/expired
    /// @param reason Human-readable reason logged in the event
    function emergencyWithdraw(string calldata reason) external onlyAdmin {
        require(
            block.timestamp > gameStartTime + MAX_GAME_DURATION ||
            status == GameStatus.WAITING,
            "GameRoom: game still active"
        );
        require(
            !(status == GameStatus.FINISHED && prizeClaimed),
            "GameRoom: nothing to withdraw"
        );

        uint256 balance = paymentToken.balanceOf(address(this));
        require(balance > 0, "GameRoom: empty");

        // Proportional refund to all players if game was running
        if (status == GameStatus.ACTIVE && _allPlayers.length > 0) {
            uint256 perPlayer = balance / _allPlayers.length;
            uint256 len = _allPlayers.length;
            for (uint256 i = 0; i < len; i++) {
                paymentToken.safeTransfer(_allPlayers[i], perPlayer);
            }
        }

        uint256 remaining = paymentToken.balanceOf(address(this));
        if (remaining > 0) {
            paymentToken.safeTransfer(roomAdmin, remaining);
        }

        emit EmergencyWithdraw(msg.sender, balance, reason);
    }
}
