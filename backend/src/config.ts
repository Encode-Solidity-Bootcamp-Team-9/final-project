import {SupportedChainId, Token} from '@uniswap/sdk-core'
import {FeeAmount} from "@uniswap/v3-sdk";


// Enum of Dexes to use in arbitrage
export enum Dex {
  UNISWAP,
  SUSHISWAP
}

export const CHAIN_ID = SupportedChainId.POLYGON_MUMBAI;

// UNISWAP CONTRACTS
export const UNISWAP_FACTORY_ADDRESS =
  '0x1F98431c8aD98523631AE4a59f267346ea31F984'
export const UNISWAP_QUOTER_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'
export const UNISWAP_POOL_FEE_TIER = FeeAmount.MEDIUM;

// SUSHISWAP CONTRACTS
export const SUSHISWAP_FACTORY_ADDRESS = '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'
export const SUSHISWAP_SWAP_ROUTER_ADDRESS = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506'

// ARBITRAGE CONTRACTS
export const ARBITRAGE_CONTRACT_ADDRESS = '0x449527573acdFBC6D20b2b7c4969747B5E1263F2';

// ARBITRAGE TOKENS
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

// ADDITIONAL CONFIG
export const MAX_GAS_COST_IN_ETH = "0.0001"; //how much gas price we are willing to pay
export const PRICE_DIFF_PERCENTAGE = 0.5; // = 0.5% how much price difference triggers the arbitrage process
// (it can still not be executed if additional calculations show that it is not profitable)

export const SLIPPAGE = 1; // 0% slippage

export const PG_CONNECTION = 'PG_CONNECTION';

