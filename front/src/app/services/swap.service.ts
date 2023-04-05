import { Injectable } from '@angular/core';
import { ethers } from 'ethers';

@Injectable({
  providedIn: 'root',
})
export class SwapService {
  private sushiRouter: ethers.Contract | undefined;

  private loadContracts() {
    // this.sushiRouter = new ethers.Contract(
    //   SUSHISWAP_ROUTER_ADDRESS,
    //   IUniswapV2Router02.abi,
    //   this.provider
    // );
  }

  constructor() {}

  public async swapFETHForNASUsingSushiswap(amount: string) {}

  public async swapFETHForNASUsingUniswap(amount: string) {}
}
