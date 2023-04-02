import {Injectable} from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import {ChainProviderService} from "./chain-provider.service";
import * as IUniswapV3Factory
  from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json'
import * as IUniswapV3Pool from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import * as ISushiswapV2Factory from "@uniswap/v2-core/build/IUniswapV2Factory.json"
import * as ISushiswapV2Pair from "@uniswap/v2-core/build/IUniswapV2Pair.json"


import {BigNumber, Contract, ethers} from "ethers";
import {computePoolAddress} from "@uniswap/v3-sdk";
import {Dex, SUSHISWAP_FACTORY_ADDRESS, TOKEN_PAIR, UNISWAP_FACTORY_ADDRESS, UNISWAP_POOL_FEE_TIER} from "./config";
import {JSBI} from "@uniswap/sdk";
import e from "express";

@Injectable()
export class ArbTriggerService {

  private uniPool: Contract;
  private uniFactory: Contract

  private sushiPool: Contract;
  private sushiFactory: Contract;

  private arbitrageInProgress: boolean = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly chainProviderService: ChainProviderService,
  ) {

    this.uniFactory = new ethers.Contract(
      UNISWAP_FACTORY_ADDRESS,
      IUniswapV3Factory.abi,
      this.chainProviderService.getProvider(),
    );

    this.sushiFactory = new ethers.Contract(
      SUSHISWAP_FACTORY_ADDRESS,
      ISushiswapV2Factory.abi,
      this.chainProviderService.getProvider(),
    );

    const uniPoolAddress = computePoolAddress({
      factoryAddress: UNISWAP_FACTORY_ADDRESS,
      tokenA: TOKEN_PAIR[0],
      tokenB: TOKEN_PAIR[1],
      fee: UNISWAP_POOL_FEE_TIER,
    })

    console.log(`Uni pool address (Token 1: ${TOKEN_PAIR[0].symbol} Token 2: ${TOKEN_PAIR[1].symbol} fee: ${UNISWAP_POOL_FEE_TIER}): ${uniPoolAddress}`);

    this.uniPool = new ethers.Contract(
      uniPoolAddress,
      IUniswapV3Pool.abi,
      this.chainProviderService.getProvider(),
    );

    this.sushiFactory.getPair(TOKEN_PAIR[0].address, TOKEN_PAIR[1].address).then((sushiPoolAddress) => {
      console.log(`Sushi pool address (Token 1: ${TOKEN_PAIR[0].symbol} Token 2: ${TOKEN_PAIR[1].symbol}): ${sushiPoolAddress}`);
      this.sushiPool = new ethers.Contract(
        sushiPoolAddress,
        ISushiswapV2Pair.abi,
        this.chainProviderService.getProvider(),
      );

      this.initializeEventListeners();
    });
  }

  private async initializeEventListeners() {

    this.uniPool.on('Swap', async () => {
      console.log("Swap event on Uni pool")
      await this.arbitrage(Dex.UNISWAP);
    });

    this.sushiPool.on('Swap', async () => {
      console.log("Swap event on Sushi pool")
      await this.arbitrage(Dex.SUSHISWAP);
    });
  }

  public async arbitrage(dexThatChanged: Dex) {
    if (this.arbitrageInProgress) {
      return;
    }

    try {
      this.arbitrageInProgress = true;

      console.log("Arbitrage triggered because of swap on " + Dex[dexThatChanged] + "\n");
      console.log("Checking prices...")
      const {uniPoolRatio, sushiPoolRatio} = await this.checkPrices();

      console.log("Checking diff...")
      const {uniVsSushiDiffPercentage, isDiffOk} = this.priceDiff(uniPoolRatio, sushiPoolRatio);

      if (!isDiffOk) {
        return;
      }

      console.log("\n");

      console.log("Choosing arbitrage strategy...");
      const strategy = await this.chooseStrategy(uniVsSushiDiffPercentage)

      if (!strategy) {
        return;
      }

      console.log("\n");

      console.log("Calculating strategy profitability...");
      const profitability = await this.calculateProfitability(strategy)

      if (!profitability) {
        return;
      }

      console.log("\n");

      console.log("Executing strategy...");
      const execution = await this.executeStrategy(strategy)

      console.log("\n");

      console.log("Checking results...");
      await this.checkResults(strategy, execution)

    } catch (e) {
      console.error(e);
    } finally {
      this.arbitrageInProgress = false;
    }
  }

  private async checkPrices() {
    const uniPoolRatio: PriceRatio = await this.getUniPoolRatio();
    console.log("[UNI] " + TOKEN_PAIR[0].symbol + "/" + TOKEN_PAIR[1].symbol + " : " + uniPoolRatio.ratio);

    const sushiPoolRatio: PriceRatio = await this.getSushiPoolRatio();
    console.log("[SUSHI] " + TOKEN_PAIR[0].symbol + "/" + TOKEN_PAIR[1].symbol + " : " + sushiPoolRatio.ratio);

    console.log("\n");
    return {uniPoolRatio, sushiPoolRatio};
  }

  private priceDiff(uniPoolRatio: PriceRatio, sushiPoolRatio: PriceRatio) {
    const uniVsSushiDiffPercentage = (((uniPoolRatio.ratio - sushiPoolRatio.ratio) / sushiPoolRatio.ratio) * 100);

    const minDiffPercentage = this.configService.get("PRICE_DIFF_PERCENTAGE");
    const isDiffOk = Math.abs(uniVsSushiDiffPercentage) > minDiffPercentage;
    console.log("UNI/SUSHI diff: " + uniVsSushiDiffPercentage.toFixed(2) + "% (min: " + minDiffPercentage.toFixed(2) + "%)" + (isDiffOk ? " OK" : " NOT"));
    return {uniVsSushiDiffPercentage, isDiffOk};
  }

  private async getUniPoolRatio(): Promise<PriceRatio> {
    const [slot0] =
      await Promise.all([
        this.uniPool.slot0(),
      ]);

    const sqrtPriceX96 = slot0[0];

    return this.getPriceRatioUni({
      SqrtX96: sqrtPriceX96,
      Decimal0: TOKEN_PAIR[0].decimals,
      Decimal1: TOKEN_PAIR[1].decimals,
    });
  }

  private getPriceRatioUni(PoolInfo): PriceRatio {
    let sqrtPriceX96: any = PoolInfo.SqrtX96;
    let Decimal0: any = PoolInfo.Decimal0
    let Decimal1: any = PoolInfo.Decimal1;

    // @ts-ignore
    let buyOneOfToken0 = (sqrtPriceX96 * sqrtPriceX96 * (10 ** Decimal0) / (10 ** Decimal1) / (JSBI.BigInt(2) ** (JSBI.BigInt(192))).toFixed(Decimal1));

    return {
      ratio: buyOneOfToken0
    }
  }

  private async getSushiPoolRatio(): Promise<PriceRatio> {
    let [reserveToken0, reserveToken1] = await this.sushiPool.getReserves();

    let buyOneOfToken0 = (reserveToken1 / reserveToken0) / (10 ** (TOKEN_PAIR[1].decimals - TOKEN_PAIR[0].decimals))

    return {
      ratio: buyOneOfToken0
    }

  }

  private async chooseStrategy(uniVsSushiDiffPercentage: number): Promise<Strategy> {
    const strategy = {
      buyToken: TOKEN_PAIR[0].symbol,
      sellToken: TOKEN_PAIR[1].symbol,
      buyDex: Dex[Dex.UNISWAP],
      sellDex: Dex[Dex.SUSHISWAP],
      buyAmount: "200",
      sellAmount: "200",
    };

    console.table(strategy);
    return strategy;
  }

  private async calculateProfitability(strategy: Strategy): Promise<Profitability> {
    const profitability = {
      gasCost: "0.04",
      fees: "0.01",
      slippage: "0.01",
      token0Profit: "300",
      token1Profit: "0",
    };

    console.table(profitability);
    return profitability;
  }

  private async executeStrategy(strategy: Strategy): Promise<Execution> {
    return {};
  }

  private async checkResults(strategy: Strategy, execution: Execution) {
    const results = {
      token0PrevAmount: "100",
      token1PrevAmount: "230",
      token0NewAmount: "130",
      token1NewAmount: "230",
    }
    console.table(results);
    return;
  }
}

interface PriceRatio {
  ratio: number,
}

interface Strategy {
  buyToken: string,
  sellToken: string,
  buyDex: string,
  sellDex: string,
  buyAmount: string,
  sellAmount: string,
}

interface Execution {

}

interface Profitability {
  gasCost: string,
  fees: string,
  slippage: string,

  token0Profit: string,
  token1Profit: string,
}
