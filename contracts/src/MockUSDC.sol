// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

/// @notice Mock USDC faucet for local/testnet usage.
/// Each address can claim 100 USDC every 1 day.
contract MockUSDC is Initializable, ERC20Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    error FaucetCooldownNotElapsed(uint256 remaining);

    uint8 private constant _DECIMALS = 6;
    uint256 public constant FAUCET_AMOUNT = 100 * 10 ** 6; // 100 USDC
    uint256 public constant FAUCET_COOLDOWN = 1 days;

    mapping(address => uint256) public nextFaucetAt;

    event FaucetClaimed(address indexed recipient, uint256 amount, uint256 nextFaucetAt);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) external initializer {
        __ERC20_init("USD Coin", "USDC");
        __Ownable_init(initialOwner);
    }

    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }

    /// @notice Claim 100 mock USDC. Each address can claim once per cooldown window.
    function faucet() external {
        uint256 claimAvailableAt = nextFaucetAt[msg.sender];
        if (block.timestamp < claimAvailableAt) {
            revert FaucetCooldownNotElapsed(claimAvailableAt - block.timestamp);
        }

        uint256 nextClaimAt = block.timestamp + FAUCET_COOLDOWN;
        nextFaucetAt[msg.sender] = nextClaimAt;
        _mint(msg.sender, FAUCET_AMOUNT);

        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT, nextClaimAt);
    }

    function canClaim(address user) external view returns (bool) {
        return block.timestamp >= nextFaucetAt[user];
    }

    /// @notice Returns seconds until `user` can claim again. Returns 0 if ready.
    function cooldownRemaining(address user) external view returns (uint256) {
        uint256 claimAvailableAt = nextFaucetAt[user];
        if (block.timestamp >= claimAvailableAt) {
            return 0;
        }

        return claimAvailableAt - block.timestamp;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
