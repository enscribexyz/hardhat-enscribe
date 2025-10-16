# ENScribe Plugin Demo

This demo project shows how to use the `@enscribe/hardhat-enscribe` plugin to name smart contracts with ENS.

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your RPC URL and private key
```

## Usage

### Option 1: Deploy and Name in One Script

Deploy a contract and name it using the library directly:

```bash
npx hardhat run scripts/deploy-and-name-simple.ts --network sepolia
```

This script demonstrates:
- Deploying a Counter contract
- Automatically naming it with a generated ENS name
- Using the `@enscribe/enscribe` library programmatically
- Perfect example for integrating ENS naming into your deployment scripts

### Option 2: Use the Hardhat Task

Deploy a contract first, then name it using the Hardhat task:

```bash
# Deploy using Ignition
npx hardhat ignition deploy ignition/modules/Counter.ts --network sepolia

# Name the deployed contract
npx hardhat enscribe name mycontract.myname.eth \
  --contract 0xYourContractAddress \
  --chain sepolia
```

### Option 3: Name an Existing Contract

Name any existing contract:

```bash
npx hardhat enscribe name mycontract.myname.eth \
  --contract 0x1234567890123456789012345678901234567890 \
  --chain sepolia
```

## Examples

### Basic Usage (Sepolia)

```bash
npx hardhat enscribe name counter.myname.eth \
  --contract 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb \
  --chain sepolia
```

### L2 Usage (Optimism Sepolia)

```bash
npx hardhat enscribe name counter.myname.eth \
  --contract 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb \
  --chain optimism-sepolia
```

### Programmatic Usage

See `scripts/deploy-and-name.ts` for an example of using the library programmatically:

```typescript
import { nameContract } from "@enscribe/enscribe";

const result = await nameContract({
  name: normalizedName,
  contractAddress: counter.address,
  walletClient,
  chainName: "sepolia",
  enableMetrics: true,
});
```

## Supported Networks

- **Mainnet**: mainnet
- **Testnet**: sepolia
- **L2 Mainnets**: linea, base, optimism, arbitrum, scroll
- **L2 Testnets**: linea-sepolia, base-sepolia, optimism-sepolia, arbitrum-sepolia, scroll-sepolia

## Contract Requirements

Your contract must be either:
1. **Ownable**: Implements the Ownable pattern with an `owner()` function
2. **ReverseClaimer**: Has claimed its reverse ENS record

## Verification

To verify the demo is using your locally built plugin, see [VERIFICATION.md](./VERIFICATION.md).

## Available Scripts

- **scripts/deploy-counter-and-name.ts** - Deploy Counter using Ignition and name it
- **scripts/send-op-tx.ts** - Example Optimism transaction

## Learn More

- [ENScribe Documentation](https://docs.enscribe.xyz)
- [Hardhat Plugin Repository](https://github.com/enscribexyz/hardhat-enscribe)
- [Core Library Repository](https://github.com/enscribexyz/enscribe-core)
- [ENScribe App](https://app.enscribe.xyz)
