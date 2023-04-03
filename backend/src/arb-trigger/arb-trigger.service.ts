import {Injectable} from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import {ChainProviderService} from "./chain-provider.service";
import * as IUniswapV3Factory
  from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json'
import * as IUniswapV3Pool from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import * as ISushiswapV2Factory from "@uniswap/v2-core/build/IUniswapV2Factory.json"
import * as ISushiswapV2Pair from "@uniswap/v2-core/build/IUniswapV2Pair.json"
import * as IUniswapV2Router02 from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";
import * as IERC20 from "@uniswap/v2-core/build/IERC20.json"
import * as Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'

import {BigNumber, Contract, ethers} from "ethers";
import {computePoolAddress} from "@uniswap/v3-sdk";
import {
  ARBITRAGE_CONTRACT_ABI,
  ARBITRAGE_CONTRACT_ADDRESS,
  Dex, MAX_GAS_COST_IN_ETH,
  SUSHISWAP_FACTORY_ADDRESS, SUSHISWAP_SWAP_ROUTER_ADDRESS,
  TOKEN_LOAN,
  TOKEN_PAIR,
  TOKEN_STAKING,
  UNISWAP_FACTORY_ADDRESS,
  UNISWAP_POOL_FEE_TIER, UNISWAP_QUOTER_ADDRESS
} from "./config";
import {JSBI} from "@uniswap/sdk";
import {Token} from "@uniswap/sdk-core";
import {util} from "prettier";
import getMaxContinuousCount = util.getMaxContinuousCount;
import {PRICE_DIFF_PERCENTAGE} from "./config";

@Injectable()
export class ArbTriggerService {

  private uniPool: Contract;
  private uniFactory: Contract
  private uniQuoter: Contract

  private sushiPool: Contract;
  private sushiFactory: Contract;

  private sushiRouter: Contract;

  private stakeToken: Contract;
  private loanToken: Contract;

  private arbitrageContract: Contract;

  private arbitrageInProgress: boolean = false;

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

    this.sushiFactory.getPair(TOKEN_PAIR[0].address, TOKEN_PAIR[1].address).then((sushiPoolAddress) => {
      console.log(`Sushi pool address (Token 1: ${TOKEN_PAIR[0].symbol} Token 2: ${TOKEN_PAIR[1].symbol}): ${sushiPoolAddress}`);
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
      console.log("Swap event on Uni pool")
      await this.arbitrage(Dex.UNISWAP);
    });

    this.sushiPool.on('Swap', async () => {
      console.log("Swap event on Sushi pool")
      await this.arbitrage(Dex.SUSHISWAP);
    });
  }

  public async arbitrage(dexThatChanged) {
    if (this.arbitrageInProgress) {
      return;
    }

    try {
      this.arbitrageInProgress = true;

      console.log("Arbitrage triggered because of swap on " + Dex[dexThatChanged] + "\n");
      console.log("Checking prices...")
      const {uniPoolRatio, sushiPoolRatio} = await this.checkPrices();

      console.log("Checking diff...")
      const {uniVsSushiDiffPercentage, isDiffOk} = this.priceDiff(uniPoolRatio, sushiPoolRatio);

      if (!isDiffOk) {
        return;
      }

      console.log("\n");

      console.log("Choosing arbitrage strategy...");
      const strategy = await this.chooseStrategy(uniPoolRatio, sushiPoolRatio, uniVsSushiDiffPercentage)

      if (!strategy) {
        return;
      }

      console.log("\n");

      console.log("Calculating strategy profitability...");
      const profitability = await this.calculateProfitability(strategy)

      if (!profitability) {
        return;
      }

      console.log("\n");

      console.log("Executing strategy...");
      const execution = await this.executeStrategy(strategy)

      console.log("\n");

      console.log("Checking results...");
      await this.checkResults(strategy, execution, profitability)

    } catch (e) {
      console.error(e);
    } finally {
      this.arbitrageInProgress = false;
      console.log("\n##############################\n")
    }
  }

  private async checkPrices() {
    const uniPoolRatio: PriceRatio = await this.getUniPoolRatio();
    console.log("[UNI] " + TOKEN_STAKING.symbol + "/" + TOKEN_LOAN.symbol + " : " + uniPoolRatio.ratio);

    const sushiPoolRatio: PriceRatio = await this.getSushiPoolRatio();
    console.log("[SUSHI] " + TOKEN_STAKING.symbol + "/" + TOKEN_LOAN.symbol + " : " + sushiPoolRatio.ratio);

    console.log("\n");
    return {uniPoolRatio, sushiPoolRatio};
  }

  private priceDiff(uniPoolRatio: PriceRatio, sushiPoolRatio: PriceRatio) {
    const uniVsSushiDiffPercentage = (((uniPoolRatio.ratio - sushiPoolRatio.ratio) / sushiPoolRatio.ratio) * 100);

    const minDiffPercentage = PRICE_DIFF_PERCENTAGE;
    const isDiffOk = Math.abs(uniVsSushiDiffPercentage) > minDiffPercentage;
    console.log("UNI/SUSHI diff: " + uniVsSushiDiffPercentage.toFixed(2) + "% (min: " + minDiffPercentage.toFixed(2) + "%)" + (isDiffOk ? " OK" : " NOT"));
    return {uniVsSushiDiffPercentage, isDiffOk};
  }

  private async getUniPoolRatio(): Promise<PriceRatio> {
    const [slot0] =
      await Promise.all([
        this.uniPool.slot0(),
      ]);

    const sqrtPriceX96 = slot0[0];

    return await this.getPriceRatioUni({
      SqrtX96: sqrtPriceX96,
      Decimal0: TOKEN_PAIR[0].decimals,
      Decimal1: TOKEN_PAIR[1].decimals,
    });
  }

  private async getPriceRatioUni(PoolInfo): Promise<PriceRatio> {
    let sqrtPriceX96: any = PoolInfo.SqrtX96;
    let Decimal0: any = PoolInfo.Decimal0
    let Decimal1: any = PoolInfo.Decimal1;

    // @ts-ignore
    let buyOneOfToken0 = (sqrtPriceX96 * sqrtPriceX96 * (10 ** Decimal0) / (10 ** Decimal1) / (JSBI.BigInt(2) ** (JSBI.BigInt(192))).toFixed(Decimal1));

    let liquidityStakingToken = await this.stakeToken.balanceOf(this.uniPool.address);
    let liquidityLoanToken = await this.loanToken.balanceOf(this.uniPool.address);

    //always return price ratio for pair TOKEN_STAKING/TOKEN_LOAN !
    if (BigInt(TOKEN_STAKING.address) > BigInt(TOKEN_LOAN.address)) {
      buyOneOfToken0 = 1 / buyOneOfToken0;
    }

    return {
      ratio: buyOneOfToken0,
      liquidityStakingToken: liquidityStakingToken,
      liquidityLoanToken: liquidityLoanToken
    }
  }

  private async getSushiPoolRatio(): Promise<PriceRatio> {
    let [reserveToken0, reserveToken1] = await this.sushiPool.getReserves();

    let buyOneOfToken0 = (reserveToken1 / reserveToken0) / (10 ** (TOKEN_PAIR[1].decimals - TOKEN_PAIR[0].decimals))

    //always return price ratio for pair TOKEN_STAKING/TOKEN_LOAN !
    if (BigInt(TOKEN_STAKING.address) > BigInt(TOKEN_LOAN.address)) {
      buyOneOfToken0 = 1 / buyOneOfToken0;
      let tmp = reserveToken0;
      reserveToken0 = reserveToken1;
      reserveToken1 = tmp;
    }

    return {
      ratio: buyOneOfToken0,
      liquidityStakingToken: reserveToken0,
      liquidityLoanToken: reserveToken1
    }

  }

  private async chooseStrategy(uniPoolRatio : PriceRatio, sushiPoolRatio : PriceRatio, uniVsSushiDiffPercentage: number): Promise<Strategy> {

    let sellDex, buyDex;
    let liquidity;

    if (uniVsSushiDiffPercentage > 0) { //if percentage is positive, price on UNISWAP is higher - we sell there
      sellDex = Dex.UNISWAP;
      buyDex = Dex.SUSHISWAP
      liquidity = uniPoolRatio.liquidityStakingToken;
    } else {
      sellDex = Dex.SUSHISWAP;
      buyDex = Dex.UNISWAP
      liquidity = sushiPoolRatio.liquidityStakingToken;
    }

    // totalStaked: await this.arbitrageContract.totalStaked(), todo: when arbitrage contract is ready
    let totalStaked : BigNumber = await this.stakeToken.balanceOf(ARBITRAGE_CONTRACT_ADDRESS);

    //max sell amount is limited by total liquidity in the selling pool and divided by 10
    let maxSellAmountStr = ethers.utils.formatUnits(totalStaked.gt(liquidity) ? liquidity : totalStaked, TOKEN_STAKING.decimals);
    let maxSellAmount = parseFloat(maxSellAmountStr) / Math.abs(10);


    const strategy = {
      buyToken: TOKEN_LOAN,
      sellToken: TOKEN_STAKING,
      buyDex: buyDex, //here we have to buy TOKEN_STAKING for TOKEN_LOAN
      sellDex: sellDex, //here we have to sell TOKEN_STAKING for TOKEN_LOAN
      totalStaked: totalStaked,
      maxSellAmount: ethers.utils.parseUnits(maxSellAmount.toString(), TOKEN_STAKING.decimals),
      currentProfit: await this.stakeToken.balanceOf(ARBITRAGE_CONTRACT_ADDRESS),
      // currentProfit: await this.arbitrageContract.totalProfits(), todo: when arbitrage contract is ready
    };

    console.table({
      "Sell token": strategy.sellToken.symbol,
      "Sell at Dex": Dex[strategy.sellDex],
      "Liquidity in sell-to pool": ethers.utils.formatUnits(liquidity, strategy.sellToken.decimals) + " " + strategy.sellToken.symbol,
      "Max sell amount": ethers.utils.formatUnits(strategy.maxSellAmount, strategy.sellToken.decimals),
      "Buy token": strategy.buyToken.symbol,
      "Rebuy at Dex": Dex[strategy.buyDex],
    });

    return strategy;
  }



  private async calculateProfitability(strategy: Strategy): Promise<Profitability> {

    const maxAmount = parseFloat(ethers.utils.formatUnits(strategy.maxSellAmount, strategy.sellToken.decimals));
    const steps = 10;
    const step = maxAmount / steps;

    let mostProfit: BigNumber = null;
    let amountWithMostProfit = maxAmount;

    for (let i = 0; i < steps; i++) {
      const amount = maxAmount - (i * step);
      const amountBN = ethers.utils.parseUnits(amount.toString(), strategy.sellToken.decimals);

      let token2Amount, tokenAmountAfter: BigNumber;
      if (strategy.sellDex === Dex.UNISWAP) {
        token2Amount = await this.tradeOnUni(strategy.sellToken.address, strategy.buyToken.address, amountBN);
        tokenAmountAfter = await this.tradeOnSushi(strategy.buyToken.address, strategy.sellToken.address, token2Amount);
      } else {
        token2Amount = await this.tradeOnSushi(strategy.sellToken.address, strategy.buyToken.address, amountBN);
        tokenAmountAfter = await this.tradeOnUni(strategy.buyToken.address, strategy.sellToken.address, token2Amount);
      }

      // console.log(TOKEN_STAKING.symbol + " amount before trade: " + ethers.utils.formatUnits(amountBN, TOKEN_STAKING.decimals));
      // console.log(TOKEN_STAKING.symbol + " amount after trade: " + ethers.utils.formatUnits(tokenAmountAfter, TOKEN_STAKING.decimals));

      let profit = tokenAmountAfter.sub(amountBN);

      // console.log("Profit: " + ethers.utils.formatUnits(profit, TOKEN_STAKING.decimals) + " " + TOKEN_STAKING.symbol);

      console.log(i + ": Profit " + ethers.utils.formatUnits(profit, strategy.sellToken.decimals) + " " + strategy.sellToken.symbol + " (Trade amount: "+ amount + ")" );
      if (mostProfit == null || profit.gt(mostProfit)) {
        mostProfit = profit;
        amountWithMostProfit = amount;
      } else {
        break;
      }
    }

    const gasPrice = await this.chainProviderService.getProvider().getGasPrice();
    const gasFeesTx = await this.arbitrageContract.estimateGas.performArbitrage(strategy.buyDex, strategy.sellToken.address, strategy.buyToken.address, ethers.utils.parseUnits(amountWithMostProfit.toString(), strategy.sellToken.decimals));
    const gasCost = gasFeesTx.mul(gasPrice);

    strategy.amountWithMostProfit = ethers.utils.parseUnits(amountWithMostProfit.toString(), strategy.sellToken.decimals);

    const profitability = {
      gasCost: gasCost,
      profit: mostProfit,
    };

    console.table({
      "Gas price": ethers.utils.formatUnits(gasPrice, 'ether') + " ETH",
      "Gas fees": ethers.utils.formatUnits(gasFeesTx, 'wei') + " wei",
      "Gas cost": ethers.utils.formatUnits(profitability.gasCost, 'ether') + " ETH",
      "Profit": ethers.utils.formatUnits(profitability.profit, TOKEN_STAKING.decimals) + " " + TOKEN_STAKING.symbol,
      "Trade with amount": ethers.utils.formatUnits(strategy.amountWithMostProfit, TOKEN_STAKING.decimals) + " " + TOKEN_STAKING.symbol,
    });

    const maxGasCost = ethers.utils.parseUnits(MAX_GAS_COST_IN_ETH, "ether");
    const gasOk = maxGasCost.gt(gasPrice);
    const profitOk = profitability.profit.gt(0);
    console.log("GAS cost: " + ethers.utils.formatUnits(gasCost, 'ether') + " ETH (" + "max: " + ethers.utils.formatUnits(maxGasCost, 'ether') + " ETH)" + (gasOk ? " OK" : "  NOT"));
    console.log("Profit: " + ethers.utils.formatUnits(profitability.profit, TOKEN_STAKING.decimals) + " " + TOKEN_STAKING.symbol + (profitOk ? " OK" : "  NOT"));

    if (!gasOk || !profitOk) {
      console.log("Strategy not profitable, skipping execution");
      return null;
    }

    return profitability;
  }

  private async tradeOnUni(sellToken: string, butToken: string, amount: BigNumber): Promise<BigNumber> {
    return await this.uniQuoter.callStatic.quoteExactInputSingle(
      sellToken,
      butToken,
      UNISWAP_POOL_FEE_TIER,
      amount.toString(),
      0
    );
  }

  private async tradeOnSushi(sellToken: string, buyToken: string, amount: BigNumber): Promise<BigNumber> {
    return (await this.sushiRouter.getAmountsOut(amount.toString(), [sellToken, buyToken]))[1];

  }

  private async executeStrategy(strategy: Strategy): Promise<Execution> {
    console.log("Parameters: " + Dex[strategy.sellDex] + ", " + strategy.sellToken.symbol + ", " + strategy.buyToken.symbol + ", " + ethers.utils.formatUnits(strategy.amountWithMostProfit, strategy.sellToken.decimals));
    const tx = await this.arbitrageContract.performArbitrage(strategy.sellDex, strategy.sellToken.address, strategy.buyToken.address, strategy.amountWithMostProfit);
    const txReceipt = await tx.wait();
    console.log("Arbitrage executed!");
    return {
      txReceipt: txReceipt,
    };
  }

  private async checkResults(strategy: Strategy, execution: Execution, profitability: Profitability): Promise<void> {
    const totalProfits = await this.arbitrageContract.totalProfits();

    console.table({
      "Tx hash": execution.txReceipt.transactionHash,
      "Gas used": ethers.utils.formatUnits(execution.txReceipt.gasUsed, 'wei') + " wei",
      "Effective gas price": ethers.utils.formatUnits(execution.txReceipt.effectiveGasPrice, 'ether') + " ETH",
      "Gas cost": ethers.utils.formatUnits(execution.txReceipt.gasUsed.mul(execution.txReceipt.effectiveGasPrice), 'ether') + " ETH",
      "Previous total profit": ethers.utils.formatUnits(strategy.currentProfit, TOKEN_STAKING.decimals) + " " + TOKEN_STAKING.symbol,
      "New total profit": ethers.utils.formatUnits(totalProfits, TOKEN_STAKING.decimals) + " " + TOKEN_STAKING.symbol,
      "Arbitrage profit": ethers.utils.formatUnits(totalProfits.sub(strategy.currentProfit), TOKEN_STAKING.decimals) + " " + TOKEN_STAKING.symbol,
      "Estimated profit": ethers.utils.formatUnits(profitability.profit, TOKEN_STAKING.decimals) + " " + TOKEN_STAKING.symbol,
    });
    return;
  }
}

interface PriceRatio {
  ratio: number,
  liquidityStakingToken: BigNumber,
  liquidityLoanToken: BigNumber,
}

interface Strategy {
  buyToken: Token,
  sellToken: Token,
  buyDex: Dex,
  sellDex: Dex,
  totalStaked: BigNumber,
  currentProfit: BigNumber,
  maxSellAmount: BigNumber,
  amountWithMostProfit?: BigNumber,
}

interface Execution {
  txReceipt: any,
}

interface Profitability {
  gasCost: BigNumber,
  profit: BigNumber,
}
