// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';

import {ArbitrageToken} from "./Token.sol";

interface IFaucetToken {
    function mint(address to, uint256 amount) external;
}

interface IStakedToken {
    function balanceOf(address addr) external returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external;
    function transfer(address to, uint256 amount) external;
}

contract Arbitrage is Ownable {
    
    /// @notice Contract of faucet token (token 0)
    IFaucetToken public faucetToken;
    /// @notice Amount of faucet tokens distributed when claimed
    uint256 public faucetAmount;

    /// @notice Contract of staked token (token 1)
    IStakedToken public stakedToken;
    /// @notice Minimum amount of time tokens are staked for
    uint256 public stakeLockTime;
    /// @notice Total amount staked
    uint256 public totalStaked;
    /// @notice Total profits
    uint256 public totalProfits;

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
    
    /// @notice Mapping of address and minting status
    mapping(address => bool) public hasMinted;
    /// @notice Mapping of address to stake info
    mapping(address => StakeInfo) public stakeInfos;
    /// @notice Mapping of address to staking status
    mapping(address => bool) public addressInStake;

    /// @notice Enum which represent exchanges
    enum Dex { UNISWAP, SUSHISWAP }
    /// @notice Interface for interacting with Sushiswap
    IUniswapV2Router02 public immutable sushiRouter;
    /// @notice Interface for interacting with Uniswap
    ISwapRouter public immutable uniRouter;

    constructor(
        address _faucetToken,
        uint256 _faucetAmount,
        address _stakedToken,
        uint256 _stakeLockTime,
        address _sushiRouter,
        address _uniRouter
    ) {
        faucetToken = IFaucetToken(_faucetToken);
        faucetAmount = _faucetAmount;
        stakedToken = IStakedToken(_stakedToken);
        stakeLockTime = _stakeLockTime;
        sushiRouter = IUniswapV2Router02(_sushiRouter);
        uniRouter = ISwapRouter(_uniRouter);
    }

    /// @notice Mints and transfers faucet tokens to caller, operation only allowed once per wallet
    /// @dev Requires giving contract "MINTER_ROLE" for FETH after deployment
    function requestTokens() external {
        require(hasMinted[msg.sender] == false, "You have already claimed the faucet.");
        faucetToken.mint(msg.sender, faucetAmount);
        hasMinted[msg.sender] = true;
    }

    /// @notice Transfers staked amount to contract, stores details and emits event
    /// @dev Allows users to stake once only (could replace with maximum value).
    /// @param amount Amount of tokens to be staked.
    function stakeToken(uint256 amount) external {
        require(amount > 0, "Stake amount should be more than zero");
        require(addressInStake[msg.sender] == false, "You have already staked tokens");
        require(stakedToken.balanceOf(msg.sender) >= amount, "Insufficient balance");
       
        stakedToken.transferFrom(msg.sender, address(this), amount);

        totalStaked += amount;
        
        addressInStake[msg.sender] == true;

        stakeInfos[msg.sender] = StakeInfo({
            startTS: block.timestamp,
            endTS: block.timestamp + stakeLockTime,
            amount: amount,
            profit: 0,
            claimed: 0,
            withdrawn: 0
        });
        
        emit Staked(msg.sender, amount);
    }

    /// @notice Transfers amount of staked tokens back to user, updates state variables accordingly and emits event
    /// @param amount Amount of tokens to be withdrawn by user
    function withdrawStake(uint amount) external {
        require(addressInStake[msg.sender] == true, "You don't have any staked tokens.");
        require(block.timestamp > stakeInfos[msg.sender].endTS, "You cannot yet withdraw your staked tokens.");
        require(amount <= stakeInfos[msg.sender].amount - stakeInfos[msg.sender].withdrawn, "You are trying to withdraw more than you have staked.");
        //transfer tokens back to user
        stakedToken.transfer(msg.sender, amount);
        //update the amount withdrawn by the user
        stakeInfos[msg.sender].withdrawn += amount;
        //update total amount available for staking in the contract
        totalStaked -= amount;
        //if all tokens have been withdrawn, update the addressInStake boolean to false
        if(stakeInfos[msg.sender].amount - stakeInfos[msg.sender].withdrawn == 0) {
            addressInStake[msg.sender] == false;
        }

        emit Withdrawn(msg.sender, amount);
    }

    /// @notice Performs arbitrage
    function performArbitrage(Dex _sellAt, address _tokenToSell, address _tokenToBuy, uint256 _amount0In, uint256 _amount0Out, uint256 _amount1In, uint256 _amount1Out) external {
        //Take percentage or all of totalStaked (??)
        //Buy faucet tokens with staked tokens where highest gain
        //Sell faucet token for staked tokens from second pool
        //Record the profits as profits = totalReturned - amountStaked
        //Add to the profits - anyway to avoid a loop here?
    }

    /// @notice Claim profits
    function claimArbitrageProfits() external {
        uint profit = stakeInfos[msg.sender].profit;
        uint claimed = stakeInfos[msg.sender].claimed;
        uint profitToBeClaimed = profit - claimed;
        require(profitToBeClaimed > 0, "You don't have any profits to claim.");
 
        stakedToken.transfer(msg.sender, profitToBeClaimed);
        stakeInfos[msg.sender].claimed += profitToBeClaimed;

        emit Claimed(msg.sender, profitToBeClaimed);
    }

}