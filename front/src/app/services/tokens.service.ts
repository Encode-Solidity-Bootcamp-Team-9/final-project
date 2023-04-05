import { Injectable } from '@angular/core';
import { Web3Service } from './web3.service';
import { ApiService } from './api.service';
import { InfoService } from './info.service';
import { environment } from 'src/environments/environment';
import { BigNumber } from 'ethers';

@Injectable({
  providedIn: 'root',
})
export class TokensService {
  constructor(
    private api: ApiService,
    private web3: Web3Service,
    private info: InfoService
  ) {}

  contract = this.web3.ArbitrageContract;

  public async mint() {
    //const account = this.web3.signer!;
    const resultTx = await this.contract
      .connect(this.web3.signer!)
      .requestTokens();
    await resultTx.wait();
    await this.info.getUserInfo();
  }

  public async stake(amount: string) {
    await this.approveIfNecessary(amount);
    const resultTx = await this.contract
      .connect(this.web3.signer!)
      .stakeToken(amount);
    await resultTx.wait();

    await this.info.getUserInfo();
    await this.info.getArbitrageInfo();
  }

  public async withdrawStake(amount: string) {
    const resultTx = await this.contract
      .connect(this.web3.signer!)
      .withdrawStake(amount);
    await resultTx.wait();
    await this.info.getUserInfo();
    await this.info.getArbitrageInfo();
  }

  public async claimProfits() {
    const resultTx = await this.contract
      .connect(this.web3.signer!)
      .claimArbitrageProfits();
    await resultTx.wait();
    await this.info.getUserInfo();
  }

  private async approveIfNecessary(amount: string) {
    if (!this.web3.address) return;
    const allowance: BigNumber = await this.web3.NASContract['allowance'](
      this.web3.address,
      this.web3.ArbitrageContract.address
    );

    if (allowance.lte(amount)) {
      await this.approve(amount);
    }
  }

  private async approve(amount: string) {
    const approveNAS = await this.web3.NASContract.connect(this.web3.signer!)[
      'approve'
    ](this.web3.ArbitrageContract.address, amount, { gasLimit: 80000 });
    await approveNAS.wait();
  }
}
