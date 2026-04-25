// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

import "../src/MockUSDC.sol";

contract UpgradeMockUSDCScript is Script {
    function run(address proxyAddress) external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerKey);

        MockUSDC newImplementation = new MockUSDC();
        MockUSDC(proxyAddress).upgradeToAndCall(address(newImplementation), "");

        vm.stopBroadcast();

        console.log("MockUSDC proxy upgraded:", proxyAddress);
        console.log("New implementation:     ", address(newImplementation));
    }
}
