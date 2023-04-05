import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { Arbitrage } from '../models/arbitrage-tx';
import { PoolsState } from '../models/pool';
import { UserInfo } from '../models/user';
import { ApiService } from './api.service';
import { Web3Service } from './web3.service';

@Injectable({
  providedIn: 'root',
})
export class InfoService {
  public poolsState: PoolsState | undefined;
  public userInfo: UserInfo | undefined;
  public arbitrage: Arbitrage | undefined;

  constructor(private api: ApiService, private web3: Web3Service) {}

  public async getArbitrageInfo(): Promise<Arbitrage> {
    this.arbitrage = await this.api.get<Arbitrage>(`info/contract`);
    return this.arbitrage;
  }

  public async getPoolsInfo(): Promise<PoolsState> {
    this.poolsState = await this.api.get<PoolsState>(`info/pools`);
    this.poolsState.uniRatio = ethers.utils
      .parseUnits(this.poolsState.uniFETH)
      .div(ethers.utils.parseUnits(this.poolsState.uniNAS))
      .toNumber();
    this.poolsState.sushiRatio = ethers.utils
      .parseUnits(this.poolsState.sushiFETH)
      .div(ethers.utils.parseUnits(this.poolsState.sushiNAS))
      .toNumber();
    return this.poolsState;
  }

  public async getUserInfo(): Promise<UserInfo | undefined> {
    if (this.web3.address) {
      this.userInfo = await this.api.get<UserInfo>(
        `info/user/${this.web3.address}`
      );
      return this.userInfo;
    } else {
      return undefined;
    }
  }

  public async swap(amount: number) {
    const amountInETH = ethers.utils.parseEther(amount.toString()).toString();
    if (this.poolsState === undefined) {
      await this.getPoolsInfo();
    }
    if (this.poolsState!.uniRatio! > this.poolsState?.sushiRatio!) {
      await this.web3.swapFETHForNASUsingSushiswap(amountInETH);
    } else {
      await this.web3.swapFETHForNASUsingUniswap(amountInETH);
    }
  }

  public async getArbitrage(): Promise<Arbitrage | undefined> {
    if (this.web3.address) {
      // do the call to the back end
      const data = this.api.get<Arbitrage>(
        `info/contract/${this.web3.address}`
      );
      return data;
    } else {
      return undefined;
    }
  }

  public async swap(amount: number) {
    const amountInETH = ethers.utils.parseEther(amount.toString()).toString();
    if (this.poolsState === undefined) {
      await this.getPoolsInfo();
    }
    if (this.poolsState!.uniRatio! > this.poolsState?.sushiRatio!) {
      await this.web3.swapFETHForNASUsingSushiswap(amountInETH);
    } else {
      await this.web3.swapFETHForNASUsingUniswap(amountInETH);
    }
  }

  public async getArbitrage(): Promise<Arbitrage | undefined> {
    if (this.web3.address) {
      // do the call to the back end
      const data = this.api.get<Arbitrage>(
        `info/contract/${this.web3.address}`
      );
      return data;
    } else {
      return undefined;
    }
  }
}
