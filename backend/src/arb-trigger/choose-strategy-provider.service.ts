import {Injectable} from '@nestjs/common';
import {
  ARBITRAGE_CONTRACT_ADDRESS,
  Dex,
  PRICE_DIFF_PERCENTAGE,
  SLIPPAGE,
  TOKEN_LOAN,
  TOKEN_PAIR,
  TOKEN_STAKING
} from "../config";
import {JSBI} from "@uniswap/sdk";
import {BigNumber, ethers} from "ethers";
import {ContractsProviderService} from "../contracts-provider/contracts-provider.service";
import {IPriceRatio} from "./price-calculation-provider.service";
import {Token} from "@uniswap/sdk-core";

@Injectable()
export class ChooseStrategy {

  constructor(
    private readonly contracts: ContractsProviderService,
  ) {
  }

  async calculate(uniPoolRatio: IPriceRatio, sushiPoolRatio: IPriceRatio, uniVsSushiDiffPercentage: number): Promise<IStrategy> {

    let sellDex, buyDex;
    let liquidity;

    if (uniVsSushiDiffPercentage > 0) { //if percentage is positive, price on UNISWAP is higher - we will sell there
      sellDex = Dex.UNISWAP;
      buyDex = Dex.SUSHISWAP
      liquidity = uniPoolRatio.liquidityStakingToken;
    } else {
      sellDex = Dex.SUSHISWAP;
      buyDex = Dex.UNISWAP
      liquidity = sushiPoolRatio.liquidityStakingToken;
    }

    let totalStaked : BigNumber = await this.contracts.arbitrageContract.totalStaked();

    //max sell amount is limited by total liquidity in the selling pool. We want to sell max 10% of liquidity.
    let maxSellAmount = parseFloat(ethers.utils.formatUnits(totalStaked, TOKEN_STAKING.decimals))
    const liquidityAmount = parseFloat(ethers.utils.formatUnits(liquidity, TOKEN_STAKING.decimals));
    maxSellAmount = Math.min(maxSellAmount, liquidityAmount / 10);


    const strategy = {
      buyToken: TOKEN_LOAN,
      sellToken: TOKEN_STAKING,
      buyDex: buyDex, //here we have to buy TOKEN_STAKING for TOKEN_LOAN
      sellDex: sellDex, //here we have to sell TOKEN_STAKING for TOKEN_LOAN
      totalStaked: totalStaked,
      maxSellAmount: ethers.utils.parseUnits(maxSellAmount.toString(), TOKEN_STAKING.decimals),
      currentProfit: await this.contracts.arbitrageContract.totalProfits(),
    };

    console.table({
      "Sell token": strategy.sellToken.symbol,
      "Sell at Dex": Dex[strategy.sellDex],
      "Liquidity in sell-to pool": ethers.utils.formatUnits(liquidity, strategy.sellToken.decimals) + " " + strategy.sellToken.symbol,
      "Max sell amount": ethers.utils.formatUnits(strategy.maxSellAmount, strategy.sellToken.decimals),
      "Buy token": strategy.buyToken.symbol,
      "Rebuy at Dex": Dex[strategy.buyDex],
      "Slippage": ((1 - SLIPPAGE) * 100).toFixed(2) + "%",
    });

    if(maxSellAmount <= 0) {
      console.log("Max amount to sell is 0. Can't arbitrage. Contract doesn't have tokens to sell.");
      return null;
    }

    return strategy;
  }


}

export interface IStrategy {
  buyToken: Token,
  sellToken: Token,
  buyDex: Dex,
  sellDex: Dex,
  totalStaked: BigNumber,
  currentProfit: BigNumber,
  maxSellAmount: BigNumber,
  firstTrade0?: BigNumber,
  firstTrade1?: BigNumber,
  secondTrade0?: BigNumber,
  secondTrade1?: BigNumber,
}

