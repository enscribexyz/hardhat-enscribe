# Testing Guide for hardhat-enscribe

This document explains how to run and write tests for the hardhat-enscribe plugin.

## Test Structure

The project includes three types of tests:

1. **Unit Tests** (`src/internal/tasks/name.test.ts`) - Test utility functions and isolated logic
2. **Integration Tests** (`test/enscribe.integration.test.ts`) - Test ENS operations with mocked contracts
3. **Hardhat Integration Tests** (`test/enscribe.hardhat.test.ts`) - Full blockchain integration tests

## Running Tests

### Unit Tests Only
```bash
pnpm run test:unit
```

### Integration Tests Only
```bash
pnpm run test:integration
```

### All Tests
```bash
pnpm run test:all
```

### Individual Test Files
```bash
# Run specific test file
pnpm vitest run test/enscribe.integration.test.ts

# Run with watch mode
pnpm vitest test/enscribe.integration.test.ts --watch
```

## Test Categories

### 1. Unit Tests
- Test utility functions like `parseNormalizedName`
- Test error handling and edge cases
- Fast execution, no external dependencies

### 2. Integration Tests
- Test ENS name operations (normalize, namehash)
- Test contract interaction logic
- Mock contract responses
- Medium execution time

### 3. Hardhat Integration Tests
- Deploy actual ENS contracts to local Hardhat network
- Test complete naming flow end-to-end
- Verify blockchain state changes
- Slower execution, requires Hardhat node

## Writing New Tests

### Unit Test Example
```typescript
import { describe, it, expect } from "vitest";
import { parseNormalizedName } from "../utils.js";

describe("parseNormalizedName", () => {
  it("should parse simple names correctly", () => {
    const result = parseNormalizedName("test.example.eth");
    expect(result).toEqual({
      label: "test",
      parent: "example.eth",
    });
  });
});
```

### Integration Test Example
```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { namehash, normalize } from "viem/ens";

describe("ENS Operations", () => {
  it("should normalize names correctly", () => {
    const result = normalize("TEST.ETH");
    expect(result).toBe("test.eth");
  });
});
```

### Hardhat Integration Test Example
```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";

describe("Blockchain Integration", () => {
  let publicClient: any;

  beforeEach(async () => {
    publicClient = createPublicClient({
      chain: hardhat,
      transport: http("http://127.0.0.1:8545"),
    });
  });

  it("should interact with deployed contracts", async () => {
    // Test actual contract interactions
  });
});
```

## Test Configuration

### Vitest Configuration (`vitest.config.ts`)
```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 60000, // For blockchain operations
    hookTimeout: 60000,
  },
});
```

### Hardhat Configuration (`hardhat.config.ts`)
```typescript
import { HardhatUserConfig } from "hardhat/types";
import "@nomicfoundation/hardhat-viem";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
  },
};

export default config;
```

## Running Hardhat Integration Tests

For full blockchain integration tests, you need to start a Hardhat node:

```bash
# Terminal 1: Start Hardhat node
pnpm hardhat node

# Terminal 2: Run Hardhat integration tests
pnpm run test:hardhat
```

## Test Coverage

Current test coverage includes:

- ✅ Utility function testing
- ✅ ENS name normalization
- ✅ Namehash generation
- ✅ Contract interaction logic
- ✅ Error handling
- ✅ Complete naming flow simulation

## Debugging Tests

### Run Tests with Verbose Output
```bash
pnpm vitest run --reporter=verbose
```

### Run Single Test
```bash
pnpm vitest run test/enscribe.integration.test.ts -t "should normalize"
```

### Debug Mode
```bash
pnpm vitest run --inspect-brk
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Clear Naming**: Use descriptive test names
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Mock External Dependencies**: Use mocks for blockchain calls in unit tests
5. **Test Edge Cases**: Include error conditions and boundary cases
6. **Fast Feedback**: Keep unit tests fast, integration tests can be slower

## Troubleshooting

### Common Issues

1. **Test Timeout**: Increase timeout in vitest.config.ts for blockchain operations
2. **Hardhat Node Not Running**: Ensure Hardhat node is running for integration tests
3. **Port Conflicts**: Make sure port 8545 is available for Hardhat node
4. **Type Errors**: Ensure all imports are correctly typed

### Getting Help

- Check test output for specific error messages
- Verify Hardhat node is running on correct port
- Ensure all dependencies are installed with `pnpm install`
- Check TypeScript configuration in `tsconfig.json`


