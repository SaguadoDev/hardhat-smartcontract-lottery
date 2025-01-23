const { network, getNamedAccounts, deployments, ethers } = require('hardhat')
const { developmentChains, networkConfig } = require('../../helper-hardhat-config')
const { assert, expect } = require('chai')

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('Lottery Unit Tests', async function () {
      let lottery, vrfCoordinatorV2Mock, lotteryEntranceFee, deployer, interval
      const chainId = network.config.chainId

      this.beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(['all'])

        const lotteryContract = await deployments.get('Lottery')
        const lotteryAddress = lotteryContract.address

        lottery = await ethers.getContractAt('Lottery', lotteryAddress)
        vrfCoordinatorV2Mock = await ethers.getContractAt('VRFCoordinatorV2Mock', deployer)
        lotteryEntranceFee = await lottery.getEntranceFee()
        interval = await lottery.getInterval()
      })

      describe('constructor', () => {
        it('initializes the raffle correctly', async function () {
          const lotteryState = await lottery.getLotteryState()
          assert.equal(lotteryState.toString(), '0')
          assert.equal(interval.toString(), networkConfig[chainId]['interval'])
        })
      })

      describe('enterLottery', () => {
        it('revert if you do not pay enough', async () => {
          await expect(lottery.enterLottery()).to.be.revertedWithCustomError(
            lottery,
            'Lottery__NotEnoughETHEntered',
          )
        })
        it('records players when they enter the lottery', async () => {
          await lottery.enterLottery({ value: lotteryEntranceFee })
          const playerFromContract = await lottery.getPlayer(0)
          assert.equal(playerFromContract, deployer)
        })
        it('emit event on entering the lottery', async () => {
          await expect(lottery.enterLottery({ value: lotteryEntranceFee })).to.emit(
            lottery,
            'LotteryEnter',
          )
        })
        it('not allow players enter when lottery is in progress', async () => {
          await lottery.enterLottery({ value: lotteryEntranceFee })
          await network.provider.send('evm_increaseTime', [Number(interval) + 1])
          await network.provider.send('evm_mine')
          await lottery.performUpkeep('0x')
          await expect(
            lottery.enterLottery({ value: lotteryEntranceFee }),
          ).to.be.revertedWithCustomError(lottery, 'Lottery__NotOpen')
        })
      })
    })
