import {Injectable} from '@nestjs/common';
import {Contract, ethers} from "ethers";
import {ConfigService} from "@nestjs/config";
import {ChainProviderService} from "../chain-provider/chain-provider.service";
import {
  ARBITRAGE_CONTRACT_ABI,
  ARBITRAGE_CONTRACT_ADDRESS, SUSHISWAP_FACTORY_ADDRESS, SUSHISWAP_SWAP_ROUTER_ADDRESS,
  TOKEN_LOAN, TOKEN_PAIR,
  TOKEN_STAKING,
  UNISWAP_FACTORY_ADDRESS, UNISWAP_POOL_FEE_TIER, UNISWAP_QUOTER_ADDRESS
} from "../config";
import {computePoolAddress} from "@uniswap/v3-sdk";
import * as IUniswapV3Factory
  from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json'
import * as IUniswapV3Pool from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import * as ISushiswapV2Factory from "@uniswap/v2-core/build/IUniswapV2Factory.json"
import * as ISushiswapV2Pair from "@uniswap/v2-core/build/IUniswapV2Pair.json"
import * as IUniswapV2Router02 from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";
import * as IERC20 from "@uniswap/v2-core/build/IERC20.json"
import * as Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'

@Injectable()
export class ContractsProviderService {
  uniPool: Contract;
  uniFactory: Contract
  uniQuoter: Contract

  private sushiPool: Contract;
  sushiFactory: Contract;

  sushiRouter: Contract;

  stakeToken: Contract;
  loanToken: Contract;

  arbitrageContract: Contract;

  constructor(
    private readonly configService: ConfigService,
    private readonly chainProviderService: ChainProviderService,
  ) {

    this.arbitrageContract = new ethers.Contract(
      ARBITRAGE_CONTRACT_ADDRESS,
      ARBITRAGE_CONTRACT_ABI,
      this.chainProviderService.getSigner(),
    );

    this.stakeToken = new ethers.Contract(
      TOKEN_STAKING.address,
      IERC20.abi,
      this.chainProviderService.getProvider(),
    );

    this.loanToken = new ethers.Contract(
      TOKEN_LOAN.address,
      IERC20.abi,
      this.chainProviderService.getProvider(),
    );

    this.uniFactory = new ethers.Contract(
      UNISWAP_FACTORY_ADDRESS,
      IUniswapV3Factory.abi,
      this.chainProviderService.getProvider(),
    );

    this.uniQuoter = new ethers.Contract(
      UNISWAP_QUOTER_ADDRESS,
      Quoter.abi,
      this.chainProviderService.getProvider(),
    );

    this.sushiFactory = new ethers.Contract(
      SUSHISWAP_FACTORY_ADDRESS,
      ISushiswapV2Factory.abi,
      this.chainProviderService.getProvider(),
    );

    this.sushiRouter = new ethers.Contract(
      SUSHISWAP_SWAP_ROUTER_ADDRESS,
      IUniswapV2Router02.abi,
      this.chainProviderService.getProvider(),
    );

    const uniPoolAddress = computePoolAddress({
      factoryAddress: UNISWAP_FACTORY_ADDRESS,
      tokenA: TOKEN_PAIR[0],
      tokenB: TOKEN_PAIR[1],
      fee: UNISWAP_POOL_FEE_TIER,
    })

    console.log(`Uni pool address (Token 1: ${TOKEN_PAIR[0].symbol} Token 2: ${TOKEN_PAIR[1].symbol} fee: ${UNISWAP_POOL_FEE_TIER}): ${uniPoolAddress}`);

    this.uniPool = new ethers.Contract(
      uniPoolAddress,
      IUniswapV3Pool.abi,
      this.chainProviderService.getProvider(),
    );
  }

  public async getSushiPool() {
    if (!this.sushiPool) {
      const sushiPoolAddress = await this.sushiFactory.getPair(TOKEN_PAIR[0].address, TOKEN_PAIR[1].address);
      console.log(`Sushi pool address (Token 1: ${TOKEN_PAIR[0].symbol} Token 2: ${TOKEN_PAIR[1].symbol}): ${sushiPoolAddress}`);
      this.sushiPool = new ethers.Contract(
        sushiPoolAddress,
        ISushiswapV2Pair.abi,
        this.chainProviderService.getProvider(),
      );
    }
    return this.sushiPool;
  }
}
