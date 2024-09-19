const MyToken = artifacts.require("MyToken");
const BscToken = artifacts.require("BscToken");

module.exports = function (deployer) {
  // Deploy MyToken with parameters
  const tokenName = "MyToken"; // Replace with your token name
  const tokenSymbol = "MTK";   // Replace with your token symbol
  const initialSupply = 1000000; // Replace with your initial supply

  deployer.deploy(MyToken, tokenName, tokenSymbol, initialSupply)
    .then(() => {
      // After MyToken is deployed, deploy BscToken
      return deployer.deploy(BscToken);
    });
};
