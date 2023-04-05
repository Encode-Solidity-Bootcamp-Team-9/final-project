import { ethers } from "ethers";
import { argv } from "node:process";
import * as dotenv from "dotenv";
import { Arbitrage__factory } from "../typechain-types";

// For macOS users
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") })

const FETH_TOKEN_ADDRESS = "0xC97727ba966F6C52580121862dF2771A1Ca0F28a";
const FAUCET_AMOUNT = ethers.utils.parseEther("10");
const NAS_TOKEN_ADDRESS = "0x9622F58d9745bAfaeABB7712a69DcdBdcF72e188";
const STAKE_LOCK_TIME_SECONDS = 30 * 60; //30 minutes
const SUSHI_ROUTER_ADDRESS = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";
const UNI_ROUTER_ADDRESS = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

async function main() {

    // Setting provider
    const provider = new ethers.providers.AlchemyProvider(
        "maticmum",
        process.env.ALCHEMY_API_KEY
    );

    // Create / Initiate our wallet
    const walletPrivateKey = process.env.PRIVATE_KEY;
    if (!walletPrivateKey || walletPrivateKey.length < 1) {
        throw new Error("Must provide a valid private key. Check your.env file!");
    };

    const wallet = new ethers.Wallet(walletPrivateKey);

    //connect wallet to the provider
    const signer = wallet.connect(provider);

    console.log("Wallet address: " + wallet.address);

    //retrieve signer balance
    const balance = await signer.getBalance();
    console.log("Balance: " + balance.toString());

    console.log("Deploying Token contract");

    // Get contract factory
    const fact = new Arbitrage__factory(signer);

    // Deploying
    const contract = await fact.deploy(
        FETH_TOKEN_ADDRESS, 
        FAUCET_AMOUNT, 
        NAS_TOKEN_ADDRESS, 
        STAKE_LOCK_TIME_SECONDS, 
        SUSHI_ROUTER_ADDRESS, 
        UNI_ROUTER_ADDRESS
    );

    // Waiting for contract address to be mined
    const deployTxReceipt = await contract.deployTransaction.wait();

    console.log("Deployed at " + contract.address);

};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});