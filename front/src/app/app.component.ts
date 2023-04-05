import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationStart, Router } from '@angular/router';
import { IonicModule, Platform } from '@ionic/angular';
import { filter, Subscription } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { NotificationService } from './services/notification.service';
import { Web3Service } from './services/web3.service';
import { InfoService } from './services/info.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  public account: string = '';
  public appPages: {
    title: string;
    url: string;
    icon: string;
    active: boolean;
  }[] = [
    {
      title: 'Home',
      url: 'home',
      icon: 'home',
      active: false,
    },
    {
      title: 'How it works',
      url: 'about',
      icon: 'information-circle',
      active: false,
    },
    {
      title: 'Analytics',
      url: 'analytics',
      icon: 'code-slash',
      active: false,
    },
    {
      title: 'Invest',
      url: 'invest',
      icon: 'cash',
      active: false,
    },
    // {
    //   title: 'Lottery',
    //   url: 'lottery',
    //   icon: 'gift',
    //   active: false,
    // },
  ];

  smallSideMenu: boolean = false;
  menuWidth: string = '370px';
  subs: Subscription[] = [];

  constructor(
    private plateform: Platform,
    private router: Router,
    private notificationService: NotificationService,
    private toastCtrl: ToastController,
    private web3: Web3Service,
    private info: InfoService
  ) {
    this.subs.push(
      this.router.events
        .pipe(filter((e) => e instanceof NavigationStart))
        .subscribe((e) => {
          const url = (e as NavigationStart).url;
          this.appPages.forEach((p) => {
            if (url.includes(p.url)) {
              p.active = true;
            } else {
              p.active = false;
            }
          });
        })
    );

    this.subs.push(
      this.notificationService.notify$.subscribe(async (data) => {
        const toast = await this.toastCtrl.create({
          message: data.message,
          duration: 3000,
        });
        await toast.present();
      })
    );

    this.subs.push(
      this.web3.address$.subscribe((address) => {
        this.account = address;
      })
    );
  }

  ngOnInit() {
    this.subs.push(
      this.plateform.resize.subscribe(async () => {
        const width = this.plateform.width();
        this.checkSize(width);
      })
    );
  }

  async ngAfterViewInit() {
    const width = this.plateform.width();
    this.checkSize(width);
  }

  public toggleMenu(): void {
    this.smallSideMenu = !this.smallSideMenu;
  }

  public checkSize(width: number) {
    if (width < 768) {
      this.smallSideMenu = true;
      return;
    }
    this.smallSideMenu = false;
  }

  public navigateTo(page: string) {
    this.router.navigate([page]);
  }

  goToLink(url: string) {
    window.open(url, '_blank');
  }

  public async connect() {
    await this.web3.connect();
    await this.info.getUserInfo();
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
