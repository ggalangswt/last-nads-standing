// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "../src/GameFactory.sol";
import "../src/MockUSDC.sol";
import "../src/PredictionPool.sol";
import "../src/MockVRFCoordinator.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);
        address keeperAddr = vm.envAddress("KEEPER_ADDRESS");
        address treasuryAddr = vm.envOr("TREASURY_ADDRESS", keeperAddr);

        // VRF config: real Chainlink coordinator or mock for Monad testnet
        // Set VRF_COORDINATOR in .env for production chains with Chainlink support.
        // Leave unset (or zero) to auto-deploy MockVRFCoordinator.
        address vrfCoordinator = vm.envOr("VRF_COORDINATOR", address(0));
        bytes32 vrfKeyHash    = vm.envOr("VRF_KEY_HASH", bytes32(0));
        uint256 vrfSubId      = vm.envOr("VRF_SUBSCRIPTION_ID", uint256(0));

        vm.startBroadcast(deployerKey);

        // 1. Deploy mock USDC implementation + proxy so the FE keeps a stable address
        MockUSDC mockUsdcImplementation = new MockUSDC();
        ERC1967Proxy mockUsdcProxy =
            new ERC1967Proxy(address(mockUsdcImplementation), abi.encodeCall(MockUSDC.initialize, (deployer)));
        MockUSDC mockUsdc = MockUSDC(address(mockUsdcProxy));

        // 2. VRF setup — use MockVRFCoordinator when Chainlink is unavailable (e.g. Monad testnet)
        MockVRFCoordinator mockVRF;
        if (vrfCoordinator == address(0)) {
            mockVRF = new MockVRFCoordinator();
            vrfCoordinator = address(mockVRF);
            vrfSubId = 1; // mock ignores subscriptionId; any non-zero value works
            console.log("MockVRFCoordinator deployed (Chainlink VRF unavailable on this chain)");
            console.log("  After executeRound(), keeper must call mockVRF.fulfillRequest(requestId)");
        }

        // 3. Deploy factory with 5% platform fee + VRF config
        GameFactory factory = new GameFactory(
            keeperAddr,
            treasuryAddr,
            address(mockUsdc),
            5,
            vrfCoordinator,
            vrfKeyHash,
            vrfSubId
        );

        // 4. Deploy prediction pool
        PredictionPool predictionPool = new PredictionPool(keeperAddr, address(mockUsdc));

        // 5. Create one demo room (10 mockUSDC entry fee, all defaults)
        address demoRoom = factory.createDefaultRoom(10 * 10 ** 6);

        vm.stopBroadcast();

        console.log("=== Last Nads Standing Deployment ===");
        console.log("MockUSDC Proxy:    ", address(mockUsdc));
        console.log("MockUSDC Impl:     ", address(mockUsdcImplementation));
        console.log("VRF Coordinator:   ", vrfCoordinator);
        console.log("Factory:           ", address(factory));
        console.log("PredictionPool:    ", address(predictionPool));
        console.log("Demo Room:         ", demoRoom);
        console.log("Keeper:            ", keeperAddr);
        console.log("Treasury:          ", treasuryAddr);

        string memory mockVrfJson = address(mockVRF) != address(0)
            ? string.concat('"', vm.toString(address(mockVRF)), '"')
            : "null";

        string memory json = string(
            abi.encodePacked(
                '{"chainId":10143,"contracts":{',
                '"mockUsdc":{"proxy":"', vm.toString(address(mockUsdc)), '","implementation":"', vm.toString(address(mockUsdcImplementation)), '"},',
                '"factory":{"proxy":"', vm.toString(address(factory)), '","implementation":null},',
                '"predictionPool":{"proxy":"', vm.toString(address(predictionPool)), '","implementation":null},',
                '"demoRoom":{"proxy":"', vm.toString(demoRoom), '","implementation":null},',
                '"keeper":{"address":"', vm.toString(keeperAddr), '"},',
                '"treasury":{"address":"', vm.toString(treasuryAddr), '"}',
                '},"metadata":{"vrfCoordinator":"', vm.toString(vrfCoordinator), '","mockVrfCoordinator":', mockVrfJson, '}}'
            )
        );

        vm.createDir("./deployments", true);
        vm.writeFile("./deployments/monad_address.json", json);
        console.log("Addresses written to: deployments/monad_address.json");
    }
}
