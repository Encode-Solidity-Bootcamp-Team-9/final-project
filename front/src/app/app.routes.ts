import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.page').then( m => m.AboutPage)
  },
  {
    path: 'analytics',
    loadComponent: () => import('./pages/analytics/analytics.page').then( m => m.AnalyticsPage)
  },
  {
    path: 'invest',
    loadComponent: () => import('./pages/invest/invest.page').then( m => m.InvestPage)
  },
  {
    path: 'lottery',
    loadComponent: () => import('./pages/lottery/lottery.page').then( m => m.LotteryPage)
  },
];
