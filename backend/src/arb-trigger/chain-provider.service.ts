import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {ethers, Signer} from 'ethers';
import {CHAIN_ID} from "./config";


@Injectable()
export class ChainProviderService {
  private readonly provider: ethers.providers.AlchemyProvider;
  private readonly signer: Signer;

  constructor(private readonly configService: ConfigService) {
    this.provider = new ethers.providers.AlchemyProvider(
      CHAIN_ID,
      this.configService.getOrThrow<string>('ALCHEMY_API_KEY')
    );

    const wallet = new ethers.Wallet(this.configService.getOrThrow<string>('WALLET_PRIVATE_KEY'));
    this.signer = wallet.connect(this.provider);
  }

  getProvider(): ethers.providers.Provider {
    return this.provider;
  }

  getSigner(): Signer {
    return this.signer;
  }
}
