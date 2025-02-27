const { ethers } = require('hardhat')
const { parseEther } = require('ethers')

const networkConfig = {
  11155111: {
    name: 'sepolia',
    vrfCoordinatorV2: '0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B',
    entranceFee: parseEther('0.1'),
    gasLane: '0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae',
    subscriptionId: '22813344641549854560664317753004243736173637825181203726174464295361144368023',
    callbackGasLimit: '500000',
    interval: '30',
  },
  31337: {
    name: 'hardhat',
    entranceFee: parseEther('0.1'),
    gasLane: '0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae',
    callbackGasLimit: '500000',
    interval: '30',
  },
}

const developmentChains = ['hardhat', 'localhost']

module.exports = {
  networkConfig,
  developmentChains,
}
