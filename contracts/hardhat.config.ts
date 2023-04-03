import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  paths: { tests: "tests" },
  solidity: {
    compilers: [
      {
        version: "0.5.0",
      },
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: false,
            runs: 0,
          },
        }
      },
    ],
    overrides: {
      "contracts/UniswapV2Router02.sol": {
        version: "0.6.12",
      }
    }
  },
  networks: {
    goerli: {
      chainId: 5,
      url: `https://eth-goerli.alchemyapi.io/v2/c6DalefEuYNe2PJdprfD8I95Eo7LkIUg`,
      accounts: ["e759cb1030cd6b2c76eb1476f0a05110c316cfc89e039368a280d512ddca2333"],
    },
    mumbai: {
      chainId: 80001,
      url: `https://polygon-mumbai.g.alchemy.com/v2/cUPcNv4p61xgbX-_oLMTprrni2Z9wZPj`,
      accounts: ["39bfebe1a0a6dcb4502ae085d9bcc8c7c75b6467255f82343ef51f10adb89442"]
    },
  },
  etherscan: {
    apiKey: {
      goerli: "B6K4YRQV5EMM2HVG8E77CBNUKCSMUEIEMT",
      polygonMumbai: "D6DQ5T5A3ZM4FH34WCQDT2FU6US9WI1FA4"
    }
  },
};

export default config;
