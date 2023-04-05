//Deploys the two ERC20 tokens that will be used in the arbitrage pools.
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import * as dotenv from "dotenv";
import { Contract, ethers, Wallet } from "ethers";
import FakeETH from "../artifacts/contracts/FakeETH.sol/FakeETH.json";
import NAS from "../artifacts/contracts/NAS.sol/NAS.json";

// For macOS users
import path from "path";
import { keccak256, toUtf8Bytes } from "ethers/lib/utils";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

let signer: Wallet;

// const FETH_ADDRESS = "0xAf1C3d676a63F69580c10dF835053E9B911908D0";
// const NAS_ADDRESS = "0x96A6884433D93a82033B4877a598beFe7FF8FE90";
const FETH_ADDRESS = "0x878C07588bA59912538b5d7f49Edd39CE8d36EfE";
const NAS_ADDRESS = "0xFD28f091BBbB85A9c41B5Da029744a0A7C1A501A";
let fethContract: Contract;
let nasContract: Contract;

const rl = readline.createInterface({ input, output });

async function main() {
  await getSigner();

  fethContract = new ethers.Contract(FETH_ADDRESS, FakeETH.abi, signer);

  nasContract = new ethers.Contract(NAS_ADDRESS, NAS.abi, signer);

  const answer = await rl.question(
    "Actions: \n Options: \n [1]: Mint FakeETH token \n [2]: Mint NAS token \n [3]: Get token balance \n [4]: Give minter role for both tokens \n [5]: Check minter role \n"
  );

  switch (answer) {
    case "1":
      await mint(fethContract);
      break;
    case "2":
      await mint(nasContract);
      break;
    case "3":
      const address = await rl.question("Account address: ");
      let fethBalance = ethers.utils.formatEther(
        await fethContract.balanceOf(address)
      );
      let stblBalance = ethers.utils.formatEther(
        await nasContract.balanceOf(address)
      );
      console.log(
        `Account ${address} has ${fethBalance} FETH and ${stblBalance} STBL`
      );
      break;
    case "4":
      const grantee = await rl.question("Account address: ");
      await confirmTx(`Grant ${grantee} minter role for FETH and STBL`);
      const grantFethMinter = await fethContract.grantRole(
        keccak256(toUtf8Bytes("MINTER_ROLE")),
        grantee
      );
      const grantStblMinter = await nasContract.grantRole(
        keccak256(toUtf8Bytes("MINTER_ROLE")),
        grantee
      );
      await grantFethMinter.wait();
      await grantStblMinter.wait();
      console.log(`Minter role granted.`);
      break;
    case "5":
      const account = await rl.question("Account address: ");
      const fethMinter = await fethContract.hasRole(
        keccak256(toUtf8Bytes("MINTER_ROLE")),
        account
      );
      const stblMinter = await nasContract.hasRole(
        keccak256(toUtf8Bytes("MINTER_ROLE")),
        account
      );
      console.log(
        `Account ${account} has minter role for:\nFETH: ${fethMinter}\nSTBL: ${stblMinter}`
      );
      break;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function getSigner() {
  const provider = new ethers.providers.AlchemyProvider(
    "maticmum",
    process.env.ALCHEMY_API_KEY
  );
  const wallet = new ethers.Wallet(getEnvVariableValue("PRIVATE_KEY"));
  signer = wallet.connect(provider);
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

async function mint(tokenContract: Contract) {
  const amount = await rl.question("Amount of tokens to mint (in WEI): ");
  await confirmTx(
    `Mint ${ethers.utils.formatEther(amount)} tokens to ${signer.address}`
  );
  const mintTx = await tokenContract.mint(signer.address, amount);
  await mintTx.wait();
  console.log(`Tokens minted.`);
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
