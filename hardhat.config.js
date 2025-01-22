require('@nomicfoundation/hardhat-toolbox')
require('hardhat-gas-reporter')
require('solidity-coverage')
require('hardhat-contract-sizer')
require('hardhat-deploy')
require('dotenv').config()

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'http://eth-sepolia'
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY || '0xKey'
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || 'key'
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || 'key'

module.exports = {
  solidity: '0.8.8',
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 31337,
      blockConfirmations: 1,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [SEPOLIA_PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 6,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    },
  },
}
