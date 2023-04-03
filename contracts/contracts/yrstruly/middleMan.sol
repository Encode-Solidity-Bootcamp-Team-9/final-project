// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external;
    function transfer(address to, uint256 amount) external;
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

/*     address public feth = 0xC97727ba966F6C52580121862dF2771A1Ca0F28a;
    address public stbl = 0x9622F58d9745bAfaeABB7712a69DcdBdcF72e188; */

    IUniswapV2Router01 public immutable sushiswapRouter = IUniswapV2Router01(0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506);
    IERC20 public immutable feth = IERC20(0xC97727ba966F6C52580121862dF2771A1Ca0F28a);
    IERC20 public immutable stbl = IERC20(0x9622F58d9745bAfaeABB7712a69DcdBdcF72e188);

    address public recipient;

    function SwapOnSushi(uint256 side) external onlyOwner() {

        // Path to execute the trade
        // 0 means we sell our FETH, so path is FETH -> STBL
        // 1 means we sell our STBL, so path is STBL -> FETH
        address[] memory path = new address[](2);
        uint256 amountIn;
        uint256 amountOutMin;

        if (side == 0) {
            path[0] = address(feth);
            path[1] = address(stbl);
            feth.approve(address(sushiswapRouter), 1000000000000000);
            amountIn = 1000000000000000;
            amountOutMin = 1;

        } else if (side == 1) {
            path[0] = address(stbl);
            path[1] = address(feth);
            stbl.approve(address(sushiswapRouter), 1000000000000000);
            amountIn = 1000000000000000;
            amountOutMin = 1;

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