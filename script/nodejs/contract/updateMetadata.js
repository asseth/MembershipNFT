// Change the link to the token metadata in the SBT contract
// NB: You MUST compile the contract first (`forge build` in the root directory)
//
// required variable in .env file:
// PRIVATE_KEY: The private key of the wallet that will interact with the contract
//   (must have some ethers / matic / other to cover gas costs)

const ethers = require('ethers');
const contractBuild = require("../../../out/SBT.sol/SBT.json")
const path = require('node:path');

require('dotenv').config({ path: path.resolve(__dirname, "../.env") })

async function updateMetadata(rpcUrl, contractAddress, metadataURI) {
    // Create a provider (the connection to the blockchain network)
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Create a signer (the wallet that will do the transaction)
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Create the contract instance to interact with it
    const contract = new ethers.Contract(contractAddress, contractBuild.abi).connect(signer);

    // Change metadata URI in the contract (owner only)
    const tx = await contract.setBaseURI(metadataURI, { gasPrice: ethers.parseUnits("5", "gwei") });

    return await tx.wait();
}

async function main() {
    function printHelp() {
        console.log("usage:");
        console.log("node updateMetadata.js <NETWORK> <CONTRACT ADDRESS> <METADATA URI>\n");
        console.log("Networks:");
	console.log("optimism\t\tOptimism mainet");
	console.log("optimism-sepolia\t\tOptimism sepolia");
        console.log("polygon\t\tPolygon Mainnet");
        console.log("mumbai\t\tMumbai Testnet");
        console.log("goerli\t\tGoerli Testnet");
        console.log("local\t\tLocal test environment");
    }

    const rpcs = [
	"https://mainnet.optimism.io",
	"https://sepolia.optimism.io/",
        "https://polygon-rpc.com",
        "https://polygon-mumbai-bor.publicnode.com",
        "https://ethereum-goerli.publicnode.com",
        "http://127.0.0.1:8545"
    ];

    if (process.argv.length != 5) {
        printHelp();
        return;
    }

    let txReceipt;
    if (process.argv[2] == "optimism")
        txReceipt = await updateMetadata(rpcs[0], process.argv[3], process.argv[4]);
    else if (process.argv[2] == "polygon-sepolia")
        txReceipt = await updateMetadata(rpcs[1], process.argv[3], process.argv[4]);    
    else if (process.argv[2] == "polygon")
        txReceipt = await updateMetadata(rpcs[2], process.argv[3], process.argv[4]);
    else if (process.argv[2] == "mumbai")
        txReceipt = await updateMetadata(rpcs[3], process.argv[3], process.argv[4]);
    else if (process.argv[2] == "goerli")
        txReceipt = await updateMetadata(rpcs[4], process.argv[3], process.argv[4]);
    else if (process.argv[2] == "local")
        txReceipt = await updateMetadata(rpcs[5], process.argv[3], process.argv[4]);
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

exports.updateMetadata = updateMetadata;
