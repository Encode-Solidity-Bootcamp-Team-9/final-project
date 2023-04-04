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
export class DetermineProfitability {

  constructor(
    private readonly contracts: ContractsProviderService,
    private readonly chain: ChainProviderService
  ) {
  }

  async calculate(strategy: IStrategy): Promise<IProfitability> {

    const maxSellAmount: number = parseFloat(ethers.utils.formatUnits(strategy.maxSellAmount, strategy.sellToken.decimals));
    const calculationSteps = 10;
    const oneStepValue = maxSellAmount / calculationSteps;

    let mostProfit: BigNumber = null;
    let firstTrade0, firstTrade1BN, secondTrade0BN, secondTrade1BN;

    for (let i = 0; i < calculationSteps; i++) {
      const amountWeWantToSell = maxSellAmount - (i * oneStepValue);
      const amountWeWantToSellBN = ethers.utils.parseUnits(amountWeWantToSell.toString(), strategy.sellToken.decimals);

      let token2AmountBN, amountAfterArbitrageBN: BigNumber;
      if (strategy.sellDex === Dex.UNISWAP) {
        token2AmountBN = await this.tradeOnUni(strategy.sellToken.address, strategy.buyToken.address, amountWeWantToSellBN);
        amountAfterArbitrageBN = await this.tradeOnSushi(strategy.buyToken.address, strategy.sellToken.address, token2AmountBN);
      } else {
        token2AmountBN = await this.tradeOnSushi(strategy.sellToken.address, strategy.buyToken.address, amountWeWantToSellBN);
        amountAfterArbitrageBN = await this.tradeOnUni(strategy.buyToken.address, strategy.sellToken.address, token2AmountBN);
      }

      let profit = amountAfterArbitrageBN.sub(amountWeWantToSellBN);
      console.log(i + ": Profit " + ethers.utils.formatUnits(profit, strategy.sellToken.decimals) + " " + strategy.sellToken.symbol + " (Trade amountWeWantToSell: " + amountWeWantToSell + ")");

      if (mostProfit == null || profit.gt(mostProfit)) {
        mostProfit = profit;
        firstTrade0 = amountWeWantToSell;
        firstTrade1BN = token2AmountBN;
        secondTrade0BN = token2AmountBN;
        secondTrade1BN = amountAfterArbitrageBN;
      } else {
        break;  //break once we have a lower profit
      }
    }

    strategy.firstTrade0 = ethers.utils.parseUnits(firstTrade0.toString(), strategy.sellToken.decimals);
    strategy.firstTrade1 = firstTrade1BN;
    strategy.secondTrade0 = secondTrade0BN;
    strategy.secondTrade1 = secondTrade1BN;

    const gasPrice = await this.chain.getProvider().getGasPrice();
    const gasFeesTx = await this.contracts.arbitrageContract.estimateGas.performArbitrage(strategy.buyDex, strategy.sellToken.address, strategy.buyToken.address, strategy.firstTrade0);
    const gasCost = gasFeesTx.mul(gasPrice);

    const profitability = {
      gasCost: gasCost,
      profit: mostProfit,
    };

    console.table({
      "Gas price": ethers.utils.formatUnits(gasPrice, 'ether') + " ETH",
      "Gas fees": ethers.utils.formatUnits(gasFeesTx, 'wei') + " wei",
      "Gas cost": ethers.utils.formatUnits(profitability.gasCost, 'ether') + " ETH",
      "Profit": ethers.utils.formatUnits(profitability.profit, TOKEN_STAKING.decimals) + " " + TOKEN_STAKING.symbol,
      "Trade with amount": firstTrade0 + " " + TOKEN_STAKING.symbol,
    });

    const maxGasCost = ethers.utils.parseUnits(MAX_GAS_COST_IN_ETH, "ether");
    const gasOk = maxGasCost.gt(gasPrice);
    const profitOk = profitability.profit.gt(0);
    console.log("GAS cost: " + ethers.utils.formatUnits(gasCost, 'ether') + " ETH (" + "max: " + ethers.utils.formatUnits(maxGasCost, 'ether') + " ETH)" + (gasOk ? " OK" : "  NOT"));
    console.log("Profit: " + ethers.utils.formatUnits(profitability.profit, TOKEN_STAKING.decimals) + " " + TOKEN_STAKING.symbol + (profitOk ? " OK" : "  NOT"));

    if (!gasOk || !profitOk) {
      console.log("Strategy not profitable, skipping execution");
      return null;
    }

    return profitability;
  }

  private async tradeOnUni(sellToken: string, butToken: string, amount: BigNumber): Promise<BigNumber> {
    return await this.contracts.uniQuoter.callStatic.quoteExactInputSingle(
      sellToken,
      butToken,
      UNISWAP_POOL_FEE_TIER,
      amount.toString(),
      0
    );
  }

  private async tradeOnSushi(sellToken: string, buyToken: string, amount: BigNumber): Promise<BigNumber> {
    return (await this.contracts.sushiRouter.getAmountsOut(amount.toString(), [sellToken, buyToken]))[1];

  }
}

export interface IProfitability {
  gasCost: BigNumber,
  profit: BigNumber,
}

