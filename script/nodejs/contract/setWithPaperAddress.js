// Add a withPaper.com wallet address to the SBT contract (for minting operation)
// NB: You MUST compile the contract first (`forge build` in the root directory)
//
// required variable in .env file:
// PRIVATE_KEY: The private key of the wallet that will interact with the contract
//   (must have some ethers / matic / other to cover gas costs)

const ethers = require('ethers');
const contractBuild = require("../../../out/SBT.sol/SBT.json")
const path = require('node:path');

require('dotenv').config({ path: path.resolve(__dirname, "../.env") })

async function setWithPaperAddress(rpcUrl, contractAddress, withPaperAddress) {
    // Create a provider (the connection to the blockchain network)
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Create a signer (the wallet that will do the transaction)
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Create the contract instance to interact with it
    const contract = new ethers.Contract(contractAddress, contractBuild.abi).connect(signer);

    // Add withPaper address to the contract (change seond parameter to 'false' to remove the address from the contract)
    const tx = await contract.setWithPaperAddress(withPaperAddress, true, { gasPrice: ethers.parseUnits("5", "gwei") });

    return await tx.wait();

    // check the result in CLI: `cast call [--rpc-url <RPC URL>] <CONTRACT ADDRESS> "checkWithPaperAddress(address addr)" <WITHPAPER ADDRESS>`
}

async function main() {
    function printHelp() {
        console.log("usage:");
        console.log("node setWithPaperAddress.js <NETWORK> <CONTRACT ADDRESS> <WITHPAPER ADDRESS>\n");
        console.log("Networks:");
        console.log("polygon\t\tPolygon Mainnet");
        console.log("optimism\t\tOptimism Mainnet");
        console.log("mumbai\t\tMumbai Testnet");
        console.log("optimismSepolia\t\tOptimism Sepolia Testnet");
        console.log("goerli\t\tGoerli Testnet");
        console.log("local\t\tLocal test environment");
    }

    const rpcs = [
        "https://polygon-rpc.com",
        "https://mainnet.optimism.io",
        "https://polygon-mumbai-bor.publicnode.com",
        "https://sepolia.optimism.io",
        "https://ethereum-goerli.publicnode.com",
        "http://127.0.0.1:8545"
    ];

    if (process.argv.length != 5) {
        printHelp();
        return;
    }

    let txReceipt;
    if (process.argv[2] == "polygon")
        txReceipt = await setWithPaperAddress(rpcs[0], process.argv[3], process.argv[4]);
    else if (process.argv[2] == "optimism")
        txReceipt = await setWithPaperAddress(rpcs[1], process.argv[3], process.argv[4]);
    else if (process.argv[2] == "mumbai")
        txReceipt = await setWithPaperAddress(rpcs[2], process.argv[3], process.argv[4]);
    else if (process.argv[2] == "optimismSepolia")
        txReceipt = await setWithPaperAddress(rpcs[3], process.argv[3], process.argv[4]);
    else if (process.argv[2] == "goerli")
        txReceipt = await setWithPaperAddress(rpcs[4], process.argv[3], process.argv[4]);
    else if (process.argv[2] == "local")
        txReceipt = await setWithPaperAddress(rpcs[5], process.argv[3], process.argv[4]);
    else {
        printHelp();
        return;
    }
    console.dir(txReceipt, { depth: null });
}

if (require.main === module) {
    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}

exports.setWithPaperAddress = setWithPaperAddress;