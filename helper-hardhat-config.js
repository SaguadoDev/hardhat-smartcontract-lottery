const { ethers } = require('hardhat')
const { parseEther } = require('ethers')

const networkConfig = {
  11155111: {
    name: 'sepolia',
    vrfCoordinatorV2: '0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B',
    entranceFee: parseEther('0.1'),
    gasLane: '0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c',
    subscriptionId: '22813344641549854560664317753004243736173637825181203726174464295361144368023',
    callbackGasLimit: '500000',
    interval: '30',
  },
  31337: {
    name: 'hardhat',
    entranceFee: parseEther('0.1'),
    gasLane: '0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c',
    callbackGasLimit: '500000',
    interval: '30',
  },
}

const developmentChains = ['hardhat', 'localhost']

module.exports = {
  networkConfig,
  developmentChains,
}
