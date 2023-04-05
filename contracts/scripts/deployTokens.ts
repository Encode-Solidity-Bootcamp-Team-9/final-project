//Deploys the two ERC20 tokens that will be used in the arbitrage pools.
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import * as dotenv from "dotenv";
import { ethers, Wallet } from "ethers";
import { FakeETH, FakeETH__factory, NAS, NAS__factory } from "../typechain-types";

// For macOS users
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

let signer: Wallet;
let fethContract: FakeETH;
let nasContract: NAS;

const rl = readline.createInterface({input, output});

async function main() {

    await getSigner();

    await confirmTx(`Deploy FETH and NAS tokens`);

    console.log(`Deploying tokens...`)

    const fethFactory = new FakeETH__factory(signer);
    const nasFactory = new NAS__factory(signer);

    fethContract = await fethFactory.deploy();
    nasContract = await nasFactory.deploy();

    const fethReceipt = await fethContract.deployTransaction.wait();
    const nasReceipt = await nasContract.deployTransaction.wait();

    const gasUsed = fethReceipt.gasUsed.add(nasReceipt.gasUsed);
    const txCost = fethReceipt.effectiveGasPrice.mul(fethReceipt.gasUsed).add(
        nasReceipt.effectiveGasPrice.mul(nasReceipt.gasUsed)
    );

    console.log(`gasUsed: ${gasUsed}, Cost: ${ethers.utils.formatEther(txCost)} `)
    console.log(`FakeETH token address: ${fethContract.address}`);
    console.log(`NAS token address: ${nasContract.address}`);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})

async function getSigner() {
    const provider = new ethers.providers.AlchemyProvider(
        "maticmum",
        process.env.ALCHEMY_API_KEY
    );
    const wallet = new ethers.Wallet(getEnvVariableValue("PRIVATE_KEY"));
    signer = wallet.connect(provider);
    const balance = await signer.getBalance();
    console.log(`Signer address: ${wallet.address}\nBalance: ${ethers.utils.formatEther(balance)} MATIC`);
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