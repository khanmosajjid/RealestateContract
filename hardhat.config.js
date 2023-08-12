require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('@openzeppelin/hardhat-upgrades');


module.exports = {
  solidity: {
    version: "0.8.18", // Specify the Solidity compiler version
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // Set the number of runs for the optimizer
      },
    },
  },
  networks: {
    mumbai: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/rfCruuBJ6-ND7sPx8qfywX0PjKWcmIQq",
      accounts: ["830c2ddecb432a7cdeb285fd927d2300e9aaf7fbb3c32e76d704f497c29cc0c4"]
    }
  },
  etherscan: {
    apiKey: "NET91B9KDU24AS39FRIKRDNYIQ9UUYJ51K"
  }
};