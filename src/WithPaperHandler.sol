// SPDX-License-Identifier: CC-BY-SA-4.0

pragma solidity ^0.8.13;

/// @title withpaper.com integration
/// @author Julien Hache
/// @notice This inheritable contract provides utilitary functions to integrate withpaper.com logic in your contract.
/// @dev The integration consists of a mapping of allowed addresses, with a setter and a getter.
abstract contract WithPaperHandler {
    /// @dev The mapping that stores the authorized addresses.
    mapping(address => bool) private _withPaperAddresses;

    /// @dev Restrict a function to the withpaper.com addresses only.
    modifier withPaperOnly(address addr) {
        require(checkWithPaperAddress(addr), "WithPaperHandler: address is not a withPaper wallet.");
        _;
    }

    /// @notice Checks if an address is allowed by this contact.
    /// @param addr the address that will be checked.
    /// @return true if the address is authorized, false otherwise.
    function checkWithPaperAddress(address addr) public view returns (bool) {
        return _withPaperAddresses[addr];
    }

    /// @dev Sets an address as allowed (or not) by this contact.
    /// @param addr the address to be modified.
    /// @param value true if the address is authorized, false otherwise.
    function _setWithPaperAddress(address addr, bool value) internal {
        _withPaperAddresses[addr] = value;
    }
}
