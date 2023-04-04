import {Injectable} from '@nestjs/common';
import {PRICE_DIFF_PERCENTAGE, TOKEN_LOAN, TOKEN_PAIR, TOKEN_STAKING} from "../config";
import {JSBI} from "@uniswap/sdk";
import {BigNumber} from "ethers";
import {ContractsProviderService} from "../contracts-provider/contracts-provider.service";

@Injectable()
export class PriceCalculation {

  constructor(
    private readonly contracts: ContractsProviderService,
  ) {
  }

  async checkPrices() {
    const uniPoolRatio: PriceRatio = await this.getUniPoolRatio();
    console.log("[UNI] " + TOKEN_STAKING.symbol + "/" + TOKEN_LOAN.symbol + " : " + uniPoolRatio.ratio);

    const sushiPoolRatio: PriceRatio = await this.getSushiPoolRatio();
    console.log("[SUSHI] " + TOKEN_STAKING.symbol + "/" + TOKEN_LOAN.symbol + " : " + sushiPoolRatio.ratio);

    console.log("\n");
    return {uniPoolRatio, sushiPoolRatio};
  }

  priceDiff(uniPoolRatio: PriceRatio, sushiPoolRatio: PriceRatio) {
    const uniVsSushiDiffPercentage = (((uniPoolRatio.ratio - sushiPoolRatio.ratio) / sushiPoolRatio.ratio) * 100);

    const minDiffPercentage = PRICE_DIFF_PERCENTAGE;
    const isDiffOk = Math.abs(uniVsSushiDiffPercentage) > minDiffPercentage;
    console.log("UNI/SUSHI diff: " + uniVsSushiDiffPercentage.toFixed(2) + "% (min: " + minDiffPercentage.toFixed(2) + "%)" + (isDiffOk ? " OK" : " NOT"));
    return {uniVsSushiDiffPercentage, isDiffOk};
  }

  private async getUniPoolRatio(): Promise<PriceRatio> {
    const [slot0] =
      await Promise.all([
        this.contracts.uniPool.slot0(),
      ]);

    const sqrtPriceX96 = slot0[0];

    return await this.getPriceRatioUni({
      SqrtX96: sqrtPriceX96,
      Decimal0: TOKEN_PAIR[0].decimals,
      Decimal1: TOKEN_PAIR[1].decimals,
    });
  }

  private async getPriceRatioUni(PoolInfo): Promise<PriceRatio> {
    let sqrtPriceX96: any = PoolInfo.SqrtX96;
    let Decimal0: any = PoolInfo.Decimal0
    let Decimal1: any = PoolInfo.Decimal1;

    // @ts-ignore
    let buyOneOfToken0 = (sqrtPriceX96 * sqrtPriceX96 * (10 ** Decimal0) / (10 ** Decimal1) / (JSBI.BigInt(2) ** (JSBI.BigInt(192))).toFixed(Decimal1));

    let liquidityStakingToken = await this.contracts.stakeToken.balanceOf(this.contracts.uniPool.address);
    let liquidityLoanToken = await this.contracts.loanToken.balanceOf(this.contracts.uniPool.address);

    //always return price ratio for pair TOKEN_STAKING/TOKEN_LOAN !
    if (BigInt(TOKEN_STAKING.address) > BigInt(TOKEN_LOAN.address)) {
      buyOneOfToken0 = 1 / buyOneOfToken0;
    }

    return {
      ratio: buyOneOfToken0,
      liquidityStakingToken: liquidityStakingToken,
      liquidityLoanToken: liquidityLoanToken
    }
  }

  private async getSushiPoolRatio(): Promise<PriceRatio> {
    const sushiPool = await this.contracts.getSushiPool()
    let [reserveToken0, reserveToken1] = await sushiPool.getReserves();

    let buyOneOfToken0 = (reserveToken1 / reserveToken0) / (10 ** (TOKEN_PAIR[1].decimals - TOKEN_PAIR[0].decimals))

    //always return price ratio for pair TOKEN_STAKING/TOKEN_LOAN !
    if (BigInt(TOKEN_STAKING.address) > BigInt(TOKEN_LOAN.address)) {
      buyOneOfToken0 = 1 / buyOneOfToken0;
      let tmp = reserveToken0;
      reserveToken0 = reserveToken1;
      reserveToken1 = tmp;
    }

    return {
      ratio: buyOneOfToken0,
      liquidityStakingToken: reserveToken0,
      liquidityLoanToken: reserveToken1
    }

  }

}

export interface PriceRatio {
  ratio: number,
  liquidityStakingToken: BigNumber,
  liquidityLoanToken: BigNumber,
}
