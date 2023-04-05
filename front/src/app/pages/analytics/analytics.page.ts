import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EChartsOption } from 'echarts';
import { generatePieOptions } from '../home/utils';
import { TKN2_SYMBOL } from 'src/app/utils/consts';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { Arbitrage, ArbitrageTx } from 'src/app/models/arbitrage-tx';
import { InfoService } from 'src/app/services/info.service';
import { ToETHPipe } from 'src/app/pipes/to-eth.pipe';
import { PoolsState } from 'src/app/models/pool';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.page.html',
  styleUrls: ['./analytics.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, NgxEchartsModule, ToETHPipe],
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useFactory: () => ({ echarts: () => import('echarts') }),
    },
  ],
})
export class AnalyticsPage implements OnInit {
  public openState = ['overview', 'history'];

  public totalProfits: EChartsOption = generatePieOptions(
    [
      { value: 10, name: 'Total Profits' },
      {
        value: 1000,
        name: 'TVL Invested', 
      },
    ],
    [TKN2_SYMBOL, TKN2_SYMBOL]
  );

  public poolBalance: EChartsOption = generatePieOptions(
    [
      { value: 300, name: 'NAS' },
      {
        value: 50,
        name: 'FETH', 
      },
    ],
    [TKN2_SYMBOL, TKN2_SYMBOL]
  );

  public history: ArbitrageTx[] = [
    {
      hash: '0x3ee733310f8ee29320e55e0ebbf80e8961641242c65cb06b8bdfbdff84fa95b8',
      pool0: 1,
      pool1: 0,
      used: "1000",
      profits: "3.2",
      date: new Date(),
    },
    {
      hash: '0x3ee733310f8ee29320e55e0ebbf80e8961641242c65cb06b8bdfbdff84fa95b8',
      pool0: 0,
      pool1: 1,
      used: "500",
      profits: "1.2",
      date: new Date(),
    },
  ];

  public arbitrage: Arbitrage | undefined;
  public poolsState: PoolsState | undefined;

  constructor(private infoService: InfoService) {}

  ngOnInit() {
    //get arbitrage contract data
    this.infoService.getArbitrageInfo().then((arbitrage) => {
      this.arbitrage = arbitrage;
    });

    //get pools data
    this.infoService.getPoolsInfo().then((pools) => {
      this.poolsState = pools;
    });
  }
}
