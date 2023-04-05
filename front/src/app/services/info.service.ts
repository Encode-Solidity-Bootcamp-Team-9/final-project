import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { Subject } from 'rxjs';
import { Arbitrage, ArbitrageTx } from '../models/arbitrage-tx';
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

  public refresh = new Subject<void>();

  constructor(private api: ApiService, private web3: Web3Service) {}

  public async getArbitrageInfo(): Promise<Arbitrage> {
    this.arbitrage = await this.api.get<Arbitrage>(`info/contract`);
    this.refresh.next();
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
    this.refresh.next();
    return this.poolsState;
  }

  public async getUserInfo(): Promise<UserInfo | undefined> {
    if (this.web3.address) {
      this.userInfo = await this.api.get<UserInfo>(
        `info/user/${this.web3.address}`
      );
      this.refresh.next();
      return this.userInfo;
    } else {
      this.refresh.next();
      return undefined;
    }
  }

  public async getHistory(): Promise<ArbitrageTx[]> {
    const data = await this.api.get<ArbitrageTx[]>(
      'info/arbitrage-transactions'
    );
    return data;
  }
}
