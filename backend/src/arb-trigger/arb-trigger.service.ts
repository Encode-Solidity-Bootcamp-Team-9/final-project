import {Injectable} from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import {ChainProviderService} from "./chain-provider.service";
import * as IUniswapV3Factory
  from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json'
import * as IUniswapV3Pool from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import * as ISushiswapV2Factory from "@uniswap/v2-core/build/IUniswapV2Factory.json"
import * as ISushiswapV2Pair from "@uniswap/v2-core/build/IUniswapV2Pair.json"

import {Contract, ethers} from "ethers";
import {computePoolAddress} from "@uniswap/v3-sdk";
import {SUSHISWAP_FACTORY_ADDRESS, TOKEN_1, TOKEN_2, UNISWAP_FACTORY_ADDRESS, UNISWAP_POOL_FEE_TIER} from "./config";

@Injectable()
export class ArbTriggerService {

  private uniPool: Contract;
  private uniFactory: Contract

  private sushiPool: Contract;
  private sushiFactory: Contract;

  private arbitrageInProgress : boolean = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly chainProviderService: ChainProviderService,
  ) {

    this.uniFactory = new ethers.Contract(
      UNISWAP_FACTORY_ADDRESS,
      IUniswapV3Factory.abi,
      this.chainProviderService.getProvider(),
    );

    this.sushiFactory = new ethers.Contract(
      SUSHISWAP_FACTORY_ADDRESS,
      ISushiswapV2Factory.abi,
      this.chainProviderService.getProvider(),
    );

    const uniPoolAddress = computePoolAddress({
      factoryAddress: UNISWAP_FACTORY_ADDRESS,
      tokenA: TOKEN_1,
      tokenB: TOKEN_2,
      fee: UNISWAP_POOL_FEE_TIER,
    })

    console.log(`Uni pool address (Token 1: ${TOKEN_1.symbol} Token 2: ${TOKEN_2.symbol} fee: ${UNISWAP_POOL_FEE_TIER}): ${uniPoolAddress}`);

    this.uniPool = new ethers.Contract(
      uniPoolAddress,
      IUniswapV3Pool.abi,
      this.chainProviderService.getProvider(),
    );

    this.sushiFactory.getPair(TOKEN_1.address, TOKEN_2.address).then((sushiPoolAddress) => {
      console.log(`Sushi pool address (Token 1: ${TOKEN_1.symbol} Token 2: ${TOKEN_2.symbol}): ${sushiPoolAddress}`);
      this.sushiPool = new ethers.Contract(
        sushiPoolAddress,
        ISushiswapV2Pair.abi,
        this.chainProviderService.getProvider(),
      );

      this.initializeEventListeners();
    });

  }

  private async initializeEventListeners() {

    this.uniPool.on('Swap', async () => {
      console.log("UNI swap event received");
      if(this.arbitrageInProgress) {
        console.log("Arbitrage already in progress, skipping event");
        return;
      }
      this.arbitrageInProgress = true;
    });

    this.sushiPool.on('Swap', async () => {
      console.log("SUSHI swap event received");
      if(this.arbitrageInProgress) {
        console.log("Arbitrage already in progress, skipping event");
        return;
      }
      this.arbitrageInProgress = true;
    });
  }
}
