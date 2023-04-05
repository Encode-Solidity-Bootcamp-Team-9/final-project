//deploys SushiSwap liquidity pool FETH - STBL
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import * as dotenv from "dotenv";
import * as UniswapV2Router02 from "../artifacts/contracts/UniswapV2Router02.sol/UniswapV2Router02.json";
import * as FakeETH from "../artifacts/contracts/FakeETH.sol/FakeETH.json";
import * as Stable from "../artifacts/contracts/Stable.sol/Stable.json";
import { BigNumber, Contract, ethers, Wallet } from "ethers";

// For macOS users
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

//Token addresses
const FETH_ADDRESS = "0xB30b5258299397f355ff58B82eFbaC594Ea0A8cc";
const STBL_ADDRESS = "0x27b4E260749DDB780ea2AA0C30608c51ee28F6C4";

//Sushiswap factory address
const SUSHISWAP_FACTORY_ADDRESS = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";
let provider: any;
let signer: Wallet;
let fethContract: Contract;
let stblContract: Contract;
let sushiSwapContract: Contract;
let pairAddress: string;

const rl = readline.createInterface({ input, output });

async function main() {
  await getSigner();
  connectContracts();
  await addLiquidity();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function getSigner() {
  provider = new ethers.providers.AlchemyProvider(
    "maticmum",
    getEnvVariableValue("ALCHEMY_API_KEY")
  );
  const wallet = new ethers.Wallet(getEnvVariableValue("PRIVATE_KEY"));
  signer = wallet.connect(provider);
  //get ETH balance
  const balance = await signer.getBalance();
  console.log(
    `Signer address: ${wallet.address}\nBalance: ${ethers.utils.formatEther(
      balance
    )} ETH`
  );
}

function getEnvVariableValue(varName: string): string {
  const varValue = process.env[varName];
  if (!varValue || varValue.length < 1) {
    throw new Error(
      `Must provide a valid value for key ${varName}. Check your.env file!`
    );
  }
  return varValue;
}

function connectContracts() {
  sushiSwapContract = new ethers.Contract(
    SUSHISWAP_FACTORY_ADDRESS,
    UniswapV2Router02.abi,
    signer
  );
  fethContract = new ethers.Contract(FETH_ADDRESS, FakeETH.abi, signer);
  stblContract = new ethers.Contract(STBL_ADDRESS, Stable.abi, signer);
}

async function addLiquidity() {
  //get signer token balance:
  const fethBalance = await fethContract.balanceOf(signer.address);
  const stblBalance = await stblContract.balanceOf(signer.address);
  console.log(
    `Account ${signer.address} has ${fethBalance} FETH and ${stblBalance} STBL`
  );
  //set liquidity amount
  const a = await rl.question(
    "Amount of tokens to be added to liquidity pool:"
  );
  const amount = ethers.utils.parseEther(a);
  //await confirmation
  await confirmTx(`Add ${a} FETH and ${a} STBL to liquidity pool`);
  //grant sushiswap contract allowance to transfer amount to the pool:
  await approve(amount);
  //add liquidity
  //deadline: 1000 seconds after latest block
  const deadline = (await provider.getBlock("latest")).timestamp + 1000;
  const addLiquidity = await sushiSwapContract.addLiquidity(
    FETH_ADDRESS,
    STBL_ADDRESS,
    amount,
    amount,
    100,
    100,
    signer.address,
    deadline
  );
  const addLiquiditytx = await addLiquidity.wait();
  console.log(`Liquidity added (tx hash: ${addLiquiditytx.transactionHash})`);
}

async function approve(amount: BigNumber) {
  //check existing allowance
  const fethAllowance = await fethContract.allowance(
    signer.address,
    SUSHISWAP_FACTORY_ADDRESS
  );
  const stblAllowance = await stblContract.allowance(
    signer.address,
    SUSHISWAP_FACTORY_ADDRESS
  );
  //   const fethAllowance = ethers.utils.parseUnits( fethAllowanceS);
  //   const stblAllowance = ethers.utils.parseUnits( stblAllowanceS);
  //if less than amount, update allowance with approve()
  if (fethAllowance.lt(amount)) {
    const approveFeth = await fethContract.approve(
      SUSHISWAP_FACTORY_ADDRESS,
      amount.toString()
    );
    await approveFeth.wait();
  }
  if (stblAllowance.lt(amount)) {
    const approveStbl = await stblContract.approve(
      SUSHISWAP_FACTORY_ADDRESS,
      amount.toString()
    );
    await approveStbl.wait();
  }
  //log allowances
  console.log(
    `${
      signer.address
    } allowances for ${SUSHISWAP_FACTORY_ADDRESS}:\nFETH: ${await fethContract.allowance(
      signer.address,
      SUSHISWAP_FACTORY_ADDRESS
    )}\nSTBL: ${await stblContract.allowance(
      signer.address,
      SUSHISWAP_FACTORY_ADDRESS
    )}`
  );
}

async function confirmTx(txDescription: string) {
  const answer = await rl.question(
    `Transaction requested: ${txDescription}\nConfirm ? [y/n]: `
  );
  if (answer.toLowerCase() === "y") {
    return;
  }
  console.log("Transaction not confirmed. Exiting");
  process.exit(1);
}
