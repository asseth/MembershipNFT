// SPDX-License-Identifier: UNKNOWN

pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {ERC5192} from "ERC5192/ERC5192.sol";

import {Utils} from "./Utils.sol";
import {SBT} from "../src/SBT.sol";

contract SBTTest is Test {
    SBT public token;

    address public owner;
    address public receiver1;
    address public receiver2;
    address public withPaperMinter;

    function setUp() public {
        token = new SBT("SBT Test", "TEST");
        owner = address(this);
        receiver1 = makeAddr("receiver1");
        receiver2 = makeAddr("receiver2");
        withPaperMinter = makeAddr("withPaperMinter");

        token.setWithPaperAddress(withPaperMinter, true);
    }

    function testMint() external {
        vm.prank(withPaperMinter);
        token.mint(receiver1);
        require(token.balanceOf(receiver1) == 1, "Invalid token balance after mint");
        require(token.ownerOf(1) == receiver1, "Wrong token minted");

        vm.prank(withPaperMinter);
        token.mint(receiver2);
        require(token.balanceOf(receiver2) == 1, "Invalid token balance after mint");
        require(token.ownerOf(2) == receiver2, "Wrong token minted");

        vm.prank(owner);
        token.mint(receiver1);
        require(token.balanceOf(receiver1) == 2, "Invalid token balance after mint");
        require(token.ownerOf(3) == receiver1, "Wrong token minted");

        vm.prank(receiver1);
        vm.expectRevert("SBT: Address is not a withPaper wallet or contract owner.");
        token.mint(receiver1);
    }

    function testBurn() external {
        vm.prank(withPaperMinter);
        token.mint(receiver1);

        vm.prank(receiver1);
        token.burn(1);
        require(token.balanceOf(receiver1) == 0, "Invalid token balance after burn");
    }

    function testTransfer() external {
        vm.prank(receiver1);
        // NB: even with no existing token, transfer should be locked
        vm.expectRevert(ERC5192.ErrLocked.selector);
        token.transferFrom(receiver1, receiver2, 1);
    }

    function testtokenURI() external {
        vm.expectRevert("ERC721: invalid token ID");
        token.tokenURI(1);

        vm.prank(withPaperMinter);
        token.mint(receiver1);

        require(Utils.compareStrings(token.tokenURI(1), ""));
        token.setBaseURI("ipfs://test.json");
        require(Utils.compareStrings(token.tokenURI(1), "ipfs://test.json"));
    }
}
