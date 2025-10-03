# Configuration Guide for hardhat-enscribe

This document explains how to configure contract addresses and network settings for the hardhat-enscribe plugin.

## Overview

The plugin uses a configuration system that allows you to:
- Set contract addresses for different networks
- Override default addresses with custom ones
- Configure the default network to use
- Load configuration from environment variables

## Default Configuration

The plugin comes with pre-configured addresses for major networks:

### Mainnet
- ENS Registry: `0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e`
- Public Resolver: `0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5`
- Name Wrapper: `0x0635513f179D50A207757E05759CbD106d7dFcE8`
- Reverse Registrar: `0xA0a1AbcDAe1a2a4A2EF8e9113Ff0e02DD81DC0C6`

### Sepolia Testnet
- Same addresses as Mainnet (ENS contracts are shared)

### Goerli Testnet
- Same addresses as Mainnet (ENS contracts are shared)

## Configuration Methods

### 1. Environment Variables

You can override contract addresses using environment variables:

```bash
export ENS_REGISTRY_ADDRESS="0xYourCustomENSRegistryAddress"
export PUBLIC_RESOLVER_ADDRESS="0xYourCustomPublicResolverAddress"
export NAME_WRAPPER_ADDRESS="0xYourCustomNameWrapperAddress"
export REVERSE_REGISTRAR_ADDRESS="0xYourCustomReverseRegistrarAddress"
export ENSCRIBE_DEFAULT_NETWORK="sepolia"
```

### 2. Custom Configuration File

Create a configuration file in your project:

```typescript
// enscribe.config.ts
import { createConfigManager } from "hardhat-enscribe/config";

const config = createConfigManager({
  defaultNetwork: "sepolia",
  customAddresses: {
    // Override specific contract addresses
    ENS_REGISTRY: "0xYourCustomENSRegistryAddress",
    PUBLIC_RESOLVER: "0xYourCustomPublicResolverAddress",
  },
});

export default config;
```

### 3. Programmatic Configuration

Configure the plugin programmatically in your Hardhat config:

```typescript
// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/types";
import { createConfigManager } from "hardhat-enscribe/config";

const enscribeConfig = createConfigManager({
  defaultNetwork: "sepolia",
  customAddresses: {
    ENS_REGISTRY: "0xYourCustomENSRegistryAddress",
  },
});

const config: HardhatUserConfig = {
  // ... your hardhat config
  plugins: ["hardhat-enscribe"],
};

export default config;
```

## Usage Examples

### Basic Usage (Uses Default Configuration)

```bash
# Uses sepolia network by default
npx hardhat enscribe name "mycontract.example.eth" --contract 0x1234...
```

### Specify Network

```bash
# Use mainnet
npx hardhat enscribe name "mycontract.example.eth" --contract 0x1234... --chain mainnet

# Use sepolia
npx hardhat enscribe name "mycontract.example.eth" --contract 0x1234... --chain sepolia
```

### Custom Contract Addresses

```typescript
// In your project
import { createConfigManager } from "hardhat-enscribe/config";

const config = createConfigManager({
  customAddresses: {
    ENS_REGISTRY: "0xYourCustomENSRegistryAddress",
    PUBLIC_RESOLVER: "0xYourCustomPublicResolverAddress",
  },
});

// Use the config in your task
const contractAddresses = config.getContractAddresses("sepolia");
```

## Local Development

For local development with Hardhat, you need to deploy ENS contracts first:

### 1. Deploy Contracts to Local Network

```typescript
// deploy-ens.ts
import { deployContract } from "viem";
import { hardhat } from "viem/chains";

async function deployENS() {
  // Deploy ENS Registry
  const ensRegistry = await deployContract(walletClient, {
    abi: ENSRegistryABI,
    bytecode: ENSRegistryBytecode,
  });
  
  // Deploy Public Resolver
  const publicResolver = await deployContract(walletClient, {
    abi: PublicResolverABI,
    bytecode: PublicResolverBytecode,
  });
  
  // Deploy other contracts...
  
  console.log("ENS Registry:", ensRegistry);
  console.log("Public Resolver:", publicResolver);
}
```

### 2. Set Environment Variables

```bash
export ENS_REGISTRY_ADDRESS="0xDeployedENSRegistryAddress"
export PUBLIC_RESOLVER_ADDRESS="0xDeployedPublicResolverAddress"
export NAME_WRAPPER_ADDRESS="0xDeployedNameWrapperAddress"
export REVERSE_REGISTRAR_ADDRESS="0xDeployedReverseRegistrarAddress"
```

### 3. Use Local Network

```bash
npx hardhat enscribe name "mycontract.test.eth" --contract 0x1234... --chain localhost
```

## Configuration Validation

The configuration system validates:
- Contract addresses are valid Ethereum addresses
- All required contracts are configured
- Network names are supported

## Error Handling

Common configuration errors and solutions:

### Missing Contract Addresses
```
Error: Missing contract address for ENS_REGISTRY
```
**Solution**: Ensure all required contract addresses are configured.

### Invalid Address Format
```
Error: Invalid contract address format for ENS_REGISTRY: invalid-address
```
**Solution**: Use valid Ethereum addresses (0x followed by 40 hex characters).

### Unsupported Network
```
Error: Unsupported network: unsupported-network
```
**Solution**: Use supported networks: `mainnet`, `sepolia`, `goerli`, `localhost`.

## Best Practices

1. **Use Environment Variables**: For sensitive or environment-specific configurations
2. **Validate Addresses**: Always validate contract addresses before use
3. **Document Custom Addresses**: Document any custom contract addresses in your project
4. **Test Configuration**: Test your configuration with the target network
5. **Version Control**: Don't commit sensitive configuration data

## Migration from Hardcoded Addresses

If you're migrating from hardcoded addresses:

### Before (Hardcoded)
```typescript
const ensRegistry = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
const publicResolver = "0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5";
```

### After (Configuration)
```typescript
import { defaultConfig } from "hardhat-enscribe/config";

const contractAddresses = defaultConfig.getContractAddresses("sepolia");
const ensRegistry = contractAddresses.ENS_REGISTRY;
const publicResolver = contractAddresses.PUBLIC_RESOLVER;
```

## API Reference

### ConfigManager

```typescript
class ConfigManager {
  // Get contract addresses for a network
  getContractAddresses(networkName?: NetworkName): Record<string, string>
  
  // Get contract addresses by chain ID
  getContractAddressesByChainId(chainId: number): Record<string, string>
  
  // Update contract addresses for a network
  updateContractAddresses(networkName: NetworkName, addresses: Record<string, string>): void
  
  // Set custom addresses (overrides all networks)
  setCustomAddresses(addresses: Record<string, string>): void
  
  // Get current configuration
  getConfig(): EnscribeConfig
}
```

### Supported Networks

- `mainnet`: Ethereum Mainnet
- `sepolia`: Sepolia Testnet
- `goerli`: Goerli Testnet (deprecated)
- `localhost`: Local Hardhat network
