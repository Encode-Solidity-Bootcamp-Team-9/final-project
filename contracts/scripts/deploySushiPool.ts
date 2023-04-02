//deploys SushiSwap liquidity pool FETH - STBL
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import * as dotenv from "dotenv";
import * as ISushiswapV2Factory from "@uniswap/v2-core/build/IUniswapV2Factory.json";
import { ethers, Wallet } from "ethers";

// For macOS users
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });


//Token addresses
const FETH_ADDRESS = "0x7d5D9602eDc1cA865FD38B5CcAfF7d464C4168A1";
const STBL_ADDRESS = "0xab2Be03f150278aa83BcA0b73aA8Ac882aAd2851";

//Sushiswap factory address
const SUSHISWAP_FACTORY_ADDRESS = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";
let signer: Wallet;
let sushiSwapContract;
let pairAddress: string;

const rl = readline.createInterface({input, output});

async function main() {

    await getSigner();

    sushiSwapContract = new ethers.Contract(
        SUSHISWAP_FACTORY_ADDRESS,
        ISushiswapV2Factory.abi,
        signer
    );

    //create pair
    await confirmTx(`Create FETH <=> STBL pair`);
    
    const createPair = await sushiSwapContract.createPair(FETH_ADDRESS, STBL_ADDRESS);
    const createPairTx = await createPair.wait();
    console.log(`Create new FETH-STBL pair (tx hash: ${createPairTx.hash})`);

    //get pair address
    pairAddress = await sushiSwapContract.getPair(FETH_ADDRESS, STBL_ADDRESS);
    console.log(`FETH-STBL pair address: ${pairAddress}`);
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
