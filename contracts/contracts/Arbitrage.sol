// SPDX-License-Identifier: MIT
pragma solidity >= 0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import {ArbitrageToken} from "./Token.sol";

contract Arbitrage is Ownable {

    /// @notice Address of the native token used in arbitrage app
    ArbitrageToken public arbitrageToken;
    /// @notice Amount of tokens given per ETH paid
    uint256 public purchaseRatio;
    
    /// @notice Minimum amount of time tokens are staked for
    uint256 public stakeDuration;
    /// @notice Staking interest rate
    uint256 public interestRate;

    /// @notice Declares staking event with address and amount
    event Staked(address indexed _from, uint256 amount);
    /// @notice Declares event when staking reward is claimed
    event Claimed(address indexed _from, uint256 amount);


    /// @notice Passes when payment token contract is set
    modifier whenArbitrageTokenSet() {
        require (arbitrageToken != ArbitrageToken(address(0)), "Token not set");
        _;
    }

    /// @notice Struct that defines stake information
    struct StakeInfo {
        uint256 startTS;
        uint256 endTS;
        uint256 amount;
        uint256 claimed;
    }
    /// @notice Mapping of address to stake info
    mapping(address => StakeInfo) public stakeInfos;
    /// @notice Mapping of address to staking status
    mapping(address => bool) public addressInStake;

    constructor(
        uint256 _purchaseRatio,
        uint256 _stakeDuration,
        uint256 _interestRate
    ) {
        purchaseRatio = _purchaseRatio;
        stakeDuration = _stakeDuration;
        interestRate = _interestRate;
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

    /// @notice Transfers staked amount to contract, stores detailes and emits event
    /// @dev Allows users to stake once only (could replace with maximum value).
    /// @param amount Amount of tokens to be staked.
    function stakeToken(uint256 amount) external whenArbitrageTokenSet {
        require(amount > 0, "Stake amount should be more than zero");
        require(addressInStake[msg.sender] == false, "You have already staked tokens");
        require(arbitrageToken.balanceOf(msg.sender) >= amount, "Insufficient balance");
       
        arbitrageToken.transferFrom(msg.sender, address(this), amount);
        
        addressInStake[msg.sender] == true;
        
        stakeInfos[msg.sender] = StakeInfo({
            startTS: block.timestamp,
            endTS: block.timestamp + stakeDuration,
            amount: amount,
            claimed: 0
        });

        emit Staked(msg.sender, amount);
    }

    /// @notice Returns staked tokens + interest after staking duration has been reached
    /// @dev Fixed interest and duration, could be replaced with variable interest and duration
    function claimStakingReward() external whenArbitrageTokenSet {
        require(addressInStake[msg.sender] == true, "You don't have any staked tokens.");
        require(stakeInfos[msg.sender].endTS < block.timestamp, "You cannot yet withdraw your staked tokens.");

        uint256 stakeAmount = stakeInfos[msg.sender].amount;
        uint256 totalReward = stakeAmount + stakeAmount * interestRate / 100;

        
        arbitrageToken.transfer(msg.sender, totalReward);
        stakeInfos[msg.sender].claimed = totalReward;
        addressInStake[msg.sender] = false;

        emit Claimed(msg.sender, totalReward);
    }

}