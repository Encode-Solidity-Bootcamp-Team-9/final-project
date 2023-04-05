import { Injectable } from '@angular/core';
import { ethers, providers } from 'ethers';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';

declare global {
  interface Window {
    ethereum: any;
  }
}

@Injectable({
  providedIn: 'root',
})
export class Web3Service {
  private addressSubject = new BehaviorSubject<string>('');
  public address$ = this.addressSubject.asObservable();

  constructor(private api: ApiService) {
    if (typeof window.ethereum !== 'undefined') {
      this.provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
    }
  }

  public address: string | undefined;

  private signer: providers.JsonRpcSigner | undefined;

  private networkId: number = 80001;
  public provider: providers.Web3Provider | undefined;

  public async connect(): Promise<void> {
    if (!this.provider) return;
    await this.provider.send('eth_requestAccounts', []);
    this.signer = this.provider.getSigner();
    this.address = await this.signer.getAddress();
    this.switchToNetwork();
    this.addressSubject.next(this.address);
  }

  public async switchToNetwork() {
    if (!this.provider) return;
    const network = await this.provider.getNetwork();
    if (network.chainId !== this.networkId) {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13881' }],
      });
    }
  }

  public async swapFETHForNASUsingSushiswap(amount: string) {}

  public async swapFETHForNASUsingUniswap(amount: string) {}
}
