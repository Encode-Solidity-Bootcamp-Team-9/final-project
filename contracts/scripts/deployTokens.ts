//Deploys the two ERC20 tokens that will be used in the arbitrage pools.
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import * as dotenv from "dotenv";
import { ethers, Wallet } from "ethers";
import { FakeETH, FakeETH__factory, Stable, Stable__factory } from "../typechain-types";

// For macOS users
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

let signer: Wallet;
let fethContract: FakeETH;
let stblContract: Stable;

const rl = readline.createInterface({input, output});

async function main() {

    await getSigner();

    await confirmTx(`Deploy FETH and STBL tokens`);

    console.log(`Deploying tokens...`)

    const fethFactory = new FakeETH__factory(signer);
    const stblFactory = new Stable__factory(signer);

    fethContract = await fethFactory.deploy();
    stblContract = await stblFactory.deploy();

    const fethReceipt = await fethContract.deployTransaction.wait();
    const stblReceipt = await stblContract.deployTransaction.wait();

    const gasUsed = fethReceipt.gasUsed.add(stblReceipt.gasUsed);
    const txCost = fethReceipt.effectiveGasPrice.mul(fethReceipt.gasUsed).add(
        stblReceipt.effectiveGasPrice.mul(stblReceipt.gasUsed)
    );

    console.log(`gasUsed: ${gasUsed}, Cost: ${ethers.utils.formatEther(txCost)} ETH`)
    console.log(`FakeETH token address: ${fethContract.address}`);
    console.log(`Stable token address: ${stblContract.address}`);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})

async function getSigner() {
    const provider = new ethers.providers.AlchemyProvider(
        "goerli",
        getEnvVariableValue("ALCHEMY_API_KEY")
    );
    const wallet = new ethers.Wallet(getEnvVariableValue("PRIVATE_KEY"));
    signer = wallet.connect(provider);
    const balance = await signer.getBalance();
    console.log(`Signer address: ${wallet.address}\nBalance: ${ethers.utils.formatEther(balance)} ETH`);
}

function getEnvVariableValue(varName: string): string {
    const varValue = process.env[varName];
    if (!varValue || varValue.length < 1) {
        throw new Error(`Must provide a valid value for key ${varName}. Check your.env file!`);
    };
    return varValue;
}

async function confirmTx(txDescription: string) {
    const answer = await rl.question(`Transaction requested: ${txDescription}\nConfirm ? [y/n]: `);
    if (answer.toLowerCase() === 'y') {
        return;
    }
    console.log("Transaction not confirmed. Exiting");
    process.exit(1);
}