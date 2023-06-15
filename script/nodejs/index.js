// General script that deploy & setup the contract with withPaper.
// NB: You MUST compile the contract first (`forge build` in the root directory)
//
// required variable in .env file:
// PRIVATE_KEY: The private key of the wallet that will deploy the contract
//   (must have some ethers / matic / other to cover gas costs)
// PAPER_API_KEY: the API key to connect to your withpaper.com account.


const ethers = require('ethers');

const deployContract = require("./contract/deployContract.js").deploy;
const setWithPaperAddress = require("./contract/setWithPaperAddress.js").setWithPaperAddress;
const registerContractInPaper = require("./withPaper/registerContractInPaper.js").registerContractInPaper;
const createPaperCheckoutLink = require("./withPaper/createPaperCheckoutLink.js").createPaperCheckoutLink;

require('dotenv').config()

const rpcs = [
    "https://polygon-rpc.com",
    "https://polygon-mumbai-bor.publicnode.com",
];

async function setup(network) {
    console.log("Using wallet " + (new ethers.Wallet(process.env.PRIVATE_KEY)).address);
    console.log("on network " + network);

    // Contract deployment
    const contractAddress = await deployContract(rpcs[network === "Polygon" ? 0 : 1]);
    console.log("Contract deployed at address: " + contractAddress);

    // Contract setup for minting with withPaper.com
    // NB: see https://docs.withpaper.com/reference/restrict-calls-to-paper
    let ret;
    if (network === "Polygon") {
        ret = (await setWithPaperAddress(rpcs[0], contractAddress, "0xf3DB642663231887E2Ff3501da6E3247D8634A6D")).status;
        ret &= (await setWithPaperAddress(rpcs[0], contractAddress, "0x5e01a33C75931aD0A91A12Ee016Be8D61b24ADEB")).status;
        ret &= (await setWithPaperAddress(rpcs[0], contractAddress, "0x9E733848061e4966c4a920d5b99a123459670aEe")).status;
    } else {
        ret = (await setWithPaperAddress(rpcs[1], contractAddress, "0x7754B94345BCE520f8dd4F6a5642567603e90E10")).status;
    }
    if (ret === 1) {
        console.log("WithPaper addresses added in contract.");
    } else {
        console.log("Error while adding WithPaper addresses in the contract.");
        console.log("The script will continue. Please check & add WithPaper Addresses manually");
        console.log("see https://docs.withpaper.com/reference/restrict-calls-to-paper");
    }

    // Register contract on withPaper.com dashboard
    const registration = await registerContractInPaper(network, contractAddress);
    console.log("Contract registration on withPaper.com dashboard done. Log:");
    console.dir(registration, { depth: 1 });

    // Create a checkout link (for testing purpose)
    console.dir(await createPaperCheckoutLink(registration.contractId, "MATIC"), { depth: null });
}

async function main() {
    function printHelp() {
        console.log("Deploy the contract to the selected network, register the contract on withPaper.com dashboard\n(if the API key is provided in .env), and set up the contract for minting.");
        console.log("usage:");
        console.log("node index.js <NETWORK>\n");
        console.log("Networks:");
        console.log("polygon\t\tPolygon Mainnet");
        console.log("mumbai\t\tMumbai Testnet");
    }

    if (process.argv.length != 3) {
        printHelp();
        return;
    }

    if (process.argv[2].toLowerCase() === "polygon")
        await setup("Polygon");
    else if (process.argv[2].toLowerCase() === "mumbai")
        await setup("Mumbai");
    else
        printHelp();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});