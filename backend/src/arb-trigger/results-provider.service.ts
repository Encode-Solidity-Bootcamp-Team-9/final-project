import {Inject, Injectable} from '@nestjs/common';
import {PG_CONNECTION, TOKEN_STAKING} from "../config";
import {ethers} from "ethers";
import {ContractsProviderService} from "../contracts-provider/contracts-provider.service";
import {IStrategy} from "./choose-strategy-provider.service";
import {IExecution} from "./execution-provider.service";
import {IProfitability} from "./profitability-provider.service";

@Injectable()
export class Results {

  constructor(
    private readonly contracts: ContractsProviderService,
    @Inject(PG_CONNECTION) private conn: any,
  ) {
  }

  public async check(strategy: IStrategy, execution: IExecution, profitability: IProfitability): Promise<void> {
    const totalProfits = await this.contracts.arbitrageContract.totalProfits();
    let arbitrageProfit = totalProfits.sub(strategy.currentProfit);


    await this.insertTx(execution, strategy, arbitrageProfit);

    console.table({
      "Tx hash": execution.txReceipt.transactionHash,
      "Gas used": ethers.utils.formatUnits(execution.txReceipt.gasUsed, 'wei') + " wei",
      "Effective gas price": ethers.utils.formatUnits(execution.txReceipt.effectiveGasPrice, 'ether') + " ETH",
      "Gas cost": ethers.utils.formatUnits(execution.txReceipt.gasUsed.mul(execution.txReceipt.effectiveGasPrice), 'ether') + " ETH",
      "Previous total profit": ethers.utils.formatUnits(strategy.currentProfit, TOKEN_STAKING.decimals) + " " + TOKEN_STAKING.symbol,
      "New total profit": ethers.utils.formatUnits(totalProfits, TOKEN_STAKING.decimals) + " " + TOKEN_STAKING.symbol,
      "Arbitrage profit": ethers.utils.formatUnits(arbitrageProfit, TOKEN_STAKING.decimals) + " " + TOKEN_STAKING.symbol,
      "Estimated profit": ethers.utils.formatUnits(profitability.profit, TOKEN_STAKING.decimals) + " " + TOKEN_STAKING.symbol,
    });
    return;
  }

  private async insertTx(execution: IExecution, strategy: IStrategy, arbitrageProfit) {
    await this.conn.query(
      `INSERT INTO "arbitragetxs" ("hash", "pool0", "pool1", "used", "profits", "createdat")
       VALUES ($1, $2, $3, $4, $5,
               $6)`, [execution.txReceipt.transactionHash, strategy.sellDex, strategy.buyDex, strategy.firstTrade0.toString(), arbitrageProfit.toString(), new Date()]); // sends queries
  }
}

