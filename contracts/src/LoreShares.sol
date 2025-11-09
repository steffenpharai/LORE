// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract LoreShares is ERC1155, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    mapping(uint256 => uint256) public masterStoryId; // tokenId => master NFT tokenId
    mapping(uint256 => address) public storyOwners; // masterStoryId => owner

    constructor(address initialOwner) ERC1155("") Ownable(initialOwner) {}

    function mintShare(
        address to,
        uint256 masterId,
        uint256 amount
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        masterStoryId[tokenId] = masterId;
        _mint(to, tokenId, amount, "");
        
        return tokenId;
    }

    function batchMintShares(
        address[] calldata recipients,
        uint256[] calldata masterIds,
        uint256[] calldata amounts
    ) public onlyOwner {
        require(
            recipients.length == masterIds.length && masterIds.length == amounts.length,
            "Arrays length mismatch"
        );
        
        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            masterStoryId[tokenId] = masterIds[i];
            _mint(recipients[i], tokenId, amounts[i], "");
        }
    }

    function getMasterStoryId(uint256 tokenId) public view returns (uint256) {
        return masterStoryId[tokenId];
    }
}

