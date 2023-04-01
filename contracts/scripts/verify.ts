import { run } from "hardhat";

async function main() {
    
    console.log("Verifying the contract on Etherscan...");
    await run("verify:verify", {
        address: "0x867FA6bc66EA36065B0C04a0eD49E1978f3Fd48d",
        constructorArguments: [
            10000,
            300000,
            2
        ],
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
