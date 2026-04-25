// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import "../src/MockUSDC.sol";

contract MockUSDCV2 is MockUSDC {
    function version() external pure returns (uint256) {
        return 2;
    }
}

contract MockUSDCTest is Test {
    event FaucetClaimed(address indexed recipient, uint256 amount, uint256 nextFaucetAt);

    MockUSDC internal usdc;
    address internal implementation;
    address internal owner = makeAddr("owner");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    function setUp() public {
        implementation = address(new MockUSDC());

        bytes memory initData = abi.encodeCall(MockUSDC.initialize, (owner));
        ERC1967Proxy proxy = new ERC1967Proxy(implementation, initData);
        usdc = MockUSDC(address(proxy));
    }

    function test_metadata() public view {
        assertEq(usdc.name(), "USD Coin");
        assertEq(usdc.symbol(), "USDC");
        assertEq(usdc.decimals(), 6);
        assertEq(usdc.totalSupply(), 0);
        assertEq(usdc.FAUCET_AMOUNT(), 100 * 10 ** 6);
        assertEq(usdc.FAUCET_COOLDOWN(), 1 days);
        assertEq(usdc.owner(), owner);
    }

    function test_initialize_revertsWhenCalledAgain() public {
        vm.expectRevert();
        usdc.initialize(owner);
    }

    function test_faucet_firstClaimMints100Usdc() public {
        vm.prank(alice);
        usdc.faucet();

        assertEq(usdc.balanceOf(alice), 100 * 10 ** 6);
        assertEq(usdc.totalSupply(), 100 * 10 ** 6);
    }

    function test_faucet_emitsEventWithNextClaimTime() public {
        uint256 claimTime = 1_000_000;
        vm.warp(claimTime);

        vm.expectEmit(true, false, false, true);
        emit FaucetClaimed(alice, 100 * 10 ** 6, claimTime + 1 days);

        vm.prank(alice);
        usdc.faucet();
    }

    function test_faucet_setsNextClaimTimestamp() public {
        uint256 claimTime = 1_000_000;
        vm.warp(claimTime);

        vm.prank(alice);
        usdc.faucet();

        assertEq(usdc.nextFaucetAt(alice), claimTime + 1 days);
    }

    function test_faucet_differentUsersHaveIndependentCooldowns() public {
        vm.prank(alice);
        usdc.faucet();

        vm.prank(bob);
        usdc.faucet();

        assertEq(usdc.balanceOf(alice), 100 * 10 ** 6);
        assertEq(usdc.balanceOf(bob), 100 * 10 ** 6);
        assertEq(usdc.totalSupply(), 200 * 10 ** 6);
    }

    function test_faucet_revertsDuringCooldown() public {
        vm.warp(1_000_000);

        vm.prank(alice);
        usdc.faucet();

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(MockUSDC.FaucetCooldownNotElapsed.selector, 1 days));
        usdc.faucet();
    }

    function test_faucet_revertsOneSecondBeforeCooldownEnds() public {
        uint256 claimTime = 1_000_000;
        vm.warp(claimTime);

        vm.prank(alice);
        usdc.faucet();

        vm.warp(claimTime + 1 days - 1);
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(MockUSDC.FaucetCooldownNotElapsed.selector, 1));
        usdc.faucet();
    }

    function test_faucet_allowsClaimExactlyAtCooldownBoundary() public {
        uint256 claimTime = 1_000_000;
        vm.warp(claimTime);

        vm.prank(alice);
        usdc.faucet();

        vm.warp(claimTime + 1 days);
        vm.prank(alice);
        usdc.faucet();

        assertEq(usdc.balanceOf(alice), 200 * 10 ** 6);
    }

    function test_canClaim_trueBeforeFirstClaim() public view {
        assertTrue(usdc.canClaim(alice));
    }

    function test_canClaim_falseDuringCooldown() public {
        vm.warp(1_000_000);

        vm.prank(alice);
        usdc.faucet();

        assertFalse(usdc.canClaim(alice));
    }

    function test_canClaim_trueAfterCooldownEnds() public {
        uint256 claimTime = 1_000_000;
        vm.warp(claimTime);

        vm.prank(alice);
        usdc.faucet();

        vm.warp(claimTime + 1 days);
        assertTrue(usdc.canClaim(alice));
    }

    function test_cooldownRemaining_zeroBeforeFirstClaim() public view {
        assertEq(usdc.cooldownRemaining(alice), 0);
    }

    function test_cooldownRemaining_fullCooldownRightAfterClaim() public {
        vm.warp(1_000_000);

        vm.prank(alice);
        usdc.faucet();

        assertEq(usdc.cooldownRemaining(alice), 1 days);
    }

    function test_cooldownRemaining_decreasesOverTime() public {
        uint256 claimTime = 1_000_000;
        vm.warp(claimTime);

        vm.prank(alice);
        usdc.faucet();

        vm.warp(claimTime + 12 hours);
        assertEq(usdc.cooldownRemaining(alice), 12 hours);
    }

    function test_cooldownRemaining_zeroAfterCooldownEnds() public {
        uint256 claimTime = 1_000_000;
        vm.warp(claimTime);

        vm.prank(alice);
        usdc.faucet();

        vm.warp(claimTime + 1 days + 1);
        assertEq(usdc.cooldownRemaining(alice), 0);
    }

    function test_transfer_worksAfterFaucetClaim() public {
        vm.prank(alice);
        usdc.faucet();

        vm.prank(alice);
        bool ok = usdc.transfer(bob, 25 * 10 ** 6);

        assertTrue(ok);
        assertEq(usdc.balanceOf(alice), 75 * 10 ** 6);
        assertEq(usdc.balanceOf(bob), 25 * 10 ** 6);
    }

    function test_approveAndTransferFrom_worksAfterFaucetClaim() public {
        vm.prank(alice);
        usdc.faucet();

        vm.prank(alice);
        usdc.approve(bob, 40 * 10 ** 6);

        vm.prank(bob);
        bool ok = usdc.transferFrom(alice, bob, 40 * 10 ** 6);

        assertTrue(ok);
        assertEq(usdc.balanceOf(alice), 60 * 10 ** 6);
        assertEq(usdc.balanceOf(bob), 40 * 10 ** 6);
    }

    function test_upgrade_keepsProxyAddressAndState() public {
        vm.prank(alice);
        usdc.faucet();

        address proxyAddress = address(usdc);
        MockUSDCV2 newImplementation = new MockUSDCV2();

        vm.prank(owner);
        usdc.upgradeToAndCall(address(newImplementation), "");

        assertEq(address(usdc), proxyAddress);
        assertEq(usdc.balanceOf(alice), 100 * 10 ** 6);
        assertEq(usdc.owner(), owner);
        assertEq(MockUSDCV2(proxyAddress).version(), 2);
    }

    function test_upgrade_revertsForNonOwner() public {
        MockUSDCV2 newImplementation = new MockUSDCV2();

        vm.prank(alice);
        vm.expectRevert();
        usdc.upgradeToAndCall(address(newImplementation), "");
    }

    function testFuzz_cooldownRemaining_neverExceedsOneDay(address user, uint256 warpTime) public {
        vm.assume(user != address(0));

        uint256 claimTime = 1_000_000;
        warpTime = bound(warpTime, 0, 365 days);

        vm.warp(claimTime);
        vm.prank(user);
        usdc.faucet();

        vm.warp(claimTime + warpTime);
        assertLe(usdc.cooldownRemaining(user), 1 days);
    }

    function testFuzz_multipleClaimsAccumulate(uint8 claims) public {
        vm.assume(claims > 0 && claims <= 10);

        uint256 claimTime = 1_000_000;
        vm.warp(claimTime);

        for (uint256 i = 0; i < claims; i++) {
            if (i > 0) {
                vm.warp(block.timestamp + 1 days);
            }
            vm.prank(alice);
            usdc.faucet();
        }

        assertEq(usdc.balanceOf(alice), uint256(claims) * 100 * 10 ** 6);
    }
}
