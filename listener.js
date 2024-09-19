const Web3 = require('web3');
const ethers = require('ethers');
const BscToken = require('./build/contracts/BscToken.json');

const ETH_NODE_URL = 'YOUR_ETH_NODE_URL';
const BSC_NODE_URL = 'YOUR_BSC_NODE_URL';
const ETH_CONTRACT_ADDRESS = 'YOUR_ETH_CONTRACT_ADDRESS';
const BSC_PRIVATE_KEY = 'YOUR_BSC_PRIVATE_KEY';
const bscContractAddress = 'YOUR_BSC_CONTRACT_ADDRESS';

const web3 = new Web3(new Web3.providers.HttpProvider(ETH_NODE_URL));
const bscProvider = new ethers.providers.JsonRpcProvider(BSC_NODE_URL);
const bscWallet = new ethers.Wallet(BSC_PRIVATE_KEY, bscProvider);
const bscContract = new ethers.Contract(bscContractAddress, BscToken.abi, bscWallet);

async function listenForTokensLocked() {
    const contract = new web3.eth.Contract(BscToken.abi, ETH_CONTRACT_ADDRESS);

    contract.events.TokensLocked({ fromBlock: 'latest' })
        .on('data', async (event) => {
            const { sender, amount, destination } = event.returnValues;
            console.log(`Tokens locked by ${sender}: ${amount} to ${destination}`);

            // Mint tokens on BSC
            await bscContract.mint(destination, amount);
            console.log(`Minted ${amount} tokens for ${destination} on BSC.`);
        })
        .on('error', (error) => {
            console.error("Error listening to TokensLocked event:", error);
        });
}

// Start listening for events
listenForTokensLocked();
