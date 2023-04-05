import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

// For macOS users
import path from "path";
dotenv.config({ path: path.resolve(__dirname, ".env") });

const POLYGONSCAN_API_KEY = getEnvVariableValue("POLYGONSCAN_API_KEY");
const ALCHEMY_API_KEY = getEnvVariableValue("ALCHEMY_API_KEY");
const PRIVATE_KEY = getEnvVariableValue("PRIVATE_KEY");

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
    mumbai: {
      chainId: 80001,
      url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY]
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: POLYGONSCAN_API_KEY
    }
  },
};

export default config;


function getEnvVariableValue(varName: string): string {
  const varValue = process.env[varName];
  if (!varValue || varValue.length < 1) {
      throw new Error(`Must provide a valid value for key ${varName}. Check your.env file!`);
  };
  return varValue;
}