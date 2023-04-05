import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { Web3Service } from './web3.service';
import { environment } from 'src/environments/environment';

import * as IUniswapV2Router02 from '@uniswap/v2-periphery/build/IUniswapV2Router02.json';
import * as Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json';

const { SUSHISWAP_ROUTER_ADDRESS, UNISWAP_QUOTER_ADDRESS } = environment;

@Injectable({
  providedIn: 'root',
})
export class SwapService {
  private sushiRouter: ethers.Contract;
  private uniQuoter: ethers.Contract;

  constructor(private web3: Web3Service) {
    this.sushiRouter = new ethers.Contract(
      SUSHISWAP_ROUTER_ADDRESS,
      IUniswapV2Router02.abi,
      this.web3.provider
    );

    this.uniQuoter = new ethers.Contract(
      UNISWAP_QUOTER_ADDRESS,
      Quoter.abi,
      this.web3.provider
    );
  }

  public async getExpectedNAS(
    amount: string,
    sushi: boolean = true
  ): Promise<string> {
    return '';
  }

  public async swapFETHForNASUsingSushiswap(amount: string) {}

  public async swapFETHForNASUsingUniswap(amount: string) {}
}
