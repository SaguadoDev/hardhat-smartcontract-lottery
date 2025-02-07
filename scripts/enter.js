const { ethers } = require('hardhat')

async function enterLottery() {
  const lotteryContract = await deployments.get('Lottery')
  const lotteryAddress = lotteryContract.address

  const lottery = await ethers.getContractAt('Lottery', lotteryAddress)
  const lotteryEntranceFee = await lottery.getEntranceFee()
  const tx = await lottery.enterLottery({ value: lotteryEntranceFee })
  await tx.wait(1)
  console.log('Entered the lottery!')
  console.log(tx.hash)
}

enterLottery()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
