// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    
}

interface IUniswapV2Router01 {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

contract MiddleMan is Ownable {

    ISwapRouter public immutable uniswapRouter = ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);
    IUniswapV2Router01 public immutable sushiswapRouter = IUniswapV2Router01(0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506);
    IERC20 public immutable feth = IERC20(0xC97727ba966F6C52580121862dF2771A1Ca0F28a);
    IERC20 public immutable stbl = IERC20(0x9622F58d9745bAfaeABB7712a69DcdBdcF72e188);

    address public profitsRecipient;

    bool public startingBalancesSet = false; 
    uint256 public fethStartingBalance;
    uint256 public stblStartingBalance;

    function setProfitsRecipient(address _to) external onlyOwner() {
        require(_to != address(0));
        profitsRecipient = _to;
    }

    /*
    *   Sets the token starting balances so we can keep track of the profits
    */
    function setStartingBalances() external onlyOwner() {
        require(!startingBalancesSet, "Starting balances are already set");
        fethStartingBalance = feth.balanceOf(address(this));
        stblStartingBalance = stbl.balanceOf(address(this));
        startingBalancesSet = true;
    }

    /*
    *   Withdraws the profits to profitsRecipient
    */
    function withdrawProfits() external onlyOwner() {
        uint256 fethBalance = feth.balanceOf(address(this));
        uint256 stblBalance = stbl.balanceOf(address(this));

        require(fethBalance > fethStartingBalance, "No FETH profits yet");
        require(stblBalance > stblStartingBalance, "No STBL profits yet");

        bool fethSuccess = feth.transfer
        (
            profitsRecipient, 
            fethBalance - fethStartingBalance
        );
        require(fethSuccess, "FETH token transfer failed");

        bool stblSuccess = stbl.transfer
        (
            profitsRecipient, 
            stblBalance - stblStartingBalance
        );
        require(stblSuccess, "STBL token transfer failed");
    }

    function arbitrage (
        uint256 sushiSide,
        uint256 sushiIn,
        uint256 uniSide,
        uint256 uniIn
    ) external onlyOwner() {
        // Will call both swap function
        // 0 means we sell our FETH, so path is FETH -> STBL
        // 1 means we sell our STBL, so path is STBL -> FETH

        swapOnSushi(sushiSide, sushiIn);
        swapOnUni(uniSide, uniIn);

    }

    function swapOnUni(uint256 side, uint amtIn) private {
        // Setting at 0 for simplicity
        uint256 amtOutMin = 0;
        uint160 priceLimit = 0;

        address tknIn;
        address tknOut;

        if (side == 0) {
            tknIn = address(feth);
            tknOut = address(stbl);
            feth.approve(address(uniswapRouter), amtIn);
        } else if (side == 1) {
            tknIn = address(stbl);
            tknOut = address(feth);
            stbl.approve(address(uniswapRouter), amtIn);
        } else {
            revert();
        }

        // Create the params that will be used to execute the swap
        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: tknIn,
                tokenOut: tknOut,
                fee: 3000,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amtIn,
                amountOutMinimum: amtOutMin,
                sqrtPriceLimitX96: priceLimit
            });

        // The call to `exactInputSingle` executes the swap.
        uint256 amountOut = uniswapRouter.exactInputSingle(params);

    }

    function swapOnSushi(uint256 side, uint256 amtIn) private {
        // 0 means we sell our FETH, so path is FETH -> STBL
        // 1 means we sell our STBL, so path is STBL -> FETH
        address[] memory path = new address[](2);
        uint256 amountIn = amtIn;
        uint256 amountOutMin = 1;

        if (side == 0) {
            path[0] = address(feth);
            path[1] = address(stbl);
            feth.approve(address(sushiswapRouter), amountIn);

        } else if (side == 1) {
            path[0] = address(stbl);
            path[1] = address(feth);
            stbl.approve(address(sushiswapRouter), amountIn);

        } else {
            revert();
        }

        // Unix timestamp after which the tx will revert
        uint256 deadline = block.timestamp;

        // Sell
        sushiswapRouter.swapExactTokensForTokens
        (
            amountIn, 
            amountOutMin, 
            path, 
            address(this),
            deadline
        );
        

    }
}