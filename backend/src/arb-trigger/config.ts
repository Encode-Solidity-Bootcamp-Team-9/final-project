import { SupportedChainId, Token } from '@uniswap/sdk-core'
import {FeeAmount} from "@uniswap/v3-sdk";

export const CHAIN_ID = SupportedChainId.GOERLI;
export const UNISWAP_FACTORY_ADDRESS =
  '0x1F98431c8aD98523631AE4a59f267346ea31F984'
export const UNISWAP_SWAP_ROUTER_ADDRESS =
  '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'
export const UNISWAP_POOL_FEE_TIER = FeeAmount.LOW;
export const SUSHISWAP_FACTORY_ADDRESS = '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'
export const SUSHISWAP_SWAP_ROUTER_ADDRESS = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506'

export const TOKEN_1 = new Token(
  CHAIN_ID,
  '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  18,
  'WETH',
  'Wrapped Ether'
)
export const TOKEN_2 = new Token(
  CHAIN_ID,
  '0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C',
  6,
  'USDC',
  'USD//C'
)