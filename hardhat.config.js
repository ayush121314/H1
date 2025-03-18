require("@nomicfoundation/hardhat-toolbox");

/** @type {import('hardhat/config').HardhatUserConfig} */
module.exports = {
  solidity: "0.8.17",
  paths: {
    sources: "./src/contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    // Add your Ethereum testnet configuration here
    // goerli: {
    //   url: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
    //   accounts: [PRIVATE_KEY],
    // },
  },
}; 