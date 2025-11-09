// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {LoreToken} from "../src/LoreToken.sol";

contract LoreTokenTest is Test {
    LoreToken public token;
    address public owner = address(1);
    address public user = address(2);

    function setUp() public {
        token = new LoreToken(owner);
    }

    function testMint() public {
        vm.prank(owner);
        token.mint(user, 1000);
        assertEq(token.balanceOf(user), 1000);
    }

    function testBatchMint() public {
        address[] memory recipients = new address[](2);
        recipients[0] = user;
        recipients[1] = address(3);
        
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 500;
        amounts[1] = 300;

        vm.prank(owner);
        token.batchMint(recipients, amounts);
        
        assertEq(token.balanceOf(user), 500);
        assertEq(token.balanceOf(address(3)), 300);
    }
}

