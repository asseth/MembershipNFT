// SPDX-License-Identifier: CC-BY-SA-4.0

pragma solidity ^0.8.13;

import {ERC5192} from "ERC5192/ERC5192.sol";
import {Counters} from "openzeppelin-contracts/contracts/utils/Counters.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

import {WithPaperHandler} from "./WithPaperHandler.sol";

/// @title A non-transferable, non-fungible token implementing ERC5192 and compatible with withpaper.com.
/// @author Julien Hache
/// @notice This contract allows one to mint a Soulbound Token (SBT) through the withpaper.com checkout interface.
/// @dev The withpaper.com integration consists of a mapping of allowed addresses used for minting.
contract SBT is ERC5192, WithPaperHandler, Ownable {
    using Counters for Counters.Counter;

    /// @dev The current supply (number of token minted) is handled with a Counter.
    /// See https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Counters.sol
    Counters.Counter private _tokenSupply;

    /// @dev The token metadata URI is stored in a private variable and allows modification by the contract owner.
    string private _tokenURI;

    /// @dev Restrict a function to the withpaper.com addresses or the owner only.
    modifier withPaperOrOwnerOnly(address addr) {
        require(
            addr == owner() || checkWithPaperAddress(addr), "SBT: Address is not a withPaper wallet or contract owner."
        );
        _;
    }

    /// @dev Initializes the contract.
    /// @param name_ the name of the token collection.
    /// @param symbol_ the symbol of the token collection.
    constructor(string memory name_, string memory symbol_) ERC5192(name_, symbol_, true) {}

    /// @notice Returns the total amount of tokens stored by the contract.
    function totalSupply() public view returns (uint256) {
        return _tokenSupply.current();
    }

    /// @notice Add a wallet in the WithPaper mapping (used for minting).
    function setWithPaperAddress(address addr, bool value) external onlyOwner {
        super._setWithPaperAddress(addr, value);
    }

    /// @notice Mint one token and send it to the `to` wallet recipient.
    /// @dev This function is restricted to WithPaper.com addresses and the contract owner.
    /// See https://docs.withpaper.com/reference/custom-contracts
    /// @param to the wallet that will mint the token
    function mint(address to) public withPaperOrOwnerOnly(msg.sender) {
        _tokenSupply.increment();
        _mint(to, _tokenSupply.current());
        emit Locked(_tokenSupply.current());
    }

    /// @notice 'Burn' a token. The caller must be the owner of the token.
    /// @param tokenId the token ID.
    function burn(uint256 tokenId) public {
        // NB: No operator allowed when contract is locked
        //     So no need to check them
        require(
            ownerOf(tokenId) == msg.sender || msg.sender == owner(),
            "SBT: Only owner of token or contract owner can burn."
        );
        _burn(tokenId);
    }

    /// @dev See {ERC721-_baseURI}.
    function _baseURI() internal view override returns (string memory) {
        return _tokenURI;
    }

    /// @notice Change the token metadata URI.
    /// @dev This function is restricted to the owner of the contract.
    function setBaseURI(string memory tokenURI_) external onlyOwner {
        _tokenURI = tokenURI_;
    }

    /// @dev See {ERC721-tokenURI}.
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireMinted(tokenId);

        string memory baseURI = _baseURI();
        // All tokens are the same ; there is only one valid URI for token metadata
        return bytes(baseURI).length > 0 ? baseURI : "";
    }
}
