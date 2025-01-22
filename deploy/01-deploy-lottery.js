const { network, ethers } = require('hardhat')
const { developmentChains, networkConfig } = require('../helper-hardhat-config')
const { verify } = require('../utils/verify')
const { parseEther } = require('ethers')

const VFR_SUB_FUND_AMOUNT = parseEther('2')

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId
  let vrfCoordinatorV2, subscriptionId

  if (developmentChains.includes(network.name)) {
    const vrfCoordinator = await get('VRFCoordinatorV2Mock')

    const vrfCoordinatorV2Mock = await ethers.getContractAt(
      'VRFCoordinatorV2Mock',
      vrfCoordinator.address,
    )
    vrfCoordinatorV2 = vrfCoordinatorV2Mock.runner.address

    // create subscription ID
    const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
    const transactionReceipt = await transactionResponse.wait()
    subscriptionId = transactionReceipt.logs[0].args.subId

    // fund subscription
    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VFR_SUB_FUND_AMOUNT)
  } else {
    vrfCoordinatorV2 = networkConfig[chainId]['vrfCoordinatorV2']
    subscriptionId = networkConfig[chainId]['subscriptionId']
  }

  const entranceFee = networkConfig[chainId]['entranceFee']
  const gasLane = networkConfig[chainId]['gasLane']
  const callbackGasLimit = networkConfig[chainId]['callbackGasLimit']
  const interval = networkConfig[chainId]['interval']

  const args = [vrfCoordinatorV2, entranceFee, gasLane, subscriptionId, callbackGasLimit, interval]
  const lottery = await deploy('Lottery', {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmtions || 1,
  })
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    log('Verifying...')
    await verify(lottery.address, args)
  }
  log('----------------------------------------------------------')
}

module.exports.tags = ['all', 'lottery']
