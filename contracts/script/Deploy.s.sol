// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {LoreToken} from "../src/LoreToken.sol";
import {LoreStoryMaster} from "../src/LoreStoryMaster.sol";
import {LoreShares} from "../src/LoreShares.sol";
import {ClaimManager} from "../src/ClaimManager.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        address deployer = vm.addr(deployerPrivateKey);
        console.log("Deploying from:", deployer);

        // Deploy LoreToken
        LoreToken token = new LoreToken(deployer);
        console.log("LoreToken deployed at:", address(token));

        // Deploy LoreStoryMaster
        LoreStoryMaster master = new LoreStoryMaster(deployer);
        console.log("LoreStoryMaster deployed at:", address(master));

        // Deploy LoreShares
        LoreShares shares = new LoreShares(deployer);
        console.log("LoreShares deployed at:", address(shares));

        // Deploy ClaimManager
        ClaimManager claimManager = new ClaimManager(deployer, address(token));
        console.log("ClaimManager deployed at:", address(claimManager));

        vm.stopBroadcast();
    }
}

