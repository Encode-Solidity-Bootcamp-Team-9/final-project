import { CurrencyAmount, Percent, Token, sqrt } from '@uniswap/sdk-core'
import { computePoolAddress } from '@uniswap/v3-sdk'
import {
  MintOptions,
  nearestUsableTick,
  NonfungiblePositionManager,
  Pool,
  Position,
} from '@uniswap/v3-sdk'
import { BigNumber, ethers } from 'ethers'
import { CurrentConfig } from './config'
import {
  ERC20_ABI,
  FACTORY_V3_ABI,
  MAX_FEE_PER_GAS,
  MAX_PRIORITY_FEE_PER_GAS,
  POOL_FACTORY_CONTRACT_ADDRESS,
  NONFUNGIBLE_POSITION_MANAGER_ABI,
  NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
} from './constants'
import { TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER } from './constants'
import { fromReadableAmount } from './conversion'
import { getPoolInfo } from './pool'
import {
  getProvider,
  getWalletAddress,
  getSigner,
  sendTransaction,
  TransactionState,
} from './providers'
import JSBI from 'jsbi'
import Big from 'big.js'

import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'


export interface PositionInfo {
  tickLower: number
  tickUpper: number
  liquidity: BigNumber
  feeGrowthInside0LastX128: BigNumber
  feeGrowthInside1LastX128: BigNumber
  tokensOwed0: BigNumber
  tokensOwed1: BigNumber
}

export async function mintPosition(): Promise<TransactionState> {
  const address = getWalletAddress()
  const provider = getProvider()
  const signer = getSigner()

  if (!address || !provider) {
    return TransactionState.Failed
  }

/*   // Give approval to the contract to transfer tokens
  const tokenInApproval = await getTokenTransferApproval(
    CurrentConfig.tokens.token0
  )
  const tokenOutApproval = await getTokenTransferApproval(
    CurrentConfig.tokens.token1
  )

  // Fail if transfer approvals do not go through
  if (
    tokenInApproval !== TransactionState.Sent ||
    tokenOutApproval !== TransactionState.Sent
  ) {
    return TransactionState.Failed
  } */

  console.log("Creating pool...");
  const factoryV3 = new ethers.Contract(
    POOL_FACTORY_CONTRACT_ADDRESS,
    FACTORY_V3_ABI,
    signer
  )

  const tx = await factoryV3.createPool(
    CurrentConfig.tokens.token0.address,
    CurrentConfig.tokens.token1.address,
    CurrentConfig.tokens.poolFee
  )

  const txReceipt = await tx.wait();
  console.log('Pool created: ' + txReceipt.transactionHash);

  // INITIALIZE THE POOL WITH A STARTING PRICE
  console.log("Initializing the pool...");

  // First we calculate the starting price as a Q64.96 number
  const token0Amount = CurrentConfig.tokens.token1Amount;
  const token1Amount = CurrentConfig.tokens.token0Amount;
  const priceRatio = token0Amount / token1Amount;
  const sqrtPrice = Math.sqrt(priceRatio);
  const sqrtPriceX96 = JSBI.BigInt(sqrtPrice * 2**96).toString();

  // Setting up pool contract
  const poolAddress = computePoolAddress({
    factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
    tokenA: CurrentConfig.tokens.token0,
    tokenB: CurrentConfig.tokens.token1,
    fee: CurrentConfig.tokens.poolFee,
  })

  const poolContract = new ethers.Contract(
    poolAddress,
    IUniswapV3PoolABI.abi,
    signer
  )

  // Send the initializing transaction
  const initializeTx = await poolContract.initialize(sqrtPriceX96);
  const initializeTxReceipt = await initializeTx.wait();
  console.log('Pool initialized: ' + initializeTxReceipt.transactionHash);
  
  // MINTING THE POSITION
  // Creating the position for the first time and adding liquidity
  console.log("positionToMint...");
  const positionToMint = await constructPosition(
    CurrencyAmount.fromRawAmount(
      CurrentConfig.tokens.token0,
      fromReadableAmount(
        CurrentConfig.tokens.token0Amount,
        CurrentConfig.tokens.token0.decimals
      )
    ),
    CurrencyAmount.fromRawAmount(
      CurrentConfig.tokens.token1,
      fromReadableAmount(
        CurrentConfig.tokens.token1Amount,
        CurrentConfig.tokens.token1.decimals
      )
    )
  )
  console.log(positionToMint);


  console.log("mintOptions...");
  const mintOptions: MintOptions = {
    recipient: address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 20,
    slippageTolerance: new Percent(50, 10_000),
  }
  console.log(mintOptions);

  // get calldata for minting a position
  const { calldata, value } = NonfungiblePositionManager.addCallParameters(
    positionToMint,
    mintOptions
  )

  // build transaction
  const transaction = {
    data: calldata,
    to: NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
    value: value,
    from: address,
    maxFeePerGas: MAX_FEE_PER_GAS,
    maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
  }

  console.log(transaction);

  return sendTransaction(transaction)
}

export async function constructPosition(
  token0Amount: CurrencyAmount<Token>,
  token1Amount: CurrencyAmount<Token>
): Promise<Position> {
  // get pool info
  const poolInfo = await getPoolInfo()

  // construct pool instance
  const configuredPool = new Pool(
    token0Amount.currency,
    token1Amount.currency,
    poolInfo.fee,
    poolInfo.sqrtPriceX96.toString(),
    poolInfo.liquidity.toString(),
    poolInfo.tick
  )
  console.log('configuredPool... : ' + configuredPool);

  // create position using the maximum liquidity from input amounts
  return Position.fromAmounts({
    pool: configuredPool,
    tickLower:
      nearestUsableTick(poolInfo.tick, poolInfo.tickSpacing) -
      poolInfo.tickSpacing * 2,
    tickUpper:
      nearestUsableTick(poolInfo.tick, poolInfo.tickSpacing) +
      poolInfo.tickSpacing * 2,
    amount0: token0Amount.quotient,
    amount1: token1Amount.quotient,
    useFullPrecision: true,
  })
}

export async function getPositionIds(): Promise<number[]> {
  const provider = getProvider()
  const address = getWalletAddress()
  if (!provider || !address) {
    throw new Error('No provider available')
  }

  const positionContract = new ethers.Contract(
    NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
    NONFUNGIBLE_POSITION_MANAGER_ABI,
    provider
  )

  // Get number of positions
  const balance: number = await positionContract.balanceOf(address)

  // Get all positions
  const tokenIds = []
  for (let i = 0; i < balance; i++) {
    const tokenOfOwnerByIndex: number =
      await positionContract.tokenOfOwnerByIndex(address, i)
    tokenIds.push(tokenOfOwnerByIndex)
  }

  return tokenIds
}

export async function getPositionInfo(tokenId: number): Promise<PositionInfo> {
  const provider = getProvider()
  if (!provider) {
    throw new Error('No provider available')
  }

  const positionContract = new ethers.Contract(
    NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
    NONFUNGIBLE_POSITION_MANAGER_ABI,
    provider
  )

  const position = await positionContract.positions(tokenId)

  return {
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
    liquidity: position.liquidity,
    feeGrowthInside0LastX128: position.feeGrowthInside0LastX128,
    feeGrowthInside1LastX128: position.feeGrowthInside1LastX128,
    tokensOwed0: position.tokensOwed0,
    tokensOwed1: position.tokensOwed1,
  }
}

export async function getTokenTransferApproval(
  token: Token
): Promise<TransactionState> {
  const provider = getProvider()
  const address = getWalletAddress()
  if (!provider || !address) {
    console.log('No Provider Found')
    return TransactionState.Failed
  }

  try {
    const tokenContract = new ethers.Contract(
      token.address,
      ERC20_ABI,
      provider
    )

    const transaction = await tokenContract.populateTransaction.approve(
      NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
      TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER
    )

    return sendTransaction({
      ...transaction,
      from: address,
    })
  } catch (e) {
    console.error(e)
    return TransactionState.Failed
  }
}

async function main() {

  mintPosition();

}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});