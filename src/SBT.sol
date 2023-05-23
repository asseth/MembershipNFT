// SPDX-License-Identifier: UNKNOWN

pragma solidity ^0.8.13;

import {ERC5192} from "ERC5192/ERC5192.sol";

contract SBT is ERC5192 {
    constructor(string memory name_, string memory symbol_) ERC5192(name_, symbol_, true) {}
}
