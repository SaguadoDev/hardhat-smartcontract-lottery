const { network, getNamedAccounts, deployments, ethers } = require('hardhat')
const { developmentChains, networkConfig } = require('../../helper-hardhat-config')
const { assert } = require('chai')

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('Lottery Unit Tests', async function () {
      let lottery, vrfCoordinatorV2Mock
      const chainId = network.config.chainId

      this.beforeEach(async () => {
        const { deployer } = await getNamedAccounts()
        await deployments.fixture(['all'])

        const lotteryContract = await deployments.get('Lottery')
        const lotteryAddress = lotteryContract.address

        lottery = await ethers.getContractAt('Lottery', lotteryAddress)
        vrfCoordinatorV2Mock = await ethers.getContractAt('VRFCoordinatorV2Mock', deployer)
      })

      describe('constructor', async function () {
        it('initializes the raffle correctly', async function () {
          const lotteryState = await lottery.getLotteryState()
          const interval = await lottery.getInterval()
          assert.equal(lotteryState.toString(), '0')
          assert.equal(interval.toString(), networkConfig[chainId]['interval'])
        })
      })
    })
