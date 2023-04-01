import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  paths: { tests: "tests" },
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: false,
        runs: 0,
      },
    }
  },
  networks: {
    goerli: {
      chainId: 5,
      url: `https://eth-goerli.alchemyapi.io/v2/c6DalefEuYNe2PJdprfD8I95Eo7LkIUg`,
      accounts: ["e759cb1030cd6b2c76eb1476f0a05110c316cfc89e039368a280d512ddca2333"],
    },
  },
  etherscan: {
    apiKey: {
      goerli: "B6K4YRQV5EMM2HVG8E77CBNUKCSMUEIEMT"
    }
  }
};

export default config;
