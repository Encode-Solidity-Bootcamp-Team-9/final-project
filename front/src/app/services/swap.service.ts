import { Injectable } from '@angular/core';
import { BigNumber, ethers } from 'ethers';
import { Web3Service } from './web3.service';
import { environment } from 'src/environments/environment';
import { FeeAmount } from '@uniswap/v3-sdk';

import * as IUniswapV2Router02 from '@uniswap/v2-periphery/build/IUniswapV2Router02.json';
import * as Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json';
import * as UniRouter from '@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json';

const {
  SUSHISWAP_ROUTER_ADDRESS,
  UNISWAP_QUOTER_ADDRESS,
  UNISWAP_ROUTER_ADDRESS,
} = environment;

@Injectable({
  providedIn: 'root',
})
export class SwapService {
  private sushiRouter: ethers.Contract;
  private uniQuoter: ethers.Contract;
  private uniRouter: ethers.Contract;

  public swapOnSushi: boolean = true;

  constructor(private web3: Web3Service) {
    const sushiRouter = IUniswapV2Router02;
    this.sushiRouter = new ethers.Contract(
      SUSHISWAP_ROUTER_ADDRESS,
      sushiRouter.abi,
      this.web3.provider
    );

    const uniQuoter = Quoter;
    this.uniQuoter = new ethers.Contract(
      UNISWAP_QUOTER_ADDRESS,
      uniQuoter.abi,
      this.web3.provider
    );

    const uniRouter = UniRouter;
    this.uniRouter = new ethers.Contract(
      UNISWAP_ROUTER_ADDRESS,
      uniRouter.abi,
      this.web3.provider
    );
  }

  public async getExpectedNAS(amount: string): Promise<string> {
    const sushiOffer: BigNumber = (
      await this.sushiRouter['getAmountsOut'](amount, [
        this.web3.FETHContract.address,
        this.web3.NASContract.address,
      ])
    )[1];

    const uniOffer: BigNumber = await this.uniQuoter.callStatic[
      'quoteExactInputSingle'
    ](
      this.web3.FETHContract.address,
      this.web3.NASContract.address,
      FeeAmount.MEDIUM,
      amount,
      0
    );

    const sushiOut = ethers.utils.formatEther(sushiOffer);
    const uniOut = ethers.utils.formatEther(uniOffer);

    if (sushiOffer.gt(uniOffer)) {
      this.swapOnSushi = false;
      return uniOut;
    } else {
      this.swapOnSushi = true;
      return sushiOut;
    }
  }

  public async swapFETHForNAS(amount: string) {
    console.log('approving');
    await this.approveIfNecessary(amount);
    console.log('finished approving');
    if (this.swapOnSushi) {
      await this.swapFETHForNASUsingSushiswap(amount);
    } else {
      await this.swapFETHForNASUsingUniswap(amount);
    }
  }

  private async swapFETHForNASUsingSushiswap(amount: string) {
    console.log('swapping on sushi');
    const block = await this.web3.provider!.getBlock('latest');
    const swaptx = await this.sushiRouter
      .connect(this.web3.signer!)
      ['swapExactTokensForTokens'](
        amount,
        0,
        [this.web3.FETHContract.address, this.web3.NASContract.address],
        this.web3.address,
        block.timestamp + 60 * 1000
      );
    await swaptx.await();
  }

  private async swapFETHForNASUsingUniswap(amount: string) {
    console.log('swapping on uni');
    const block = await this.web3.provider!.getBlock('latest');
    const params = {
      tokenIn: this.web3.FETHContract.address,
      tokenOut: this.web3.NASContract.address,
      fee: 3000,
      recipient: this.web3.address,
      deadline: block.timestamp + 60 * 1000,
      amountIn: amount,
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    };
    const tx = await this.uniRouter
      .connect(this.web3.signer!)
      ['exactInputSingle'](params);
    await tx.wait();
  }

  private async approveIfNecessary(amount: string) {
    if (!this.web3.address) return;
    const router = this.swapOnSushi
      ? SUSHISWAP_ROUTER_ADDRESS
      : UNISWAP_ROUTER_ADDRESS;
    const fethAllowance: BigNumber = await this.web3.FETHContract['allowance'](
      this.web3.address,
      router
    );

    if (fethAllowance.lte(amount)) {
      await this.approve(amount);
    }
  }

  private async approve(amount: string) {
    const router = this.swapOnSushi
      ? SUSHISWAP_ROUTER_ADDRESS
      : UNISWAP_ROUTER_ADDRESS;
    const approveFeth = await this.web3.FETHContract.connect(this.web3.signer!)[
      'approve'
    ](router, amount, { gasLimit: 80000 });
    console.log(approveFeth);
    await approveFeth.wait();
  }
}
