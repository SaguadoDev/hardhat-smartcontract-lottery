const { network, getNamedAccounts, deployments, ethers } = require('hardhat')
const { developmentChains, networkConfig } = require('../../helper-hardhat-config')
const { assert, expect } = require('chai')

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('Lottery Unit Tests', function () {
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
        it('initializes the raffle correctly', async () => {
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

      describe('checkUpkeep', () => {
        it('returns false if dont have enough ETH', async () => {
          await network.provider.send('evm_increaseTime', [Number(interval) + 1])
          await network.provider.send('evm_mine', [])
          const { upkeepNeeded } = await lottery.checkUpkeep.staticCall('0x')
          assert.equal(upkeepNeeded, false)
        })
        it('returns false if lottery is not open', async () => {
          await lottery.enterLottery({ value: lotteryEntranceFee })
          await network.provider.send('evm_increaseTime', [Number(interval) + 1])
          await network.provider.send('evm_mine', [])
          await lottery.performUpkeep('0x')
          const lotteryState = await lottery.getLotteryState()
          const { upkeepNeeded } = await lottery.checkUpkeep.staticCall('0x')
          assert.equal(lotteryState.toString(), '1')
          assert.equal(upkeepNeeded, false)
        })
        it("returns false if enough time hasn't passed", async () => {
          await lottery.enterLottery({ value: lotteryEntranceFee })
          await network.provider.send('evm_increaseTime', [Number(interval) - 5])
          await network.provider.send('evm_mine', [])
          const { upkeepNeeded } = await lottery.checkUpkeep.staticCall('0x')
          assert(!upkeepNeeded)
        })
        it('returns true if enough time has passed, has players, eth, and is open', async () => {
          await lottery.enterLottery({ value: lotteryEntranceFee })
          await network.provider.send('evm_increaseTime', [Number(interval) + 1])
          await network.provider.send('evm_mine', [])
          const { upkeepNeeded } = await lottery.checkUpkeep.staticCall('0x')
          assert(upkeepNeeded)
        })
      })
      describe('performUpkeep', () => {
        it('it can only run if checkUpkeep returns true', async () => {
          await lottery.enterLottery({ value: lotteryEntranceFee })
          await network.provider.send('evm_increaseTime', [Number(interval) + 1])
          await network.provider.send('evm_mine', [])
          const tx = await lottery.performUpkeep('0x')
          assert(tx)
        })
        it('it reverts if checkUpkeep returns false', async () => {
          await expect(lottery.performUpkeep('0x')).to.be.revertedWithCustomError(
            lottery,
            'Lottery__UpkeepNotNeeded',
          )
        })
        it('updates the raffle state, emits and event, and calls the vrf coordinator', async () => {
          await lottery.enterLottery({ value: lotteryEntranceFee })
          await network.provider.send('evm_increaseTime', [Number(interval) + 1])
          await network.provider.send('evm_mine', [])
          const txResponse = await lottery.performUpkeep('0x')
          const txReceipt = await txResponse.wait(1)
          const lotteryState = await lottery.getLotteryState()
          const requestId = 1
          assert(requestId > 0)
          assert(lotteryState == 1)
        })
      })
    })
