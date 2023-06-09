// Call withPaper.com API to generate a one-time checkout link.
// NB: You MUST compile the contract first (`forge build` in the root directory)
//
// required variable in .env file:
// PAPER_API_KEY: the API key to connect to your withpaper.com account.

const contractBuild = require("../../../out/SBT.sol/SBT.json")
const path = require('node:path');

require('dotenv').config({ path: path.resolve(__dirname, "../.env") })

async function registerContractInPaper(chain, contractAddress) {
    if (!process.env.PAPER_API_KEY) {
        throw new Error("You must define PAPER_API_KEY in a .env file.");
    }

    const date = new Date();

    value = await fetch("https://withpaper.com/api/2022-08-12/register-contract", {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${process.env.PAPER_API_KEY}`,
            "accept": 'application/json',
            "Content-Type": 'application/json',
        },
        body: JSON.stringify({
            "chain": chain,
            "contractAddress": contractAddress,
            "contractType": "CUSTOM_CONTRACT",
            "contractDefinition": contractBuild.abi,
            "displayName": "JS Registration "
                + `${date.getFullYear()}/${date.getMonth()}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
        })
    })

    return value.json();
} x

async function main() {
    function printHelp() {
        console.log("usage:");
        console.log("node registerContractInPaper.js <NETWORK> <CONTRACT ADDRESS>\n");
        console.log("Networks:");
        console.log("polygon\t\tPolygon Mainnet");
        console.log("mumbai\t\tMumbai Testnet");
    }

    const rpcs = [
        "https://polygon-rpc.com",
        "https://polygon-mumbai-bor.publicnode.com"
    ];

    if (process.argv.length != 4) {
        printHelp();
        return;
    }

    let result;
    if (process.argv[2].toLowerCase() == "polygon")
        result = await registerContractInPaper("Polygon", process.argv[3]);
    else if (process.argv[2].toLowerCase() == "mumbai")
        result = await registerContractInPaper("Mumbai", process.argv[3]);
    else {
        printHelp();
        return;
    }

    console.dir(result, { depth: null });
}

if (require.main === module) {
    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}
exports.registerContractInPaper = registerContractInPaper;