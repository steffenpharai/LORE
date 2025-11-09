// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract LoreStoryMaster is ERC721, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    struct StoryMetadata {
        string uri;
        uint256 lineCount;
        uint256 createdAt;
    }

    mapping(uint256 => StoryMetadata) public stories;

    constructor(address initialOwner) ERC721("Lore Story Master", "LORE-MASTER") Ownable(initialOwner) {}

    function mintStory(address to, string memory uri, uint256 lineCount) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        stories[tokenId] = StoryMetadata({
            uri: uri,
            lineCount: lineCount,
            createdAt: block.timestamp
        });
        
        return tokenId;
    }

    function getStory(uint256 tokenId) public view returns (StoryMetadata memory) {
        return stories[tokenId];
    }
}

