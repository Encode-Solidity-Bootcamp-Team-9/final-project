import { Injectable } from '@angular/core';
import { Arbitrage, PoolsState } from '../models/arbitrage-tx';
import { UserInfo } from '../models/user';
import { ApiService } from './api.service';
import { Web3Service } from './web3.service';

@Injectable({
  providedIn: 'root',
})
export class InfoService {
  constructor(private api: ApiService, private web3: Web3Service) {}

  // public async getArbitrageInfo(): Promise<Arbitrage> {}
  // const data = this.api.get<UserInfo>(`info/contract`);

  // public async getPoolsInfo(): Promise<PoolsState> {}
  // const data = this.api.get<UserInfo>(`info/pools`);

  public async getUserInfo(): Promise<UserInfo | undefined> {
    if (this.web3.address) {
      // do the call to the back end
      const data = this.api.get<UserInfo>(`info/user/${this.web3.address}`);
      return data;
    } else {
      return undefined;
    }
  }

  public async getArbitrage(): Promise<Arbitrage | undefined> {
    if (this.web3.address) {
      // do the call to the back end
      const data = this.api.get<Arbitrage>(`info/contract/${this.web3.address}`);
      return data;
    } else {
      return undefined;
    }
  }
}
