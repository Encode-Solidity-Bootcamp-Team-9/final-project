// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import {ArbitrageToken} from "./Token.sol";

interface IFaucetToken {
    function mint(address to, uint256 amount) external;
}

contract Arbitrage is Ownable {
    
    /// @notice Contract of faucet token
    IFaucetToken public faucetToken;
    /// @notice Amount of faucet tokens distributed when claimed
    uint256 public faucetAmount;
    /// @notice Amount of time required between two claims
    uint256 public faucetLockTime;

    /// @notice Minimum amount of time tokens are staked for
    uint256 public stakeDuration;

    /// @notice Declares staking event with address and amount
    event Staked(address indexed _from, uint256 amount);
    /// @notice Declares event when staking profit is claimed
    event Claimed(address indexed _from, uint256 amount);
    /// @notice Declares event when stake is withdrawn
    event Withdrawn(address indexed _from, uint256 amount);

    /// @notice Struct that defines stake information
    struct StakeInfo {
        uint256 startTS;
        uint256 endTS;
        uint256 amount;
        uint256 profit;
        uint256 claimed;
        uint256 withdrawn;
    }
    
    /// @notice Mapping of address and faucet lock time
    mapping(address => uint) public lockTime;
    /// @notice Mapping of address to stake info
    mapping(address => StakeInfo) public stakeInfos;
    /// @notice Mapping of address to staking status
    mapping(address => bool) public addressInStake;

    constructor(
        address _faucetToken,
        uint256 _faucetAmount,
        uint256 _faucetLockTime,
        uint256 _stakeLockTime
    ) {
        faucetToken = IFaucetToken(_faucetToken);
        faucetAmount = _faucetAmount;
        faucetLockTime = _faucetLockTime;
        stakeLockTime = _stakeLockTime;
    }

    /// @notice Mints and transfers faucet tokens to caller, and resets time lock
    /// @dev Requires giving contract "MINTER_ROLE" after deployment
    function requestTokens() external {
        require(block.timestamp > lockTime[msg.sender], "Faucet lock time has not expired. Please try again later.");
        tokenContract.mint(msg.sender, faucetAmount);
        lockTime[msg.sender] = block.timestamp + faucetLockTime;
    }

    /// @notice Transfers staked amount to contract, stores details and emits event
    /// @dev Allows users to stake once only (could replace with maximum value).
    /// @param amount Amount of tokens to be staked.
    function stakeToken(uint256 amount) external {
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
    function claimStakingReward() external {
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