import {SupportedChainId, Token} from '@uniswap/sdk-core'
import {FeeAmount} from "@uniswap/v3-sdk";
import {BigNumber} from "ethers";

export enum Dex {
  UNISWAP,
  SUSHISWAP
}

export const CHAIN_ID = SupportedChainId.POLYGON_MUMBAI;
export const UNISWAP_FACTORY_ADDRESS =
  '0x1F98431c8aD98523631AE4a59f267346ea31F984'
export const UNISWAP_QUOTER_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'
export const UNISWAP_POOL_FEE_TIER = FeeAmount.MEDIUM;
export const SUSHISWAP_FACTORY_ADDRESS = '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'
export const SUSHISWAP_SWAP_ROUTER_ADDRESS = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506'
export const ARBITRAGE_CONTRACT_ADDRESS = '0x180b30Cca80073E5a2807CA3343dB96A2C0A6995';

export const TOKEN_STAKING = new Token(
  CHAIN_ID,
  '0x9622F58d9745bAfaeABB7712a69DcdBdcF72e188',
  18,
  'STBL',
  'Stable'
)
export const TOKEN_LOAN = new Token(
  CHAIN_ID,
  '0xC97727ba966F6C52580121862dF2771A1Ca0F28a',
  18,
  'FETH',
  'Fake ETH'
);

export const TOKEN_PAIR = [TOKEN_STAKING, TOKEN_LOAN].sort((a, b) => BigInt(a.address) > BigInt(b.address) ? 1 : -1)

export const MAX_GAS_PRICE_IN_ETH = "0.0001";

export const ARBITRAGE_CONTRACT_ABI = [
  'function performArbitrage(uint8 _sellAt, address _tokenToSell, address _tokenToBuy, uint256 _amount)',
  'function totalProfits() view returns (uint256)',
  'function totalStaked() view returns (uint256)',
]

export const PRICE_DIFF_PERCENTAGE = 0.5;