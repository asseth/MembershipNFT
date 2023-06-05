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

```bash
### forge examples ###
# build the contract
forge build

# run the tests
forge test

# export contract code
forge flatten src/SBT.sol


### custom scripts ###
# NB: you can always run a script without argument to print the usage.

# deploy the contract
cd script/nodejs
node contract/deployContract.js <NETWORK>

# Add a withpaper.com wallet address to the contract
cd script/nodejs
node contract/setWithPaperAddress.js <NETWORK> <CONTRACT ADDRESS> <WITHPAPER ADDRESS>

# Register a contract on withpaper.com dashboard
cd script/nodejs
node withPaper/registerContractInPaper.js <NETWORK> <CONTRACT ADDRESS>

# Create a checkout (mint) link
cd script/nodejs
node withPaper/createPaperCheckoutLink.js <PAPER_CONTRACT_ID> <CURRENCY>
```


## How does it works ?

the MembershipNFT is a [Soulbound](https://vitalik.ca/general/2022/01/26/soulbound.html) Token, or SBT, used to represent a membership to the [Ethereum France](https://www.ethereum-france.com/) association. It acts as an on-chain certificate, allowing one to access to the Ethereum France community, for example.

The contract implementing this token is based on the [EIP5192](https://eips.ethereum.org/EIPS/eip-5192). It has also a [withpaper.com](https://withpaper.com/) integration, allowing the members to easily mint their token.

