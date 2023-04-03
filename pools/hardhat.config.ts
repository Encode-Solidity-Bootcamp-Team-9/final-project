import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  paths: { tests: "tests" },
  solidity: "0.8.18",
  networks: {
    mumbai: {
      chainId: 80001,
      url: `https://polygon-mumbai.g.alchemy.com/v2/cUPcNv4p61xgbX-_oLMTprrni2Z9wZPj`,
      accounts: ["39bfebe1a0a6dcb4502ae085d9bcc8c7c75b6467255f82343ef51f10adb89442"]
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: "D6DQ5T5A3ZM4FH34WCQDT2FU6US9WI1FA4"
    }
  },
};

export default config;
