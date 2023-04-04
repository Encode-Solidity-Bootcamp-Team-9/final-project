import {Injectable} from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import {ChainProviderService} from "../chain-provider/chain-provider.service";
import {ContractsProviderService} from "../contracts-provider/contracts-provider.service";
import {PriceCalculation} from "../arb-trigger/price-calculation-provider.service";
import {ChooseStrategy} from "../arb-trigger/choose-strategy-provider.service";
import {DetermineProfitability} from "../arb-trigger/profitability-provider.service";
import {StrategyExecution} from "../arb-trigger/execution-provider.service";
import {Results} from "../arb-trigger/results-provider.service";
import {UserInfo} from "./dtos/UserInfo";
import {Arbitrage} from "./dtos/Arbitrage";
import {PoolsState} from "./dtos/Pools";

@Injectable()
export class InfoService {

  constructor(
    private readonly contracts: ContractsProviderService,
    private readonly priceCalculation: PriceCalculation
  ) {
  }

  async getUser(address: string): Promise<UserInfo> {
    const stakeInfo = await this.contracts.arbitrageContract.stakeInfos(address);
    return {
      staked: stakeInfo.amount.toString(),
      totalProfits: stakeInfo.profit.toString(),
      feth: (await this.contracts.loanToken.balanceOf(address)).toString(),
      nas: (await this.contracts.stakeToken.balanceOf(address)).toString(),
      locktime: new Date(stakeInfo.endTS * 1000),
    };
  }

  async getArbitrageInfo(): Promise<Arbitrage> {
    return {
      address: this.contracts.arbitrageContract.address,
      totalStaked: (await this.contracts.arbitrageContract.totalStaked()).toString(),
      totalProfits: (await this.contracts.arbitrageContract.totalProfits()).toString()
    };
  }

  async getPoolsInfo(): Promise<PoolsState> {
    const uniPrice = await this.priceCalculation.getUniPoolRatio();
    const sushiPrice = await this.priceCalculation.getSushiPoolRatio();

    return {
      nasAddress: this.contracts.stakeToken.address,
      fethAddress: this.contracts.loanToken.address,
      uniPoolAddress: this.contracts.uniPool.address,
      sushiPoolAddress: (await this.contracts.getSushiPool()).address,
      uniFETH: uniPrice.liquidityLoanToken.toString(),
      uniNAS: uniPrice.liquidityStakingToken.toString(),
      sushiFETH: sushiPrice.liquidityLoanToken.toString(),
      sushiNAS: sushiPrice.liquidityStakingToken.toString(),
    };
  }
}