import {Inject, Injectable} from '@nestjs/common';
import {ChainProviderService} from "../chain-provider/chain-provider.service";
import {ContractsProviderService} from "../contracts-provider/contracts-provider.service";
import {PriceCalculation} from "../arb-trigger/price-calculation-provider.service";
import {UserInfo} from "./dtos/UserInfo";
import {Arbitrage, ArbitrageTx} from "./dtos/Arbitrage";
import {PoolsState} from "./dtos/Pools";
import {PG_CONNECTION} from "../config";
import {ethers} from "ethers";

@Injectable()
export class InfoService {

  constructor(
    private readonly contracts: ContractsProviderService,
    private readonly priceCalculation: PriceCalculation,
    private readonly chain: ChainProviderService,
    @Inject(PG_CONNECTION) private conn: any
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

  async getArbitrageTxs() : Promise<ArbitrageTx[]> {
    const data = await this.conn.query('SELECT * FROM "arbitragetxs" ORDER BY "createdat" DESC;');
    const txs : ArbitrageTx[] = [];
    data.rows.forEach((tx) => {
      txs.push({
        hash: tx.hash,
        pool0: tx.pool0,
        pool1: tx.pool1,
        used: tx.used,
        profits: tx.profits,
        date: tx.createdat,
      })
    });
   return txs;
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

  async stake() {
    const stake = await this.contracts.arbitrageContract.stakeToken(ethers.utils.parseEther('100'));
    await stake.wait();
  }
}