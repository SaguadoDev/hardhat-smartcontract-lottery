// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import '@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol';

import {VRFConsumerBaseV2Plus} from '@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol';
import {VRFV2PlusClient} from '@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol';

error Lottery__NotEnoughETHEntered();
error Lottery__TransferFailed();
error Lottery__NotOpen();

contract Lottery is VRFConsumerBaseV2Plus, AutomationCompatibleInterface {
  enum LotteryState {
    OPEN,
    PENDING
  }

  address payable[] private s_players;
  address payable private s_recentWinner;
  LotteryState private s_lotteryState;
  uint256 private s_lastTimeStamp;

  uint256 private immutable i_interval;
  bytes32 private immutable i_gasLane;
  uint256 private immutable i_entranceFee;
  uint256 private immutable i_subscriptionId;
  uint32 private immutable i_callbackGasLimit;

  uint16 private constant REQUEST_CONFIRMATIONS = 3;
  uint32 private constant NUM_WORDS = 1;

  event LotteryEnter(address indexed player);
  event RequestedLotteryWinner(uint256 indexed requestId);
  event WinnerPicked(address indexed winner);

  constructor(
    address vrfCoordinatorV2,
    uint256 entranceFee,
    bytes32 gasLane,
    uint256 subscriptionId,
    uint32 callbackGasLimit,
    uint256 interval
  ) VRFConsumerBaseV2Plus(vrfCoordinatorV2) {
    i_entranceFee = entranceFee;
    i_gasLane = gasLane;
    i_subscriptionId = subscriptionId;
    i_callbackGasLimit = callbackGasLimit;
    s_lotteryState = LotteryState.OPEN;
    s_lastTimeStamp = block.timestamp;
    i_interval = interval;
  }

  function enterLottery() public payable {
    if (msg.value < i_entranceFee) revert Lottery__NotEnoughETHEntered();
    if (s_lotteryState != LotteryState.OPEN) revert Lottery__NotOpen();
    s_players.push(payable(msg.sender));
    emit LotteryEnter(msg.sender);
  }

  function checkUpkeep(
    bytes calldata /** checkData*/
  ) external view override returns (bool upkeepNeeded, bytes memory /* performData */) {
    bool isOpen = (s_lotteryState == LotteryState.OPEN);
    bool timePassed = ((block.timestamp - s_lastTimeStamp) > i_interval);
    bool hasPlayers = s_players.length > 0;
    bool hasBalance = address(this).balance > 0;
    upkeepNeeded = isOpen && timePassed && hasPlayers && hasBalance;
  }

  function performUpkeep(bytes calldata /** performData */) external override {
    s_lotteryState = LotteryState.PENDING;
    uint256 requestId = s_vrfCoordinator.requestRandomWords(
      VRFV2PlusClient.RandomWordsRequest({
        keyHash: i_gasLane,
        subId: i_subscriptionId,
        requestConfirmations: REQUEST_CONFIRMATIONS,
        callbackGasLimit: i_callbackGasLimit,
        numWords: NUM_WORDS,
        extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: false}))
      })
    );
    emit RequestedLotteryWinner(requestId);
  }

  function fulfillRandomWords(
    uint256 /** requestId */,
    uint256[] calldata randomWords
  ) internal override {
    uint256 indexOfWinner = randomWords[0] % s_players.length;
    address payable recentWinner = s_players[indexOfWinner];
    s_recentWinner = recentWinner;
    s_lotteryState = LotteryState.OPEN;
    s_players = new address payable[](0);
    s_lastTimeStamp = block.timestamp;
    (bool success, ) = recentWinner.call{value: address(this).balance}('');
    if (!success) {
      revert Lottery__TransferFailed();
    }
  }

  function getEntranceFee() public view returns (uint256) {
    return i_entranceFee;
  }

  function getPlayer(uint256 index) public view returns (address) {
    return s_players[index];
  }

  function getRecentWinner() public view returns (address) {
    return s_recentWinner;
  }

  function getLotteryState() public view returns (LotteryState) {
    return s_lotteryState;
  }

  function getNumWords() public pure returns (uint256) {
    return NUM_WORDS;
  }

  function getNumberOfPlayers() public view returns (uint256) {
    return s_players.length;
  }

  function getLastestTimeStamp() public view returns (uint256) {
    return s_lastTimeStamp;
  }

  function getRequestConfirmations() public pure returns (uint256) {
    return REQUEST_CONFIRMATIONS;
  }

  function getInterval() public view returns (uint256) {
    return i_interval;
  }

  function getSubscriptionId() public view returns (uint256) {
    return i_subscriptionId;
  }
}
