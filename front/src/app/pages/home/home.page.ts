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
import { Subscription } from 'rxjs';
import { ethers } from 'ethers';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
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
export class HomePage implements OnInit {
  public subs: Subscription[] = [];

  public chartOptions: EChartsOption = generatePieOptions(
    [
      { value: 0, name: 'Profits Generated' },
      {
        value: 0,
        name: 'TVL Invested',
      },
    ],
    [TKN2_SYMBOL, TKN2_SYMBOL]
  );

  public get arbitrage(): Arbitrage | undefined {
    return this.infoService.arbitrage;
  }

  constructor(private infoService: InfoService, private router: Router) {}

  ngOnInit() {
    //get arbitrage contract data
    this.infoService.getArbitrageInfo().then((arbitrage) => {
      this.updateChart();
    });

    this.subs.push(
      this.infoService.refresh.subscribe(() => {
        this.updateChart();
      })
    );
  }

  private updateChart() {
    if (!this.arbitrage) return;
    const totalProfits = Number(
      ethers.utils.formatEther(this.arbitrage!.totalProfits)
    );
    const totalStaked = Number(
      ethers.utils.formatEther(this.arbitrage!.totalStaked)
    );
    this.chartOptions = generatePieOptions(
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

  ngOnDestroy() {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  public goTo(page: string) {
    this.router.navigate([page]);
  }
}
