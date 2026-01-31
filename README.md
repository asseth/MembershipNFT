# MembershipNFT
MembershipNFT for Ethereum-France

### Table of content
- [MembershipNFT](#membershipnft)
    - [Table of content](#table-of-content)
  - [Project structure](#project-structure)
      - [`src/`](#src)
      - [`test/`](#test)
      - [`lib/`](#lib)
      - [`script/nodejs/`](#scriptnodejs)
  - [How to use this repo?](#how-to-use-this-repo)
  - [How does it works ?](#how-does-it-works-)
    - [About function restrictions](#about-function-restrictions)
  - [Licence](#licence)

---

## Project structure

#### `src/`
Contains the contract implementation.

#### `test/`

Contains the contract tests implementation, in Solidity (using [foundry testing framework](https://book.getfoundry.sh/forge/tests)).

#### `lib/`

Contains the code of the Solidity library used for implementation and testing. They are stored as git submodules (using [foundry dependencies system](https://book.getfoundry.sh/projects/dependencies)).

#### `script/nodejs/`

Contains any utilitary scripts for interacting with the contract. You will find JS scripts for contract direct interaction and [withpaper.com](https://withpaper.com/) interaction.


## How to use this repo?

To use this repo, you first need to install [Foundry](https://book.getfoundry.sh/getting-started/installation) and [nodejs](https://nodejs.org/en/download).

Also, remember to clone the submodules as you initialize this repo, either by adding the `--recurse-submodules` parameter on clone or using the commands `git submodule init` and `git submodule update`.

To use the nodejs scripts, you will need environment variables filled in a `.env` file in the `script/nodejs/` folder. See the [`.env.template`](./script/nodejs/.env.template) file for more informations.

Please note that all blockchain interactions (contract deployment and transactions) use a wallet **whose private key is provided in a .env file**. I recommend using a burner wallet to avoid leaking and compromising your wallet.

```bash
### forge examples ###
# build the contract (you will then find the ABI and other data in the `out/` directory)
forge build

# run the tests
forge test

# export contract code
forge flatten src/SBT.sol

# Build & host locally the contract documentation
forge doc --build
forge doc --serve


### custom scripts ###
# NB: you can always run a script without argument to print the usage.
# NB: You must install the required libraries first:
cd script/nodejs
npm install

# Deploy the contract
cd script/nodejs
node contract/deployContract.js <NETWORK>

# Add a withpaper.com wallet address to the contract
cd script/nodejs
node contract/setWithPaperAddress.js <NETWORK> <CONTRACT ADDRESS> <WITHPAPER ADDRESS>

# Change the owner of the contract
cd script/nodejs
node contract/transferOwnership.js <NETWORK> <CONTRACT ADDRESS> <NEW OWNER ADDRESS>

# Change the token metadata URI
cd script/nodejs
node contract/updateMetadata.js <NETWORK> <CONTRACT ADDRESS> <METADATA URI>

# Register a contract on withpaper.com dashboard (can be down from the dashboard directly)
cd script/nodejs
node withPaper/registerContractInPaper.js <NETWORK> <CONTRACT ADDRESS>

# Create a checkout (mint) link
cd script/nodejs
node withPaper/createPaperCheckoutLink.js <PAPER_CONTRACT_ID> <CURRENCY>

# Create a mint batch
cd script/nodejs/contract
node mintBatch.js <NETWORK> <CONTRACT ADDRESS> address.txt

```


## How does it works ?

the MembershipNFT is a [Soulbound](https://vitalik.ca/general/2022/01/26/soulbound.html) Token, or SBT, used to represent a membership to the [Ethereum France](https://www.ethereum-france.com/) association. It acts as an on-chain certificate, allowing one to access to the Ethereum France community, for example.

The contract implementing this token is based on the [EIP5192](https://eips.ethereum.org/EIPS/eip-5192). It has also a [withpaper.com](https://withpaper.com/) integration, allowing the members to easily mint their token.

### About function restrictions
The contract has certain functions restricted, for security purposes. 3 roles can be identified to explain these restrictions:
- **The owner**, which is the deployer of the contract,
- **The minters**, which are wallets managed by withpaper.com.
- **The members**, which are the owners of their respective SBT.

Here are the restricted functions:
- `setWithPaperAddress(address addr, bool value)` is restricted to the owner only. _NB: it will in fact give  the minter role to a new address_
- `mint(address to)` is restricted to minters and the owner.
- `burn(uint256 tokenId)` is restricted to the member that own the token to burn and the owner of the contract.
- `setBaseURI(string memory tokenURI_)` is restricted to the owner only.

---
## Licence

Shield: [![CC BY-SA 4.0][cc-by-sa-shield]][cc-by-sa]

This work is licensed under a
[Creative Commons Attribution-ShareAlike 4.0 International License][cc-by-sa].

[![CC BY-SA 4.0][cc-by-sa-image]][cc-by-sa]

[cc-by-sa]: http://creativecommons.org/licenses/by-sa/4.0/
[cc-by-sa-image]: https://licensebuttons.net/l/by-sa/4.0/88x31.png
[cc-by-sa-shield]: https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg
