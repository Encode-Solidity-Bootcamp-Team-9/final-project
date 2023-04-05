import { Injectable } from '@angular/core';
import { SupportedChainId } from '@uniswap/sdk-core';
import { ethers, providers } from 'ethers';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

// import * as IUniswapV2Router02 from '@uniswap/v2-periphery/build/IUniswapV2Router02.json';

const { SUSHISWAP_ROUTER_ADDRESS } = environment;

declare global {
  interface Window {
    ethereum: any;
  }
}

const CHAIN_ID = SupportedChainId.POLYGON_MUMBAI;

@Injectable({
  providedIn: 'root',
})
export class Web3Service {
  private addressSubject = new BehaviorSubject<string>('');
  public address$ = this.addressSubject.asObservable();

  private sushiRouter: ethers.Contract | undefined;

  private loadContracts() {
    // this.sushiRouter = new ethers.Contract(
    //   SUSHISWAP_ROUTER_ADDRESS,
    //   IUniswapV2Router02.abi,
    //   this.provider
    // );
  }

  constructor(private api: ApiService) {
    if (typeof window.ethereum !== 'undefined') {
      this.provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      this.loadContracts();
    }
  }

  public address: string | undefined;

  private signer: providers.JsonRpcSigner | undefined;

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
    if (network.chainId !== CHAIN_ID) {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethers.utils.hexValue(CHAIN_ID) }],
      });
    }
  }

  public async swapFETHForNASUsingSushiswap(amount: string) {}

  public async swapFETHForNASUsingUniswap(amount: string) {}
}
