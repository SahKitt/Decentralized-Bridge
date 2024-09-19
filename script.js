// Replace this with your token contract ABI and address
const ethContractABI = [
    // Your Ethereum contract ABI here
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_initialSupply",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "destination",
                "type": "address"
            }
        ],
        "name": "TokensLocked",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "balances",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "destination",
                "type": "address"
            }
        ],
        "name": "lockTokens",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const bscContractABI = [
    // Your BSC token contract ABI here
];

const ethContractAddress = "0xDe6cf384e82F2666Db414283c11ddAAE77e8d3A4"; // Replace with your Ethereum contract address
const bscContractAddress = "0x3EF1FD7127CB44A9A01dBef2348a6475d0E74684"; // Replace with your BSC contract address

async function initialize() {
    if (!window.ethereum) {
        alert("Please install MetaMask to use this feature.");
        return;
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    const network = await provider.getNetwork();
    console.log("Connected to network:", network.name); // Debugging
  
    return { provider, signer };
}

async function fetchBalance() {
    const { provider, signer } = await initialize();
    const userAddress = await signer.getAddress();
    console.log("User address:", userAddress); // Debugging

    try {
        // Get the ETH balance
        const ethContract = new ethers.Contract(ethContractAddress, ethContractABI, signer);
        const balance = await ethContract.balanceOf(userAddress);
        document.getElementById('balance').textContent = `Your balance: ${ethers.utils.formatUnits(balance, 18)} tokens`;
         } catch (error) {
        console.error("Error fetching balance:", error);
        alert(`Error: ${error.message}`);
    }
}

async function lockTokens() {
    const { signer } = await initialize();
    const amount = document.getElementById('amount').value;
    const destinationAddress = document.getElementById('destination').value;
    const statusElement = document.getElementById('status');

    if (!amount || !destinationAddress) {
        statusElement.textContent = "Please enter a valid amount and destination address.";
        return;
    }

    try {
        const ethContract = new ethers.Contract(ethContractAddress, ethContractABI, signer);
        const tx = await ethContract.lockTokens(
            ethers.utils.parseUnits(amount, 18),
            destinationAddress
        );

        statusElement.textContent = "Transaction sent. Waiting for confirmation...";
        await tx.wait();
        statusElement.textContent = `Tokens locked successfully! Transaction Hash: ${tx.hash}`;

        // Listen for the TokensLocked event to trigger minting on BSC
        const bscProvider = new ethers.providers.JsonRpcProvider("YOUR_BSC_NODE_URL");
        const bscContract = new ethers.Contract(bscContractAddress, bscContractABI, bscProvider);

        const filter = bscContract.filters.TokensMinted(destinationAddress);
        bscContract.on(filter, (to, amount) => {
            console.log(`Tokens minted on BSC for ${to}: ${ethers.utils.formatUnits(amount, 18)} tokens`);
            statusElement.textContent = `Tokens minted on destination chain for address: ${destinationAddress}`;
            fetchTransactionHistory(); // Update transaction history after minting
        });
        
        fetchTransactionHistory();
    } catch (error) {
        console.error("Error locking tokens:", error);
        statusElement.textContent = `Error: ${error.message}`;
    }
}

async function fetchTransactionHistory() {
    const { provider } = await initialize();
    const ethContract = new ethers.Contract(ethContractAddress, ethContractABI, provider);
    const transactionList = document.getElementById('transactionList');

    try {
        const filter = ethContract.filters.TokensLocked();
        const events = await ethContract.queryFilter(filter);

        transactionList.innerHTML = "";
        events.forEach(event => {
            const { sender, amount, destination } = event.args;
            const listItem = document.createElement('li');
            listItem.textContent = `Sender: ${sender}, Amount: ${ethers.utils.formatUnits(amount, 18)} tokens, Destination: ${destination}`;
            transactionList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error fetching transaction history:", error);
    }
}

document.getElementById('lockTokens').addEventListener('click', lockTokens);
window.onload = function() {
    fetchBalance();
    fetchTransactionHistory();
};
