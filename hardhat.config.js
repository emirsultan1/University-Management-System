require("@nomiclabs/hardhat-ethers");
require("dotenv").config();


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.26",
  networks: {
    sepolia: {
      url: "",
      accounts: [""],
    },
  },
};
