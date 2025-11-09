// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./LoreToken.sol";

contract ClaimManager is Ownable {
    LoreToken public loreToken;
    
    mapping(bytes32 => bool) public claimedRoots;
    mapping(address => mapping(bytes32 => bool)) public claimed;

    event Claimed(address indexed user, uint256 amount, bytes32 merkleRoot);

    constructor(address initialOwner, address tokenAddress) Ownable(initialOwner) {
        loreToken = LoreToken(tokenAddress);
    }

    function claim(
        address user,
        uint256 amount,
        bytes32 merkleRoot,
        bytes32[] calldata merkleProof
    ) public {
        require(!claimedRoots[merkleRoot], "Root already used");
        require(!claimed[user][merkleRoot], "Already claimed for this root");

        bytes32 leaf = keccak256(abi.encodePacked(user, amount));
        require(
            MerkleProof.verify(merkleProof, merkleRoot, leaf),
            "Invalid merkle proof"
        );

        claimed[user][merkleRoot] = true;
        claimedRoots[merkleRoot] = true;

        loreToken.mint(user, amount);

        emit Claimed(user, amount, merkleRoot);
    }

    function batchClaim(
        address[] calldata users,
        uint256[] calldata amounts,
        bytes32[] calldata merkleRoots,
        bytes32[][] calldata merkleProofs
    ) public {
        require(
            users.length == amounts.length &&
            amounts.length == merkleRoots.length &&
            merkleRoots.length == merkleProofs.length,
            "Arrays length mismatch"
        );

        for (uint256 i = 0; i < users.length; i++) {
            if (!claimed[users[i]][merkleRoots[i]] && !claimedRoots[merkleRoots[i]]) {
                bytes32 leaf = keccak256(abi.encodePacked(users[i], amounts[i]));
                if (MerkleProof.verify(merkleProofs[i], merkleRoots[i], leaf)) {
                    claimed[users[i]][merkleRoots[i]] = true;
                    claimedRoots[merkleRoots[i]] = true;
                    loreToken.mint(users[i], amounts[i]);
                    emit Claimed(users[i], amounts[i], merkleRoots[i]);
                }
            }
        }
    }
}

