import * as readline from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"
import * as dotenv from "dotenv";
import { ethers, Wallet } from "ethers";
import { Arbitrage, ArbitrageToken, ArbitrageToken__factory, Arbitrage__factory } from "../typechain-types";
import { run } from "hardhat"

// For macOS users
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

let contract: Arbitrage;
let tokenContract: ArbitrageToken;
let signer: Wallet;

const rl = readline.createInterface({input, output});

async function main() {
    chooseEnv();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})

async function chooseEnv() {
    const answer = await rl.question("Select action: \n Options: \n [0]: Exit \n [1]: Connect to existing Arbitrage contract on Goerli \n [2]: Deploy new Arbitrage contract on Goerli \n");
    console.log(`Selected: ${answer}\n`);
    switch (answer) {
                case '0':
                    rl.close();
                    return;
                case '1':
                    await getSigner();
                    const contractFactory = new Arbitrage__factory(signer);
                    const answer = await rl.question("Contract address: ");
                    contract = contractFactory.attach(answer);
                    mainMenu();
                    break;
                case '2':
                    await getSigner();
                    await deployContract(signer);
                    mainMenu();
                    break;
    }
}

async function mainMenu() {
    menuOptions();
}
        
async function menuOptions() {
    const answer = await rl.question("Select oepration: \n Options: \n [0]: Exit \n [1]: Create Arbitrage Token \n [2]: Purchase tokens \n [3]: Return tokens \n");
    console.log(`Selected: ${answer}\n`);
    switch (answer) {
                case '0':
                    rl.close();
                    return;
                case '1':
                    await createArbitrageToken();
                    //await attachArbitrageToken();
                    mainMenu();
                    break;
                case '2':
                    await purchaseTokens();
                    mainMenu();
                    break;
                case '3':
                    await returnTokens();
                    mainMenu();
                    break;
            }
}        

async function getSigner() {
    const provider = new ethers.providers.AlchemyProvider(
        "goerli",
        getEnvVariableValue("ALCHEMY_API_KEY")
    );
    const wallet = new ethers.Wallet(getEnvVariableValue("PRIVATE_KEY"));
    signer = wallet.connect(provider);
    console.log(`Wallet address: ${wallet.address}`);
    const balance = await signer.getBalance();
    console.log(`Balance: ${ethers.utils.formatEther(balance)} ETH`);
}

async function deployContract(signer: Wallet) {
    //Set parameters:
    const purchaseRatio = await rl.question("Token purchase ratio (for 1 ETH): ");
    const stakeDuration = await rl.question("Staking period duration (in seconds): ");
    const interestRate = await rl.question("Staking interest rate (in percentage point): ");
    await confirmTx(`Deploy arbitrage contract with: token purchase ratio of ${purchaseRatio}/ETH; staking duration of ${stakeDuration} seconds; staking interest rate of ${interestRate}%.`);
    //deploy contract
    console.log("Deploying contract");
    const contractFactory = new Arbitrage__factory(signer);
    contract = await contractFactory.deploy(purchaseRatio, stakeDuration, interestRate);
    const deployReceipt = await contract.deployTransaction.wait();
    //log contract information
    console.log(`Contract deployed at ${contract.address}.`);
    console.log(`gasUsed: ${deployReceipt.gasUsed}, Cost: ${ethers.utils.formatEther(deployReceipt.effectiveGasPrice.mul(deployReceipt.gasUsed))} ETH`);
    console.log(`Set parameters:\nPurchase ratio: ${await contract.purchaseRatio()} tokens per ETH\nstakeDuration: ${await contract.stakeDuration()} seconds\ninterestRate: ${await contract.interestRate()}%`);
    //verify contract
    console.log("Verifying the contract on Etherscan...");
    await run("verify:verify", {
        address: contract.address,
        constructorArguments: [
            purchaseRatio,
            stakeDuration,
            interestRate
        ],
    });
    console.log("Contract verified")
}

function getEnvVariableValue(varName: string): string {
    const varValue = process.env[varName];
    if (!varValue || varValue.length < 1) {
        throw new Error(`Must provide a valid value for key ${varName}. Check your.env file!`);
    };
    return varValue;
}

async function createArbitrageToken() {
    const name = await rl.question("Token name: ");
    const symbol = await rl.question("Token symbol: ");
    await confirmTx(`create ${name} Token (${symbol})`);
    await contract.createArbitrageToken(name, symbol);
    const tokenAddress = await contract.arbitrageToken();
    console.log(`${tokenContract.name()} token (${tokenContract.symbol()}) deployed at address: ${tokenAddress}`);
}

async function attachArbitrageToken() {
    const tokenAddress = await contract.arbitrageToken();
    const tokenFactory = new ArbitrageToken__factory(signer);
    tokenContract = tokenFactory.attach(tokenAddress);
    console.log(`${tokenContract.name()} token (${tokenContract.symbol()}) deployed at address: ${tokenAddress}`);
}

async function purchaseTokens() {
    console.log(`Balance: ${await signer.getBalance()} WEI`);
    const purchaseValue = ethers.BigNumber.from(await rl.question("How much WEI do you want to exchange?"));
    const purchaseRatio = await contract.purchaseRatio();
    confirmTx(`Exchange ${purchaseValue} WEI to purchase ${purchaseValue.mul(purchaseRatio)} tokens`)
    await contract.purchaseTokens({value: purchaseValue});
}

async function returnTokens() {
    console.log(`Token amount: ${await tokenContract.balanceOf(signer.address)} tokens`);
    const returnAmount = ethers.BigNumber.from(await rl.question("How many tokens do you wish to return?"));
    const purchaseRatio = await contract.purchaseRatio();
    confirmTx(`Return ${returnAmount} tokens to receive ${returnAmount.div(purchaseRatio.div(2))} WEI`);
    await contract.returnTokens(returnAmount);
}

async function confirmTx(funName: string) {
    const answer = await rl.question(`Transaction requested: ${funName}\nConfirm ? [y/n]: `);
    if (answer.toLowerCase() === 'y') {
        return;
    }
    console.log("Transaction not confirmed. Exiting");
    process.exit(1);
}