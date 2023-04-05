import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { run } from "hardhat";

const rl = readline.createInterface({input, output});

async function main() {
    
    const answer = await rl.question("Select contract to verify: \n Options: \n [0]: Exit \n [1]: FakeETH token \n [2]: Stable token \n");
    
    console.log(`Verifying contract on Etherscan...`);
   
    switch (answer) {
        case '0':
            rl.close();
            return;
        case '1':
            await run("verify:verify", {
                address: "0xa5894Aa86F9df7c5938A986eee9809751088A7D5",
                constructorArguments: ["FakeETH", "ETH"],
            });
            break;
        case '2':
            await run("verify:verify", {
                address: "0x8439701Ea022C4b22B9B118419cC8b2FfC5D67F3",
                constructorArguments: ["NotAScam", "NAS"],
            });
            break;
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
