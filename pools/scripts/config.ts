import { Token } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'
import { ABC_TOKEN, WETH } from './constants'

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
    local: 'https://goerli.infura.io/v3/ca4f3f2c038648f9b7a3e0e8f563679c',
    mainnet: 'https://goerli.infura.io/v3/ca4f3f2c038648f9b7a3e0e8f563679c',
  },
  wallet: {
    address: '0x90AA731eea0C9CbB2299b2ceb6674c5f54dFEBB0',
    privateKey:
      '0x39bfebe1a0a6dcb4502ae085d9bcc8c7c75b6467255f82343ef51f10adb89442',
  },
  tokens: {
    token0: ABC_TOKEN,
    token0Amount: 50,
    token1: WETH,
    token1Amount: 0.01,
    poolFee: FeeAmount.MEDIUM,
  },
}