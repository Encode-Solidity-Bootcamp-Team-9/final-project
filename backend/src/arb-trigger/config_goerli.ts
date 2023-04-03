import {SupportedChainId, Token} from '@uniswap/sdk-core'
import {FeeAmount} from "@uniswap/v3-sdk";
import {BigNumber} from "ethers";

export enum Dex {
  UNISWAP,
  SUSHISWAP
}

export const CHAIN_ID = SupportedChainId.GOERLI;
export const UNISWAP_FACTORY_ADDRESS =
  '0x1F98431c8aD98523631AE4a59f267346ea31F984'
export const UNISWAP_QUOTER_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'
export const UNISWAP_POOL_FEE_TIER = FeeAmount.HIGH;
export const SUSHISWAP_FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'
export const SUSHISWAP_SWAP_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
export const ARBITRAGE_CONTRACT_ADDRESS = '0x180b30Cca80073E5a2807CA3343dB96A2C0A6995';

export const TOKEN_STAKING = new Token(
  CHAIN_ID,
  '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  18,
  'UNI',
  'Uniswap'
);

export const TOKEN_LOAN = new Token(
  CHAIN_ID,
  '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  18,
  'WETH',
  'Wrapped Ether'
)

export const TOKEN_PAIR = [TOKEN_STAKING, TOKEN_LOAN].sort((a, b) => BigInt(a.address) > BigInt(b.address) ? 1 : -1)

export const MAX_GAS_PRICE_IN_ETH = "0.0001";

export const ARBITRAGE_CONTRACT_ABI = [
  'function performArbitrage(uint8 _sellAt, address _tokenToSell, address _tokenToBuy, uint256 _amount)',
  'function totalProfits() view returns (uint256)',
  'function totalStaked() view returns (uint256)',
]

export const PRICE_DIFF_PERCENTAGE = 0.5;