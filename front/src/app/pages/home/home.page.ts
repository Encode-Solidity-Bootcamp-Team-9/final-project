import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { generatePieOptions } from './utils';
import { TKN2_SYMBOL } from 'src/app/utils/consts';
import { Arbitrage } from 'src/app/models/arbitrage-tx';
import { InfoService } from 'src/app/services/info.service';
import { ToETHPipe } from 'src/app/pipes/to-eth.pipe';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, NgxEchartsModule, ToETHPipe],
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useFactory: () => ({ echarts: () => import('echarts') }),
    },
  ],
})
export class HomePage implements OnInit {
  public chartOptions: EChartsOption = generatePieOptions(
    [
      { value: 500, name: 'Fees Generated' },
      {
        value: 1000,
        name: 'TVL Invested',
      },
    ],
    [TKN2_SYMBOL, TKN2_SYMBOL]
  );

  public arbitrage: Arbitrage | undefined;

  constructor(private infoService: InfoService) {}

  ngOnInit() {
    //get arbitrage contract data
    this.infoService.getArbitrageInfo().then((arbitrage) => {
      this.arbitrage = arbitrage;
    });
  }
}
