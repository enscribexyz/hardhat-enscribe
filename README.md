# hardhat-enscribe

A Hardhat v3 plugin that enables you to assign ENS (Ethereum Name Service) names to your smart contracts, making them easily discoverable and human-readable.

## What is hardhat-enscribe?

hardhat-enscribe allows developers to automatically assign ENS names to their smart contracts during or after deployment. This plugin handles the complete ENS integration process, including:

- **Subname Creation**: Creates ENS subnames for your contracts
- **Forward Resolution**: Maps ENS names to contract addresses  
- **Reverse Resolution**: Maps contract addresses back to ENS names
- **Multi-chain Support**: Works across multiple networks including Ethereum, Sepolia, Linea, and more

## Features

- 🏷️ **Primary ENS Naming**: Assign human-readable names to your contracts
- 🌐 **Multi-chain Support**: Works on Ethereum, Sepolia
- 🔧 **Hardhat v3 Compatible**: Built specifically for Hardhat v3 with Viem integration
- 🛡️ **Contract Type Detection**: Automatically detects Ownable and ReverseClaimer contracts
- ⚡ **Transaction Optimization**: Waits for confirmations to prevent race conditions

## Installation

```bash
npm install @enscribe/hardhat-enscribe
```

## Configuration

Add the plugin to your `hardhat.config.ts`:

```typescript
import type { HardhatUserConfig } from "hardhat/config";
import hardhatEnscribePlugin from "@enscribe/hardhat-enscribe";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin, hardhatEnscribePlugin],
  // ... rest of your config
};

export default config;
```

## Usage

### Basic Command

```bash
npx hardhat enscribe name <ENS_NAME> --contract <CONTRACT_ADDRESS>
```

### Examples

#### Name a contract on Sepolia
```bash
npx hardhat enscribe name mycontract.mydomain.eth --contract 0x1234...5678
```

#### Name a contract on Linea
```bash
npx hardhat enscribe name mycontract.mydomain.eth --contract 0x1234...5678 --chain linea
```

### Command Options

- `name` (required): The ENS name to assign (e.g., `mycontract.mydomain.eth`)
- `--contract` (required): The contract address to name
- `--chain` (optional): The network/chain to use (defaults to `sepolia`)

## Supported Networks

The plugin supports the following networks:

- **Ethereum Mainnet** (`mainnet`)
- **Sepolia Testnet** (`sepolia`) - Default
- **Linea Mainnet** (`linea`)
- **Linea Sepolia** (`linea-sepolia`)

## Contract Requirements

Your contract must implement one of the following patterns:

### 1. Ownable Pattern
Contracts that implement the `owner()` function (like OpenZeppelin's Ownable):

```solidity
contract MyContract {
    address public owner;
    
    function owner() public view returns (address) {
        return owner;
    }
}
```

### 2. ReverseClaimer Pattern
Contracts that have reverse ENS resolution already set up.

## How It Works

1. **Subname Creation**: Creates an ENS subname record if it doesn't exist
2. **Forward Resolution**: Maps the ENS name to your contract address
3. **Reverse Resolution**: Maps your contract address back to the ENS name
4. **Confirmation**: Waits for all transactions to be confirmed before proceeding

## Example Workflow

```bash
# 1. Deploy your contract
npx hardhat run scripts/deploy.ts --network sepolia

# 2. Name your contract
npx hardhat enscribe name myawesomecontract.mydomain.eth --contract 0x1234567890123456789012345678901234567890

# 3. Your contract is now discoverable at:
# https://app.enscribe.xyz/explore/11155111/myawesomecontract.mydomain.eth
```

## Environment Setup

### Required Environment Variables

For testnets like Sepolia, you'll need:

```bash
# Set your private key (use hardhat-keystore for security)
npx hardhat keystore set SEPOLIA_PRIVATE_KEY

# Or set as environment variable
export SEPOLIA_PRIVATE_KEY="your_private_key_here"
```

### Network Configuration

Ensure your `hardhat.config.ts` includes the networks you want to use:

```typescript
networks: {
  sepolia: {
    type: "http",
    chainType: "l1", 
    url: configVariable("SEPOLIA_RPC_URL"),
    accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
  },
  linea: {
    type: "http",
    chainType: "l2",
    url: configVariable("LINEA_RPC_URL"), 
    accounts: [configVariable("LINEA_PRIVATE_KEY")],
  },
}
```

## Troubleshooting

### Common Issues

**"Contract does not implement required interface"**
- Ensure your contract implements either `owner()` function or reverse ENS resolution
- Check that the contract address is correct and deployed

**"Insufficient funds"**
- Ensure your account has enough ETH to pay for ENS transactions
- Gas fees vary by network and ENS operation complexity

## Development

### Building

```bash
npm run build
```

### Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:hardhat
```

### Linting

```bash
npm run lint
npm run format
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Links

- [GitHub Repository](https://github.com/enscribexyz/hardhat-enscribe)
- [Enscribe](https://app.enscribe.xyz)
- [Hardhat Documentation](https://hardhat.org/docs)
- [ENS Documentation](https://docs.ens.domains/)

## Support

For support, please open an issue on GitHub or visit [app.enscribe.xyz](https://app.enscribe.xyz).
