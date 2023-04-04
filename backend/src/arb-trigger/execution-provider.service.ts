import {Injectable} from '@nestjs/common';
import {
  ARBITRAGE_CONTRACT_ADDRESS,
  Dex,
  MAX_GAS_COST_IN_ETH,
  PRICE_DIFF_PERCENTAGE,
  TOKEN_LOAN,
  TOKEN_PAIR,
  TOKEN_STAKING, UNISWAP_POOL_FEE_TIER
} from "../config";
import {JSBI} from "@uniswap/sdk";
import {BigNumber, ethers} from "ethers";
import {ContractsProviderService} from "../contracts-provider/contracts-provider.service";
import {IPriceRatio} from "./price-calculation-provider.service";
import {Token} from "@uniswap/sdk-core";
import {IStrategy} from "./choose-strategy-provider.service";
import {ChainProviderService} from "../chain-provider/chain-provider.service";

@Injectable()
export class StrategyExecution {

  constructor(
    private readonly contracts: ContractsProviderService,
  ) {
  }

  async execute(strategy: IStrategy): Promise<IExecution> {
    console.log("Parameters: " + Dex[strategy.sellDex] + ", " + strategy.sellToken.symbol + ", " + strategy.buyToken.symbol + ", " + ethers.utils.formatUnits(strategy.firstTrade0, strategy.sellToken.decimals));
    const tx = await this.contracts.arbitrageContract.performArbitrage(strategy.sellDex, strategy.sellToken.address, strategy.buyToken.address, strategy.firstTrade0);
    const txReceipt = await tx.wait();
    console.log("Arbitrage executed!");
    return {
      txReceipt: txReceipt,
    };
  }
}

export interface IExecution {
  txReceipt: any,
}