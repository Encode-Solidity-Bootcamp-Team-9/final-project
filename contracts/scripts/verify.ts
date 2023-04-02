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
                address: "0x7d5D9602eDc1cA865FD38B5CcAfF7d464C4168A1",
                constructorArguments: ["FakeETH", "ETH"],
            });
            break;
        case '2':
            await run("verify:verify", {
                address: "0xab2Be03f150278aa83BcA0b73aA8Ac882aAd2851",
                constructorArguments: ["Stable", "STBL"],
            });
            break;
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
