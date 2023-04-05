import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { TKN2_SYMBOL } from 'src/app/utils/consts';
import { EChartsOption } from 'echarts';
import { generatePieOptions } from '../home/utils';
import { InfoService } from 'src/app/services/info.service';
import { UserInfo } from 'src/app/models/user';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { Arbitrage } from 'src/app/models/arbitrage-tx';

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
    PipesModule,
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

  public userInfo: UserInfo | undefined;
  public arbitrage: Arbitrage | undefined;

  constructor(private infoService: InfoService) {}

  ngOnInit() {
    // get user data
    this.infoService.getUserInfo().then((user) => {
      this.userInfo = user;
    });

    //get arbitrage contract data
    this.infoService.getArbitrage().then((arbitrage) => {
      this.arbitrage = arbitrage;
    });
  }
}
