import { Token } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'
import { FETH, ABC } from './constants'

// Sets if the example should run locally or on chain
export enum Environment {
  LOCAL,
  WALLET_EXTENSION,
  MAINNET,
}

// Inputs that configure this example to run
export interface ExampleConfig {
  env: Environment
  rpc: {
    local: string
    mainnet: string
  }
  wallet: {
    address: string
    privateKey: string
  }
  tokens: {
    token0: Token
    token0Amount: number
    token1: Token
    token1Amount: number
    poolFee: FeeAmount
  }
}

// Example Configuration

export const CurrentConfig: ExampleConfig = {
  env: Environment.MAINNET,
  rpc: {
    local: 'https://polygon-mumbai.g.alchemy.com/v2/cUPcNv4p61xgbX-_oLMTprrni2Z9wZPj',
    mainnet: 'https://polygon-mumbai.g.alchemy.com/v2/cUPcNv4p61xgbX-_oLMTprrni2Z9wZPj',
  },
  wallet: {
    address: '0x90AA731eea0C9CbB2299b2ceb6674c5f54dFEBB0',
    privateKey:
      '0x39bfebe1a0a6dcb4502ae085d9bcc8c7c75b6467255f82343ef51f10adb89442',
  },
  tokens: {
    token0: FETH,
    token0Amount: 1,
    token1: ABC,
    token1Amount: 1500,
    poolFee: FeeAmount.LOWEST,
  },
}