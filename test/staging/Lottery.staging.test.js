const { assert, expect } = require('chai')
const { getNamedAccounts, ethers, network } = require('hardhat')
const { developmentChains } = require('../../helper-hardhat-config')

developmentChains.includes(network.name)
  ? describe.skip
  : describe('Lottery Staging Tests', function () {
      let lottery, lotteryEntranceFee, deployer

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        const lotteryContract = await deployments.get('Lottery')
        const lotteryAddress = lotteryContract.address

        lottery = await ethers.getContractAt('Lottery', lotteryAddress)
        lotteryEntranceFee = await lottery.getEntranceFee()
      })

      describe('fulfillRandomWords', function () {
        it('works with live Chainlink Keepers and Chainlink VRF, we get a random winner', async function () {
          console.log('Setting up test...')
          const startingTimeStamp = await lottery.getLatestTimeStamp()
          const accounts = await ethers.getSigners()

          console.log('Setting up Listener...')
          await new Promise(async (resolve, reject) => {
            lottery.once('WinnerPicked', async () => {
              console.log('WinnerPicked event fired!')
              try {
                const recentWinner = await lottery.getRecentWinner()
                const lotteryState = await lottery.getLotteryState()
                const winnerEndingBalance = await accounts[0].getBalance()
                const endingTimeStamp = await lottery.getLatestTimeStamp()

                await expect(lottery.getPlayer(0)).to.be.reverted
                assert.equal(recentWinner.toString(), accounts[0].address)
                assert.equal(lotteryState, 0)
                assert.equal(
                  winnerEndingBalance.toString(),
                  winnerStartingBalance.add(lotteryEntranceFee).toString(),
                )
                assert(endingTimeStamp > startingTimeStamp)
                resolve()
              } catch (error) {
                console.log(error)
                reject(error)
              }
            })
            console.log('Entering lottery...')
            const tx = await lottery.enterLottery({ value: lotteryEntranceFee })
            await tx.wait(1)
            console.log('Ok, time to wait...')
            const winnerStartingBalance = await accounts[0].getBalance()
          })
        })
      })
    })
