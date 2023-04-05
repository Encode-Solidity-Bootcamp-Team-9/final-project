import { Injectable } from '@angular/core';
import { ContractTransaction, ethers } from 'ethers';
import { Web3Service } from './web3.service';
import { ApiService } from './api.service';
import { InfoService } from './info.service';
import { environment } from 'src/environments/environment';
import { MintRequestDto } from '../models/mint';


@Injectable({
  providedIn: 'root'
})

export class TokensService {

  constructor(private api: ApiService, private web3: Web3Service, private info: InfoService) {}

    contract = this.web3.ArbitrageContract;

    public async mint() {
      //const account = this.web3.signer!;
      const result = await this.contract.connect(this.web3.signer!).requestTokens();
      await this.info.getUserInfo();
    }

    public async stake(amount: number) {
      const result = await this.contract.connect(this.web3.signer!).stakeToken(amount);
      await this.info.getUserInfo();
      await this.info.getArbitrageInfo();
    }

    public async withdrawStake(amount: number) {
      const result = await this.contract.connect(this.web3.signer!).withdrawStake(amount);
      await this.info.getUserInfo();
      await this.info.getArbitrageInfo();
    }

    public async claimProfits() {
      const result = await this.contract.connect(this.web3.signer!).claimArbitrageProfits();
      await this.info.getUserInfo();
    }

}
