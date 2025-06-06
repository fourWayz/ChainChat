// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CCToken is ERC20 {
    constructor() ERC20("Chainchat Token", "CCT") {
        _mint(msg.sender, 1000000 * 10**decimals()); // Initial supply
    }
}