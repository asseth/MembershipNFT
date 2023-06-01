// Call withPaper.com API to generate a one-time checkout link.
//
// required variable in .env file:
// PAPER_API_KEY: the API key to connect to your withpaper.com account.

const path = require('node:path');

require('dotenv').config({ path: path.resolve(__dirname, "../.env") })

async function createPaperCheckoutLink(paperContractID, currency) {
    if (!process.env.PAPER_API_KEY) {
        throw new Error("You must define PAPER_API_KEY in a .env file.");
    }

    if (currency != "ETH" && currency != "MATIC") {
        throw new Error("You must use ETH or MATIC.");
    }

    value = await fetch("https://withpaper.com/api/2022-08-12/checkout-link-intent", {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${process.env.PAPER_API_KEY}`,
            "accept": 'application/json',
            "Content-Type": 'application/json',
        },
        // todo: personalize the checkout content (title, description, ...)
        body: JSON.stringify({
            "contractId": paperContractID.toString(),
            "title": "test",
            "description": "Zapier test",
            "imageUrl": "https://unsplash.it/240/240",
            "expiresInMinutes": 15,
            "limitPerTransaction": 1,
            "quantity": 1,
            "redirectAfterPayment": false,
            "mintMethod": {
                "name": "mint",
                "args": { "to": "$WALLET" },
                "payment": { "currency": currency, "value": "0 * $QUANTITY" }
            },
            "feeBearer": "SELLER",
            "hideNativeMint": true,
            "hidePaperWallet": true,
            "hideExternalWallet": false,
            "hidePayWithCard": true,
            "hidePayWithCrypto": true,
            "hidePayWithIdeal": true,
            "sendEmailOnTransferSucceeded": false,
            "brandDarkMode": true,
            "brandButtonShape": "full",
            "brandColorScheme": "pink"
        })
    })

    return value.json();
}

async function main() {
    function printHelp() {
        console.log("usage:");
        console.log("node createPaperCheckoutLink.js <PAPER_CONTRACT_ID> <CURRENCY>\n");
        console.log("Currency:");
        console.log("ETH, MATIC");
    }

    if (process.argv.length != 4) {
        printHelp();
        return;
    }
    console.dir(await createPaperCheckoutLink(process.argv[2], process.argv[3]), { depth: null });
}

if (require.main === module) {
    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}

exports.createPaperCheckoutLink = createPaperCheckoutLink;