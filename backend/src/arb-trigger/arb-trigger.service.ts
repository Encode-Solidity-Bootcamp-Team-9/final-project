import {Injectable} from '@nestjs/common';
import {ConfigService} from "@nestjs/config";

import {BigNumber, Contract, ethers} from "ethers";
import {
  ARBITRAGE_CONTRACT_ADDRESS,
  Dex,
  MAX_GAS_COST_IN_ETH,
  TOKEN_LOAN,
  TOKEN_STAKING,
  UNISWAP_POOL_FEE_TIER
} from "../config";
import {Token} from "@uniswap/sdk-core";
import {ChainProviderService} from "../chain-provider/chain-provider.service";
import {ContractsProviderService} from "../contracts-provider/contracts-provider.service";
import {PriceCalculation, IPriceRatio} from "./price-calculation-provider.service";
import {ChooseStrategy, IStrategy} from "./choose-strategy-provider.service";
import {IProfitability, DetermineProfitability} from "./profitability-provider.service";
import {IExecution, StrategyExecution} from "./execution-provider.service";
import {Results} from "./results-provider.service";

@Injectable()
export class ArbTriggerService {
  private arbitrageInProgress: boolean = false;
  private sushiPool: Contract;

  constructor(
    private readonly config: ConfigService,
    private readonly chain: ChainProviderService,
    private readonly contracts: ContractsProviderService,
    private readonly priceCalculation: PriceCalculation,
    private readonly chooseStrategy: ChooseStrategy,
    private readonly determineProfitability: DetermineProfitability,
    private readonly strategyExecution: StrategyExecution,
    private readonly results: Results
  ) {
    this.initializeEventListeners();
  }

  /* Event listeners for listening on SWAP events on defined pools */
  private async initializeEventListeners() {

    this.sushiPool = await this.contracts.getSushiPool();

    this.contracts.uniPool.on('Swap', async () => {
      console.log("Swap event on Uni pool")
      await this.arbitrage(Dex.UNISWAP);
    });

    this.sushiPool.on('Swap', async () => {
      console.log("Swap event on Sushi pool")
      await this.arbitrage(Dex.SUSHISWAP);
    });
  }

  /* Main arbitrage process, constructed from following steps:
     * - check prices
     * - check price difference
     * - choose arbitrage strategy based on price difference
     * - calculate profitability of arbitrage strategy
     * - execute arbitrage strategy
     * - check if arbitrage was successful*/

  public async arbitrage(dexThatChanged) {

    //if arbitrage is already in progress, skip the execution
    if (this.arbitrageInProgress) {
      return;
    }

    try {
      this.arbitrageInProgress = true;

      console.log("Arbitrage triggered because of swap on " + Dex[dexThatChanged] + "\n");

      console.log("Checking prices...")
      const {uniPoolRatio, sushiPoolRatio} = await this.priceCalculation.checkPrices();

      console.log("Checking diff...")
      const {uniVsSushiDiffPercentage, isDiffOk} = this.priceCalculation.priceDiff(uniPoolRatio, sushiPoolRatio);

      if (!isDiffOk) {
        return;
      }

      console.log("\n");

      console.log("Choosing arbitrage strategy...");
      const strategy = await this.chooseStrategy.calculate(uniPoolRatio, sushiPoolRatio, uniVsSushiDiffPercentage)

      if (!strategy) {
        return;
      }

      console.log("\n");

      console.log("Calculating strategy profitability...");
      const profitability = await this.determineProfitability.calculate(strategy)

      if (!profitability) {
        return;
      }

      console.log("\n");

      console.log("Executing strategy...");
      const execution = await this.strategyExecution.execute(strategy)

      console.log("\n");

      console.log("Checking results...");
      await this.results.check(strategy, execution, profitability)

    } catch (e) {
      console.error(e);
    } finally {
      this.arbitrageInProgress = false;
      console.log("\n##############################\n")
    }
  }


}







