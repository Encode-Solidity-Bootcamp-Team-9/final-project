import * as dotenv from "dotenv";
import { ethers } from "ethers";
import { ABC, ABC__factory } from "../typechain-types";
import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline/promises';

// For macOS users
import path from "path";
dotenv.config({path : path.resolve(__dirname, "../.env" )});

const rl = readline.createInterface({ input, output });

function parseArguments () {
    const args = process.argv.slice(2);

    if (!args || args.length < 2) {
        throw new Error(
          "Invalid number of arguments. Should provide contract address, function name and optional function parameters.."
        );
    }

    const contractAddress = args[0];
    const functionName = args[1];
    const params = [];
    for (let i = 2; i < args.length; i++) {
        const param = args[i];
        params.push(param);
    };
    
    const argsStruct = {
        contractAddress: contractAddress,
        call: {
            functionName: functionName,
            params: params
        }
    };

    return argsStruct;
}

function setProvider (): ethers.providers.AlchemyProvider {
    const provider = new ethers.providers.AlchemyProvider(
        "goerli",
        process.env.ALCHEMY_API_KEY
    );
    return provider;
}

function setSigner (): ethers.Wallet {
    const provider = setProvider();
    const PRIVATE_KEY = process.env.PRIVATE_KEY as string;
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    return signer;
}

function loadContract (signer: ethers.Signer, contractAddress: string): ethers.Contract {
    const fact = new ABC__factory(signer);
    const contract = fact.attach(contractAddress);
    return contract;
}

async function confirmTx(funName : string, contract : ethers.Contract, args : []) {
    const answer = await rl.question('Confirm the transaction? [y/N]: ');
    if (answer.toLowerCase() === 'y') {
        return;
    }
    console.log("Transaction not confirmed. Exiting.");
    process.exit(1);
}

async function callContractFunction (contract: ethers.Contract , args: any) {
    console.log("Sending transaction ... ");
    let tx;
    switch (args.call.functionName) {
        case 'mint':
            const to = args.call.params[0];
            const amount = ethers.utils.parseEther(args.call.params[1]);
            await confirmTx('mint', contract, args.call.params);
            tx = await contract.mint(to, amount);
            break;
        case 'totalSupply':
            tx = await contract.totalSupply();
            const supply = tx.toString();
            console.log("Total supply: " + supply);
            return;
        default:
            console.log("FUNCTION DOES NOT EXIST");
            return;
    }

    const txResponse = await tx.wait();
    console.log("Tx confirmed. Hash: " + txResponse.transactionHash);
    return;
}

async function main () {

    const args = parseArguments();
    console.log("Contract address: " + args.contractAddress);
    console.log("Function called : " + args.call.functionName);

    const signer = setSigner();
    const contract = loadContract(signer, args.contractAddress);
    await callContractFunction(contract, args);

    console.log("END");
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});