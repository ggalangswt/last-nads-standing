// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";

/// @title MockVRFCoordinator
/// @notice Drop-in replacement for Chainlink VRF coordinator on chains where
///         Chainlink VRF is not yet available (e.g. Monad testnet).
/// @dev    Two-step async pattern:
///           1. GameRoom.executeRound() calls requestRandomWords() → stores pending request
///           2. Keeper calls fulfillRequest(requestId) → triggers fulfillRandomWords callback
///         This mimics the real VRF async flow without needing a live oracle.
///         DO NOT use in production — randomness is predictable on-chain.
contract MockVRFCoordinator {
    uint256 private s_nextRequestId = 1;

    struct PendingRequest {
        address consumer;
        uint32  numWords;
    }

    mapping(uint256 => PendingRequest) public pendingRequests;

    event RandomWordsRequested(uint256 indexed requestId, address indexed consumer);
    event RandomWordsFulfilled(uint256 indexed requestId, uint256[] randomWords);

    /// @notice Called by the consumer contract (GameRoom.executeRound)
    function requestRandomWords(
        VRFV2PlusClient.RandomWordsRequest calldata req
    ) external returns (uint256 requestId) {
        requestId = s_nextRequestId++;
        pendingRequests[requestId] = PendingRequest({
            consumer: msg.sender,
            numWords: req.numWords
        });
        emit RandomWordsRequested(requestId, msg.sender);
    }

    /// @notice Called by the keeper to simulate oracle fulfillment
    /// @param requestId The request ID returned from requestRandomWords
    function fulfillRequest(uint256 requestId) external {
        PendingRequest memory req = pendingRequests[requestId];
        require(req.consumer != address(0), "MockVRF: no pending request");

        delete pendingRequests[requestId];

        uint256[] memory randomWords = new uint256[](req.numWords);
        for (uint32 i = 0; i < req.numWords; i++) {
            randomWords[i] = uint256(
                keccak256(abi.encodePacked(block.timestamp, block.prevrandao, requestId, i))
            );
        }

        emit RandomWordsFulfilled(requestId, randomWords);

        // Calls the consumer's rawFulfillRandomWords — msg.sender here is this
        // coordinator, which matches s_vrfCoordinator set in the consumer.
        VRFConsumerBaseV2Plus(req.consumer).rawFulfillRandomWords(requestId, randomWords);
    }
}
