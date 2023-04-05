import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { TKN2_SYMBOL } from 'src/app/utils/consts';
import { EChartsOption } from 'echarts';
import { generatePieOptions } from '../home/utils';
import { InfoService } from 'src/app/services/info.service';
import { TokensService } from 'src/app/services/tokens.service';
import { UserInfo } from 'src/app/models/user';
import { Arbitrage } from 'src/app/models/arbitrage-tx';
import { ToETHPipe } from 'src/app/pipes/to-eth.pipe';
import { SwapService } from 'src/app/services/swap.service';
import { ethers } from 'ethers';
import { Web3Service } from 'src/app/services/web3.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-invest',
  templateUrl: './invest.page.html',
  styleUrls: ['./invest.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    NgxEchartsModule,
    ToETHPipe,
  ],
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useFactory: () => ({ echarts: () => import('echarts') }),
    },
  ],
})
export class InvestPage implements OnInit {
  public openState = ['summary', 'mint', 'swap', 'invest'];

  public totalProfits: EChartsOption = generatePieOptions(
    [
      { value: 10, name: 'Total Profits' }, //userInfo.totalProfits converted to ETH
      {
        value: 1000,
        name: 'TVL Invested', //userInfo.staked converted to ETH
      },
    ],
    [TKN2_SYMBOL, TKN2_SYMBOL]
  );

  public currentPosition: EChartsOption = generatePieOptions(
    [
      { value: 1000, name: 'Your Stake' }, //userInfo.staked converted to ETH
      {
        value: 10000,
        name: 'Total NAS Staked', //arbitrage.totalStaked converted to ETH
      },
    ],
    [TKN2_SYMBOL, TKN2_SYMBOL]
  );

  public get userInfo(): UserInfo | undefined {
    return this.infoService.userInfo;
  }
  public arbitrage: Arbitrage | undefined;
  public stakeAmount: number = 0;
  public withdrawAmount: number = 0;

  public amountIn: number = 0;
  public amountOut: number = 0;

  private subs: Subscription[] = [];

  public loadingSwap: boolean = false;
  public loadingMint: boolean = false;

  constructor(
    private web3: Web3Service,
    public infoService: InfoService,
    private swapService: SwapService,
    private tokensService: TokensService
  ) {}

  ngOnDestroy() {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit() {
    this.subs.push(
      this.web3.address$.subscribe((address) => {
        if (address) {
          // get user data
          this.infoService.getUserInfo().then((user) => {});
        }
      })
    );

    //get arbitrage contract data
    this.infoService.getArbitrage().then((arbitrage) => {
      this.arbitrage = arbitrage;
    });
  }

  public async swap() {
    this.loadingSwap = true;
    try {
      const feth = ethers.utils.parseEther(this.amountIn.toString()).toString();
      await this.swapService.swapFETHForNAS(feth);
    } catch (e) {
    } finally {
      this.loadingSwap = false;
    }
  }

  public async onAmountChange() {
    if (!this.amountIn) return;
    const feth = ethers.utils.parseEther(this.amountIn.toString()).toString();
    this.amountOut = Number(await this.swapService.getExpectedNAS(feth));
  }
  public async mint() {
    await this.tokensService.mint();
    /*this.notificationService.notify({
      status: 'success',
      message: `You have successfully minted 10 FETH !`,
    });*/
  }

  public async stake() {
    const amount = this.stakeAmount;
    await this.tokensService.stake(amount);
    /*this.notificationService.notify({
      status: 'success',
      message: `You have successfully staked ${amount} NAS !`,
    });*/
  }

  public async withdrawStake() {
    const amount = this.withdrawAmount;
    await this.tokensService.withdrawStake(amount);
    /*this.notificationService.notify({
      status: 'success',
      message: `You have successfully withdrawn ${amount} NAS !`,
    });*/
  }

  public async claimProfits() {
    await this.tokensService.claimProfits();
    /*this.notificationService.notify({
      status: 'success',
      message: `You have successfully claimed your profits !`,
    });*/
  }

}
