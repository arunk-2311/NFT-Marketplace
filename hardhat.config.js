const {readFileSync} = require("fs");

require("@nomicfoundation/hardhat-toolbox");
require("fs")

const projectUrl = readFileSync("./.url","utf8")
const privateKey = readFileSync("./.secret","utf8")

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks:{
    hardhat:{
      chainId:1337
    }, 
    mumbai:{
      url: projectUrl,
      accounts:[privateKey]
    },
  },
  allowUnlimitedContractSize: true,
  solidity: "0.8.9",
};
