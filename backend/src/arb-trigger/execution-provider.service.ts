import { Injectable } from '@nestjs/common';
import { Dex } from '../config';
import { ethers } from 'ethers';
import { ContractsProviderService } from '../contracts-provider/contracts-provider.service';
import { IStrategy } from './choose-strategy-provider.service';

@Injectable()
export class StrategyExecution {
  constructor(private readonly contracts: ContractsProviderService) {}

  async execute(strategy: IStrategy): Promise<IExecution> {
    console.log(
      'Parameters: ' +
        Dex[strategy.sellDex] +
        ', ' +
        strategy.sellToken.symbol +
        ', ' +
        strategy.buyToken.symbol +
        ', ' +
        ethers.utils.formatUnits(
          strategy.firstTrade0,
          strategy.sellToken.decimals,
        ) +
        ', ' +
        ethers.utils.formatUnits(
          strategy.firstTrade1,
          strategy.buyToken.decimals,
        ) +
        ', ' +
        ethers.utils.formatUnits(
          strategy.secondTrade0,
          strategy.buyToken.decimals,
        ) +
        ', ' +
        ethers.utils.formatUnits(
          strategy.secondTrade1,
          strategy.sellToken.decimals,
        ),
    );
    const tx = await this.contracts.arbitrageContract.performArbitrage(
      strategy.sellDex,
      strategy.sellToken.address,
      strategy.buyToken.address,
      strategy.firstTrade0,
      strategy.firstTrade1,
      strategy.secondTrade0,
      strategy.secondTrade1,
    );
    const txReceipt = await tx.wait();
    console.log('Arbitrage executed!');
    return {
      txReceipt: txReceipt,
    };
  }
}

export interface IExecution {
  txReceipt: any;
}
