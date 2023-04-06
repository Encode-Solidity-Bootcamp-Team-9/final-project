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
import { NotificationService } from 'src/app/services/notification.service';
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
      { value: 0, name: 'Total Profits' }, //userInfo.totalProfits converted to ETH
      {
        value: 0,
        name: 'TVL Invested', //userInfo.staked converted to ETH
      },
    ],
    [TKN2_SYMBOL, TKN2_SYMBOL]
  );

  public currentPosition: EChartsOption = generatePieOptions(
    [
      { value: 0, name: 'Your Stake' }, //userInfo.staked converted to ETH
      {
        value: 0,
        name: 'Total NAS Staked', //arbitrage.totalStaked converted to ETH
      },
    ],
    [TKN2_SYMBOL, TKN2_SYMBOL]
  );

  public get userInfo(): UserInfo | undefined {
    return this.infoService.userInfo;
  }
  public get arbitrage(): Arbitrage | undefined {
    return this.infoService.arbitrage;
  }

  public stakeAmount: number = 0;
  public withdrawAmount: number = 0;

  public amountIn: number = 0;
  public amountOut: number = 0;

  private subs: Subscription[] = [];

  public loadingSwap: boolean = false;
  public loadingMint: boolean = false;
  public loadingStake: boolean = false;
  public loadingWithdraw: boolean = false;
  public loadingProfits: boolean = false;
  public alreadyMinted: boolean = false;

  constructor(
    private web3: Web3Service,
    public infoService: InfoService,
    private swapService: SwapService,
    private tokensService: TokensService,
    private notificationService: NotificationService
  ) {}

  ngOnDestroy() {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit() {
    this.subs.push(
      this.web3.address$.subscribe(async (address) => {
        if (address) {
          // get user data
          await this.infoService.getUserInfo();
          this.alreadyMinted = await this.web3.ArbitrageContract.hasMinted(
            this.web3.address
          );
          if (this.alreadyMinted) {
            this.openState = ['swap', 'invest'];
          }
        }
      })
    );

    //get arbitrage contract data
    this.infoService.getArbitrageInfo().then((arbitrage) => {});

    this.subs.push(
      this.infoService.refresh.subscribe(() => {
        if (!this.userInfo || !this.arbitrage) return;
        const totalProfits = +Number(
          ethers.utils.formatEther(this.userInfo.totalProfits)
        ).toFixed(2);
        const totalStaked = +Number(
          ethers.utils.formatEther(this.userInfo.staked)
        ).toFixed(2);
        const totalReturn = (totalProfits/totalStaked*100).toFixed(2);

        const activeStaked = +Number(
          ethers.utils.formatEther(this.userInfo.activeStaked)
        ).toFixed(2);
        const arbitrageStaked = +Number(
          ethers.utils.formatEther(this.arbitrage.totalStaked)
        ).toFixed(2);
        const stakeShare = (activeStaked/arbitrageStaked*100).toFixed(2);
        
        this.totalProfits = generatePieOptions(
          [
            { value: totalProfits, name: `Your Profits: ${totalReturn}%` },
            {
              value: totalStaked,
              name: 'Your Stake',
            },
          ],
          [TKN2_SYMBOL, TKN2_SYMBOL]
        );

        this.currentPosition = generatePieOptions(
          [
            { value: activeStaked, name: `Your Stake: ${stakeShare}%` },
            {
              value: arbitrageStaked - activeStaked,
              name: 'Total Stake',
            },
          ],
          [TKN2_SYMBOL, TKN2_SYMBOL]
        );
      })
    );
  }

  public async swap() {
    this.loadingSwap = true;
    try {
      const feth = ethers.utils.parseEther(this.amountIn.toString()).toString();
      await this.swapService.swapFETHForNAS(feth);
      await this.infoService.getUserInfo();
      await this.infoService.getPoolsInfo();
      await this.infoService.getArbitrageInfo();
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
    this.loadingMint = true;
    try {
      await this.tokensService.mint();
      this.notificationService.notify({
      status: 'success',
      message: `You have successfully minted 50 FETH !`,
    });
    } catch (e) {
      this.notificationService.notify({
        status: 'error',
        message: (e as Error).message,
      });
    } finally {
      this.loadingMint = false;
    }
  }

  public async stake() {
    console.log('staking');
    this.loadingStake = true;
    try {
      const amount = this.stakeAmount;
      await this.tokensService.stake(
        ethers.utils.parseEther(amount.toString()).toString()
      );
      this.notificationService.notify({
      status: 'success',
      message: `You have successfully staked ${amount} NAS !`,
    });
    } catch (e) {
      this.notificationService.notify({
        status: 'error',
        message: (e as Error).message,
      });
    } finally {
      this.loadingStake = false;
    }
  }

  public async withdrawStake() {
    this.loadingWithdraw = true;
    try {
      const amount = this.withdrawAmount;
      await this.tokensService.withdrawStake(
        ethers.utils.parseEther(amount.toString()).toString()
      );
      this.notificationService.notify({
      status: 'success',
      message: `You have successfully withdrawn ${amount} NAS !`,
    });
    } catch (e) {
      this.notificationService.notify({
        status: 'error',
        message: (e as Error).message,
      });
    } finally {
      this.loadingWithdraw = false;
    }
  }

  public async claimProfits() {
    this.loadingProfits = true;
    try {
      await this.tokensService.claimProfits();
      this.notificationService.notify({
      status: 'success',
      message: `You have successfully claimed your profits !`,
    });
    } catch (e) {
      this.notificationService.notify({
        status: 'error',
        message: (e as Error).message,
      });
    } finally {
      this.loadingProfits = false;
    }
  }
}
