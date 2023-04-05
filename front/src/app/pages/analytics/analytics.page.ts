import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EChartsOption } from 'echarts';
import { generatePieOptions } from '../home/utils';
import { TKN1_SYMBOL, TKN2_SYMBOL } from 'src/app/utils/consts';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { Arbitrage, ArbitrageTx } from 'src/app/models/arbitrage-tx';
import { InfoService } from 'src/app/services/info.service';
import { ToETHPipe } from 'src/app/pipes/to-eth.pipe';
import { PoolsState } from 'src/app/models/pool';
import { Subscription } from 'rxjs';
import { ethers } from 'ethers';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.page.html',
  styleUrls: ['./analytics.page.scss'],
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
export class AnalyticsPage implements OnInit {
  public openState = ['overview', 'history'];

  private subs: Subscription[] = [];

  public totalProfits: EChartsOption = generatePieOptions(
    [
      { value: 0, name: 'Total Profits' },
      {
        value: 0,
        name: 'TVL Invested',
      },
    ],
    [TKN2_SYMBOL, TKN2_SYMBOL]
  );

  public poolUniBalance: EChartsOption = generatePieOptions(
    [
      { value: 0, name: 'NAS' },
      {
        value: 0,
        name: 'FETH',
      },
    ],
    [TKN2_SYMBOL, TKN2_SYMBOL]
  );

  public poolSushiBalance: EChartsOption = generatePieOptions(
    [
      { value: 0, name: 'NAS' },
      {
        value: 0,
        name: 'FETH',
      },
    ],
    [TKN2_SYMBOL, TKN2_SYMBOL]
  );

  public get arbitrage(): Arbitrage | undefined {
    return this.infoService.arbitrage;
  }
  public get poolsState(): PoolsState | undefined {
    return this.infoService.poolsState;
  }

  public history: ArbitrageTx[] = [
    {
      hash: '0x3ee733310f8ee29320e55e0ebbf80e8961641242c65cb06b8bdfbdff84fa95b8',
      pool0: 1,
      pool1: 0,
      used: '1000',
      profits: '3.2',
      date: new Date(),
    },
    {
      hash: '0x3ee733310f8ee29320e55e0ebbf80e8961641242c65cb06b8bdfbdff84fa95b8',
      pool0: 0,
      pool1: 1,
      used: '500',
      profits: '1.2',
      date: new Date(),
    },
  ];

  constructor(private infoService: InfoService) {}

  ngOnInit() {
    //get arbitrage contract data
    this.infoService.getArbitrageInfo().then((arbitrage) => {
      this.updateArbitrage();
    });

    //get pools data
    this.infoService.getPoolsInfo().then((pools) => {
      this.updatePools();
    });

    this.subs.push(
      this.infoService.refresh.subscribe(() => {
        this.updateArbitrage();
        this.updatePools();
      })
    );
  }

  private updateArbitrage() {
    if (!this.arbitrage) return;
    const totalProfits = Number(
      ethers.utils.formatEther(this.arbitrage!.totalProfits)
    );
    const totalStaked = Number(
      ethers.utils.formatEther(this.arbitrage!.totalStaked)
    );
    this.totalProfits = generatePieOptions(
      [
        { value: totalProfits, name: 'Profits Generated' },
        {
          value: totalStaked,
          name: 'TVL Invested',
        },
      ],
      [TKN2_SYMBOL, TKN2_SYMBOL]
    );
  }

  private updatePools() {
    if (!this.poolsState) return;
    const sushiNAS = Number(
      ethers.utils.formatEther(this.poolsState!.sushiNAS)
    );
    const sushiFETH = Number(
      ethers.utils.formatEther(this.poolsState!.sushiFETH)
    );
    this.poolSushiBalance = generatePieOptions(
      [
        { value: sushiNAS, name: 'NAS' },
        {
          value: sushiFETH,
          name: 'FETH',
        },
      ],
      [TKN2_SYMBOL, TKN1_SYMBOL]
    );

    const uniNAS = Number(ethers.utils.formatEther(this.poolsState!.uniNAS));
    const uniFETH = Number(ethers.utils.formatEther(this.poolsState!.uniFETH));
    this.poolUniBalance = generatePieOptions(
      [
        { value: uniNAS, name: 'NAS' },
        {
          value: uniFETH,
          name: 'FETH',
        },
      ],
      [TKN2_SYMBOL, TKN1_SYMBOL]
    );
  }

  ngOnDestroy() {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
