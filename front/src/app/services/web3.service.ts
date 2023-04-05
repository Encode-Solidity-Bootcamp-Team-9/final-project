import { Injectable } from '@angular/core';
import { SupportedChainId } from '@uniswap/sdk-core';
import { ethers, providers } from 'ethers';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

import { NAS_TOKEN } from './contracts/NAS';
import { FETH_TOKEN } from './contracts/FakeETH';
import { ARBITRAGE } from './contracts/Arbitrage';


const { NAS_ADDRESS, FETH_ADDRESS, ARBITRAGE_ADDRESS } = environment;

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

  public NASContract: ethers.Contract;
  public FETHContract: ethers.Contract;
  public ArbitrageContract: ethers.Contract;

  constructor(private api: ApiService) {
    this.provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
    this.NASContract = new ethers.Contract(
      NAS_ADDRESS,
      NAS_TOKEN.abi,
      this.provider
    );
    this.FETHContract = new ethers.Contract(
      FETH_ADDRESS,
      FETH_TOKEN.abi,
      this.provider
    );
    this.ArbitrageContract = new ethers.Contract(
      ARBITRAGE_ADDRESS,
      ARBITRAGE.abi,
      this.provider
    );
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
}
