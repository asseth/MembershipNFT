// SPDX-License-Identifier: UNKNOWN

pragma solidity ^0.8.13;

abstract contract WithPaperHandler {
    mapping(address => bool) private _withPaperAddresses;

    modifier withPaperOnly(address addr) {
        require(checkWithPaperAddress(addr), "WithPaperHandler: address is not a withPaper wallet.");
        _;
    }

    function checkWithPaperAddress(address addr) public view returns (bool) {
        return _withPaperAddresses[addr];
    }

    function _setWithPaperAddress(address addr, bool value) internal {
        _withPaperAddresses[addr] = value;
    }
}
