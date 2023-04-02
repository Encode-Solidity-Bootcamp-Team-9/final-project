import { SupportedChainId, Token } from '@uniswap/sdk-core'
import {FeeAmount} from "@uniswap/v3-sdk";
import {BigNumber} from "ethers";

export enum Dex {
  UNISWAP,
  SUSHISWAP
}

export const CHAIN_ID = SupportedChainId.GOERLI;
export const UNISWAP_FACTORY_ADDRESS =
  '0x1F98431c8aD98523631AE4a59f267346ea31F984'
export const UNISWAP_SWAP_ROUTER_ADDRESS =
  '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45';
export const UNISWAP_QUOTER_ADDRESS = '0x61fFE014bA17989E743c5F6cB21bF9697530B21e'

export const UNISWAP_POOL_FEE_TIER = FeeAmount.LOW;
// export const SUSHISWAP_FACTORY_ADDRESS = '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'
export const SUSHISWAP_FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'
export const SUSHISWAP_SWAP_ROUTER_ADDRESS = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506'

export const SUSHISWAP_FEE_PERCENT = 0.3;

export const TOKEN_PAIR = [new Token(
  CHAIN_ID,
  '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  18,
  'UNI',
  'UNI'
),  new Token(
  CHAIN_ID,
  '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  18,
  'WETH',
  'Wrapped Ether'
)].sort((a, b) => BigInt(a.address) < BigInt(b.address) ? 1 : -1)