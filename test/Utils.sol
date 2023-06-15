// SPDX-License-Identifier: UNKNOWN

pragma solidity ^0.8.13;

library Utils {
    function compareStrings(string memory a, string memory b) public pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }
}
