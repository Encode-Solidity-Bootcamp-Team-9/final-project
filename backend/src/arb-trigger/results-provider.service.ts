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
import {IExecution} from "./execution-provider.service";
import {IProfitability} from "./profitability-provider.service";

@Injectable()
export class Results {

  constructor(
    private readonly contracts: ContractsProviderService,
  ) {
  }

  public async check(strategy: IStrategy, execution: IExecution, profitability: IProfitability): Promise<void> {
    const totalProfits = await this.contracts.arbitrageContract.totalProfits();

    console.table({
      "Tx hash": execution.txReceipt.transactionHash,
      "Gas used": ethers.utils.formatUnits(execution.txReceipt.gasUsed, 'wei') + " wei",
      "Effective gas price": ethers.utils.formatUnits(execution.txReceipt.effectiveGasPrice, 'ether') + " ETH",
      "Gas cost": ethers.utils.formatUnits(execution.txReceipt.gasUsed.mul(execution.txReceipt.effectiveGasPrice), 'ether') + " ETH",
      "Previous total profit": ethers.utils.formatUnits(strategy.currentProfit, TOKEN_STAKING.decimals) + " " + TOKEN_STAKING.symbol,
      "New total profit": ethers.utils.formatUnits(totalProfits, TOKEN_STAKING.decimals) + " " + TOKEN_STAKING.symbol,
      "Arbitrage profit": ethers.utils.formatUnits(totalProfits.sub(strategy.currentProfit), TOKEN_STAKING.decimals) + " " + TOKEN_STAKING.symbol,
      "Estimated profit": ethers.utils.formatUnits(profitability.profit, TOKEN_STAKING.decimals) + " " + TOKEN_STAKING.symbol,
    });
    return;
  }
}

