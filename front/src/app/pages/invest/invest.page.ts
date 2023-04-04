import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { TKN2_SYMBOL } from 'src/app/utils/consts';
import { EChartsOption } from 'echarts';
import { generatePieOptions } from '../home/utils';

@Component({
  selector: 'app-invest',
  templateUrl: './invest.page.html',
  styleUrls: ['./invest.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, NgxEchartsModule],
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
      { value: 10, name: 'Total Profits' },
      {
        value: 1000,
        name: 'TVL Invested',
      },
    ],
    [TKN2_SYMBOL, TKN2_SYMBOL]
  );

  public currentPosition: EChartsOption = generatePieOptions(
    [
      { value: 1000, name: 'Your Stake' },
      {
        value: 10000,
        name: 'Total NAS Staked',
      },
    ],
    [TKN2_SYMBOL, TKN2_SYMBOL]
  );
  constructor() {}

  ngOnInit() {}
}
