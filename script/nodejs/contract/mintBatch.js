// Mint tokens to multiple addresses sequentially
// NB: You MUST compile the contract first (`forge build` in the root directory)
//
// required variable in .env file:
// PRIVATE_KEY: The private key of the wallet that will interact with the contract
//   (must have some ethers / matic / other to cover gas costs)

const ethers = require('ethers');
const fs = require('fs');
const path = require('node:path');
const contractBuild = require("../../../out/SBT.sol/SBT.json") // CHANGE THIS

require('dotenv').config({ path: path.resolve(__dirname, "../.env") })

async function mintToAddress(contract, address, index, total) {
    console.log(`\n[${index + 1}/${total}] Minting to address: ${address}`);
    
    try {
        // Call the mint function with the address parameter
        const tx = await contract.mint(address, { 
            gasPrice: ethers.parseUnits("5", "gwei") 
        });
        
        console.log(`Transaction sent: ${tx.hash}`);
        console.log('Waiting for confirmation...');
        
        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        
        console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
        console.log(`Gas used: ${receipt.gasUsed.toString()}`);
        
        return receipt;
    } catch (error) {
        console.error(`❌ Error minting to ${address}:`, error.message);
        throw error;
    }
}

async function mintBatch(rpcUrl, contractAddress, addressesFile) {
    // Read addresses from file
    const addressesContent = fs.readFileSync(addressesFile, 'utf-8');
    const addresses = addressesContent
        .split('\n')
        .map(addr => addr.trim())
        .filter(addr => addr.length > 0); // Remove empty lines
    
    console.log(`Found ${addresses.length} addresses to mint`);
    
    // Validate addresses
    for (let i = 0; i < addresses.length; i++) {
        if (!ethers.isAddress(addresses[i])) {
            throw new Error(`Invalid address at line ${i + 1}: ${addresses[i]}`);
        }
    }
    
    // Create a provider (the connection to the blockchain network)
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Create a signer (the wallet that will do the transaction)
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log(`Using wallet: ${signer.address}`);
    
    // Get wallet balance
    const balance = await provider.getBalance(signer.address);
    console.log(`Wallet balance: ${ethers.formatEther(balance)} ETH`);
    
    // Create the contract instance to interact with it
    const contract = new ethers.Contract(contractAddress, contractBuild.abi).connect(signer);
    
    const receipts = [];
    let successCount = 0;
    let failCount = 0;
    
    // Mint to each address sequentially
    for (let i = 0; i < addresses.length; i++) {
        try {
            const receipt = await mintToAddress(contract, addresses[i], i, addresses.length);
            receipts.push({ address: addresses[i], receipt, success: true });
            successCount++;
        } catch (error) {
            receipts.push({ address: addresses[i], error: error.message, success: false });
            failCount++;
            
            // Ask user if they want to continue after an error
            console.log('\nDo you want to continue with the next address? (yes/no)');
            // For automated scripts, you might want to auto-continue or auto-stop
            // For now, we'll continue automatically
            console.log('Continuing with next address...');
        }
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('MINTING SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total addresses: ${addresses.length}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log('='.repeat(50));
    
    return receipts;
}

async function main() {
    function printHelp() {
        console.log("usage:");
        console.log("node mintBatch.js <NETWORK> <CONTRACT ADDRESS> <ADDRESSES FILE>\n");
        console.log("Networks:");
        console.log("optimism\t\tOptimism mainnet");
        console.log("optimism-sepolia\tOptimism sepolia");
        console.log("polygon\t\t\tPolygon Mainnet");
        console.log("mumbai\t\t\tMumbai Testnet");
        console.log("goerli\t\t\tGoerli Testnet");
        console.log("local\t\t\tLocal test environment");
        console.log("\nAddresses file: text file with one address per line");
    }

    const rpcs = {
        "optimism": "https://mainnet.optimism.io",
        "optimism-sepolia": "https://sepolia.optimism.io/",
        "polygon": "https://polygon-rpc.com",
        "mumbai": "https://polygon-mumbai-bor.publicnode.com",
        "goerli": "https://ethereum-goerli.publicnode.com",
        "local": "http://127.0.0.1:8545"
    };

    if (process.argv.length != 5) {
        printHelp();
        return;
    }

    const network = process.argv[2];
    const contractAddress = process.argv[3];
    const addressesFile = process.argv[4];

    // Check if addresses file exists
    if (!fs.existsSync(addressesFile)) {
        console.error(`Error: File not found: ${addressesFile}`);
        return;
    }

    // Check if network is valid
    if (!rpcs[network]) {
        console.error(`Error: Unknown network: ${network}`);
        printHelp();
        return;
    }

    console.log(`Network: ${network}`);
    console.log(`Contract: ${contractAddress}`);
    console.log(`Addresses file: ${addressesFile}\n`);

    const receipts = await mintBatch(rpcs[network], contractAddress, addressesFile);
    
    // Optionally save results to a JSON file
    const resultsFile = `mint-results-${Date.now()}.json`;
    fs.writeFileSync(resultsFile, JSON.stringify(receipts, null, 2));
    console.log(`\nDetailed results saved to: ${resultsFile}`);
}

if (require.main === module) {
    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}

exports.mintBatch = mintBatch;
