import { Injectable } from '@angular/core';
import { Arbitrage, PoolsState } from '../models/arbitrage-tx';
import { UserInfo } from '../models/user';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class InfoService {
  constructor(private api: ApiService) {}

  public async getArbitrageInfo(): Promise<Arbitrage> {}

  public async getPoolsInfo(): Promise<PoolsState> {}

  public async getUserInfo(): Promise<UserInfo> {}
}
