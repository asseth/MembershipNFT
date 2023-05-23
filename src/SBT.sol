// SPDX-License-Identifier: UNKNOWN

pragma solidity ^0.8.13;

import {ERC5192} from "ERC5192/ERC5192.sol";
import {Counters} from "openzeppelin-contracts/contracts/utils/Counters.sol";

contract SBT is ERC5192 {
    using Counters for Counters.Counter;

    /// @dev The current supply (number of token minted) is handled with a Counter.
    /// See https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Counters.sol
    Counters.Counter private _tokenSupply;

    constructor(string memory name_, string memory symbol_) ERC5192(name_, symbol_, true) {}

    /// @dev Returns the total amount of tokens stored by the contract.
    function totalSupply() public view returns (uint256) {
        return _tokenSupply.current();
    }

    function mint() public {
        _tokenSupply.increment();
        _mint(msg.sender, _tokenSupply.current());
        emit Locked(_tokenSupply.current());
    }

    function burn(uint256 tokenId) public {
        // NB: No operator allowed when contract is locked
        //     So no need to check them
        require(ownerOf(tokenId) == msg.sender);
        _burn(tokenId);
    }
}
