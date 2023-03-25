// SPDX-License-Identifier: MIT
pragma solidity >= 0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import {ArbitrageToken} from "./Token.sol";

contract Arbitrage is Ownable {

    /// @notice Address of the native token used in arbitrage app
    ArbitrageToken public arbitrageToken;
    /// @notice Amount of tokens given per ETH paid
    uint256 public purchaseRatio;

    constructor(
        uint256 _purchaseRatio
    ) {
        purchaseRatio = _purchaseRatio;
    }

    /// @notice Passes when payment token contract is set
    modifier whenArbitrageTokenSet() {
        require (arbitrageToken != ArbitrageToken(address(0)), "Token not set");
        _;
    }

    /// @notice Function which deploys the ArbitrageToken smart contract
    /// @param tokenName Name of the token used for payment
    /// @param tokenSymbol Symbok of the token used for payment
    /// @dev could set up new access role to not limit to owner
    function createArbitrageToken(string memory tokenName, string memory tokenSymbol) public onlyOwner {
        require(arbitrageToken == ArbitrageToken(address(0)), "Token already set");
        arbitrageToken = new ArbitrageToken(tokenName, tokenSymbol);
    }

    /// @notice Gives tokens based on the amount of ETH sent
    /// @dev This implementation is prone to rounding problems - could replace with price instead of ratio
    /// @dev When implementing, need to call approve() to enable contract.address to mint tokens for users
    function purchaseTokens() external payable whenArbitrageTokenSet {
        arbitrageToken.mint(msg.sender, msg.value * purchaseRatio);
    }

    /// @notice Burns tokens and gives half the equivalent ETH back to user
    /// @param amount Amount of tokens to be returned
    function returnTokens(uint256 amount) external whenArbitrageTokenSet {
        arbitrageToken.burnFrom(msg.sender, amount);
        payable(msg.sender).transfer(amount / (purchaseRatio / 2));
    }


}