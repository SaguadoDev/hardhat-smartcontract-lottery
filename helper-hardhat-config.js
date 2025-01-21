const { ethers } = require('hardhat')
const { parseEther } = require('ethers')

const networkConfig = {
  4: {
    name: 'sepolia',
    vrfCoordinatorV2: '0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625',
    entranceFee: parseEther('0.1'),
    gasLane: '0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c',
    subscriptionId: '0x1',
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
