import { ethers } from "ethers";
import { argv } from "node:process";
import * as dotenv from "dotenv";
import { MiddleMan__factory } from "../typechain-types";

// For macOS users
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") })

async function main() {

    // Reading args from command line
    const args = argv.slice(2);

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
    const fact = new MiddleMan__factory(signer);

    // Deploying
    const contract = await fact.deploy();

    // Waiting for contract address to be mined
    const deployTxReceipt = await contract.deployTransaction.wait();

    console.log("Deployed at " + contract.address);

};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});