// SPDX-License-Identifier: UNKNOWN

pragma solidity ^0.8.13;

import {ERC5192} from "ERC5192/ERC5192.sol";
import {Counters} from "openzeppelin-contracts/contracts/utils/Counters.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

import {WithPaperHandler} from "./WithPaperHandler.sol";

contract SBT is ERC5192, WithPaperHandler, Ownable {
    using Counters for Counters.Counter;

    /// @dev The current supply (number of token minted) is handled with a Counter.
    /// See https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Counters.sol
    Counters.Counter private _tokenSupply;

    string private _tokenURI;

    modifier withPaperOrOwnerOnly(address addr) {
        require(
            addr == owner() || checkWithPaperAddress(addr), "SBT: Address is not a withPaper wallet or contract owner."
        );
        _;
    }

    constructor(string memory name_, string memory symbol_) ERC5192(name_, symbol_, true) {}

    /// @dev Returns the total amount of tokens stored by the contract.
    function totalSupply() public view returns (uint256) {
        return _tokenSupply.current();
    }

    function setWithPaperAddress(address addr, bool value) external onlyOwner {
        super._setWithPaperAddress(addr, value);
    }

    /// @notice Mint one NFT from the `to` wallet recipient.
    /// @dev This function is restricted to WithPaper.com addresses.
    /// See https://docs.withpaper.com/reference/custom-contracts
    /// @param to the wallet that will mint the token
    function mint(address to) public withPaperOrOwnerOnly(msg.sender) {
        _tokenSupply.increment();
        _mint(to, _tokenSupply.current());
        emit Locked(_tokenSupply.current());
    }

    function burn(uint256 tokenId) public {
        // NB: No operator allowed when contract is locked
        //     So no need to check them
        require(ownerOf(tokenId) == msg.sender, "SBT: Only owner of token can burn.");
        _burn(tokenId);
    }

    function _baseURI() internal view override returns (string memory) {
        return _tokenURI;
    }

    function setBaseURI(string memory tokenURI_) external onlyOwner {
        _tokenURI = tokenURI_;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireMinted(tokenId);

        string memory baseURI = _baseURI();
        // All tokens are the same ; there is only one valid URI for token metadata
        return bytes(baseURI).length > 0 ? baseURI : "";
    }
}
