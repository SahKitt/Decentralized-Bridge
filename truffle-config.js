const path = require("path");
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
    contracts_build_directory: path.join(__dirname, "frontend/src/contracts"),
    networks: {
        development: {
            host: "127.0.0.1",     // Localhost (default: none)
            port: 7545,            // Ganache port (default: none)
            network_id: "*",       // Any network (default: none)
        },
        bsc: {
            provider: () => new HDWalletProvider('YOUR_MNEMONIC_OR_PRIVATE_KEY', 'https://bsc-dataseed.binance.org/'),
            network_id: 56,       // BSC's id
            gas: 5000000,         // Gas limit
            gasPrice: 20000000000 // Gas price in wei
        }
    },
    compilers: {
        solc: {
            version: "0.8.0",    // Specify the Solidity version
        },
    },
};
