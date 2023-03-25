// SPDX-License-Identifier: MIT
pragma solidity >= 0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MyToken is ERC20, Ownable, ERC20Permit {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    //Add to set max token per user
    //uint256 public constant MAX_MINT_AMOUNT = 10 ether;

    mapping(address => uint256) public minters;

    constructor() ERC20("MyToken", "MTK") ERC20Permit("MyToken") {}

    function mint(address to, uint256 amount) public onlyOwner {
        //Add to impose max token per user
        //require(minters[to] + amount <= MAX_MINT_AMOUNT, string.concat("You cannot mint more than ", Strings.toString(MAX_MINT_AMOUNT / 1 ether), " MTK"));
        _mint(to, amount);
        minters[to] += amount;
    }
}
