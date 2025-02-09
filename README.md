# Hardhat Smart Contract Lottery

This project demonstrates a decentralized lottery system using Hardhat, Solidity, and Chainlink VRF and Chainlink Keepers.

## Project Structure

- `contracts/`: Contains the Solidity smart contracts.
- `deploy/`: Deployment scripts for the smart contracts.
- `test/`: Unit tests for the smart contracts.
- `hardhat.config.js`: Hardhat configuration file.
- `helper-hardhat-config.js`: Contains configuration settings and helper functions for Hardhat.
- `package.json`: Project dependencies and scripts.

## Prerequisites

- Node.js
- pnpm

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/SaguadoDev/hardhat-smartcontract-lottery.git
   cd hardhat-smartcontract-lottery
   ```

2. Install the dependencies:

   ```bash
   pnpm install
   ```

3. Create a `.env` file and add the following environment variables:

   ```env
   SEPOLIA_RPC_URL=<your-sepolia-rpc-url>
   SEPOLIA_PRIVATE_KEY=<your-sepolia-private-key>
   ETHERSCAN_API_KEY=<your-etherscan-api-key>
   COINMARKETCAP_API_KEY=<your-coinmarketcap-api-key>
   ```

## Usage

### Compile the Contracts

```bash
pnpm hardhat compile
```

### Deploy the Contracts

```bash
pnpm hardhat deploy --network sepolia
```

### Run Tests

```bash
pnpm hardhat test
```

### Generate Gas Report

```bash
pnpm hardhat test --network <network-name> --report-gas
```
