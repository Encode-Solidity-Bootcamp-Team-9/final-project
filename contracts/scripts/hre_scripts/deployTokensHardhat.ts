//Deploys the two ERC20 tokens that will be used in the arbitrage pools.
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { ethers } from "hardhat";


const rl = readline.createInterface({input, output});

async function main() {

    await confirmTx(`Deploy FETH and STBL tokens`);

    console.log(`Deploying tokens...`)

    const fethFactory = await ethers.getContractFactory("FakeETH");
    const stblFactory = await ethers.getContractFactory("Stable");

    const fethContract = await fethFactory.deploy();
    const stblContract = await stblFactory.deploy();

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


async function confirmTx(txDescription: string) {
    const answer = await rl.question(`Transaction requested: ${txDescription}\nConfirm ? [y/n]: `);
    if (answer.toLowerCase() === 'y') {
        return;
    }
    console.log("Transaction not confirmed. Exiting");
    process.exit(1);
}