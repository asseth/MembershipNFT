// Deploy the SBT contract
// NB: You MUST compile the contract first (`forge build` in the root directory)
//
// required variable in .env file:
// PRIVATE_KEY: The private key of the wallet that will deploy the contract
//   (must have some ethers / matic / other to cover gas costs)

const ethers = require('ethers');
const contractBuild = require("../../../out/SBT.sol/SBT.json")
const path = require('node:path');

require('dotenv').config({ path: path.resolve(__dirname, "../.env") })

async function deploy(rpcUrl) {
    // Create a provider (the connection to the blockchain network)
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Create a signer (the wallet that will do the deployment)
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Create the factory instance to deploy the SBT contract
    const factory = new ethers.ContractFactory(contractBuild.abi, contractBuild.bytecode).connect(signer);

    // Deploy the contract
    const contract = await factory.deploy("SBT name1", "SBT Symbol1", { gasPrice: ethers.parseUnits("5", "gwei") });

    return await contract.getAddress();
}

async function main() {
    function printHelp() {
        console.log("usage:");
        console.log("node deployContract.js <NETWORK>\n");
        console.log("Networks:");
        console.log("polygon\t\tPolygon Mainnet");
        console.log("mumbai\t\tMumbai Testnet");
        console.log("local\t\tLocal test environment");
    }

    const rpcs = [
        "https://polygon-rpc.com",
        "https://polygon-mumbai-bor.publicnode.com",
        "https://ethereum-goerli.publicnode.com",
        "http://127.0.0.1:8545"
    ];

    if (process.argv.length != 3) {
        printHelp();
        return;
    }

    let address;
    if (process.argv[2] == "polygon")
        address = await deploy(rpcs[0]);
    else if (process.argv[2] == "mumbai")
        address = await deploy(rpcs[1]);
    else if (process.argv[2] == "goerli")
        address = await deploy(rpcs[2]);
    else if (process.argv[2] == "local")
        address = await deploy(rpcs[3]);
    else {
        printHelp();
        return;
    }
    console.log("new contract address: " + address)
}

if (require.main === module) {
    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}

exports.deploy = deploy;