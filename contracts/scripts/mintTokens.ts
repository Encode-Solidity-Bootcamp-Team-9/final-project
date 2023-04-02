//Deploys the two ERC20 tokens that will be used in the arbitrage pools.
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import * as dotenv from "dotenv";
import { Contract, ethers, Wallet } from "ethers";
import FakeETH from '../artifacts/contracts/FakeETH.sol/FakeETH.json';
import Stable from '../artifacts/contracts/Stable.sol/Stable.json';


// For macOS users
import path from "path";
import { keccak256 } from "ethers/lib/utils";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

let signer: Wallet;

const FETH_ADDRESS = "0x7d5D9602eDc1cA865FD38B5CcAfF7d464C4168A1";
const STBL_ADDRESS = "0xab2Be03f150278aa83BcA0b73aA8Ac882aAd2851";
let fethContract: Contract;
let stblContract: Contract;

const rl = readline.createInterface({input, output});

async function main() {

    await getSigner();

    fethContract = new ethers.Contract(
        FETH_ADDRESS,
        FakeETH.abi,
        signer
    );

    stblContract = new ethers.Contract(
        STBL_ADDRESS,
        Stable.abi,
            signer
    );

    const answer = await rl.question("Actions: \n Options: \n [1]: Mint FakeETH token \n [2]: Mint Stable token \n [3]: Get token balance \n [4]: Give minter role for both tokens \n [5]: Check minter role \n");

    switch (answer) {
        case '1':
            
            await mint(fethContract);
            break;
        case '2':
            stblContract = new ethers.Contract(
                STBL_ADDRESS,
                Stable.abi,
                signer
            );
            await mint(stblContract);
            break;
        case '3':
            const address = await rl.question("Account address: ");
            let fethBalance = ethers.utils.formatEther(await fethContract.balanceOf(address));
            let stblBalance = ethers.utils.formatEther(await stblContract.balanceOf(address));
            console.log(`Account ${address} has ${fethBalance} FETH and ${stblBalance} STBL`);
            break;
        case '4':
            const grantee = await rl.question("Account address: ");
            await confirmTx(`Grant ${grantee} minter role for FETH and STBL`);
            const grantFethMinter = await fethContract.grantRole(ethers.utils.formatBytes32String("MINTER_ROLE"), grantee);
            const grantStblMinter = await stblContract.grantRole(ethers.utils.formatBytes32String("MINTER_ROLE"), grantee);
            await grantFethMinter.wait();
            await grantStblMinter.wait();
            console.log(`Minter role granted.`);
            break;
        case '5':
            const account = await rl.question("Account address: ");
            const fethMinter = await fethContract.hasRole(ethers.utils.formatBytes32String('MINTER_ROLE'), account);
            const stblMinter = await stblContract.hasRole(ethers.utils.formatBytes32String('MINTER_ROLE'), account);
            console.log(`Account ${account} has minter role for:\nFETH: ${fethMinter}\nSTBL: ${stblMinter}`);
            break;
        }

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

async function mint(tokenContract: Contract) {
    const amount = await rl.question("Amount of tokens to mint (in WEI): ");
    await confirmTx(`Mint ${ethers.utils.formatEther(amount)} tokens to ${signer.address}`);
    const mintTx = await tokenContract.mint(signer.address, amount);
    await mintTx.wait();
    console.log(`Tokens minted.`);
}

async function confirmTx(txDescription: string) {
    const answer = await rl.question(`Transaction requested: ${txDescription}\nConfirm ? [y/n]: `);
    if (answer.toLowerCase() === 'y') {
        return;
    }
    console.log("Transaction not confirmed. Exiting");
    process.exit(1);
}