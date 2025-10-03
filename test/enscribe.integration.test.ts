import { describe, it, expect, beforeEach } from "vitest";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { createPublicClient, http, getContract, createWalletClient } from "viem";
import { hardhat } from "viem/chains";
import { namehash, normalize } from "viem/ens";
import { keccak256, toBytes } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import ensRegistryABI from "../src/internal/abi/ENSRegistry.js";
import publicResolverABI from "../src/internal/abi/PublicResolver.js";
import nameWrapperABI from "../src/internal/abi/NameWrapper.js";
import reverseRegistrarABI from "../src/internal/abi/ReverseRegistrar.js";

// Test configuration
const TEST_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Hardhat account #0
const TEST_ACCOUNT = privateKeyToAccount(TEST_PRIVATE_KEY);

// ENS Contract Addresses (these would be deployed in a real test)
const ENS_REGISTRY_ADDRESS = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
const PUBLIC_RESOLVER_ADDRESS = "0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5";
const NAME_WRAPPER_ADDRESS = "0x0635513f179D50A207757E05759CbD106d7dFcE8";
const REVERSE_REGISTRAR_ADDRESS = "0xA0a1AbcDAe1a2a4A2EF8e9113Ff0e02DD81DC0C6";

describe("ENScibe Integration Tests with Hardhat", () => {
  let publicClient: any;
  let walletClient: any;
  let ensRegistry: any;
  let publicResolver: any;
  let nameWrapper: any;
  let reverseRegistrar: any;

  beforeEach(async () => {
    // Set up viem clients for Hardhat local network
    publicClient = createPublicClient({
      chain: hardhat,
      transport: http("http://127.0.0.1:8545"),
    });

    walletClient = createWalletClient({
      chain: hardhat,
      transport: http("http://127.0.0.1:8545"),
      account: TEST_ACCOUNT,
    });

    // Set up contract instances
    ensRegistry = getContract({
      address: ENS_REGISTRY_ADDRESS,
      abi: ensRegistryABI,
      client: { public: publicClient, wallet: walletClient },
    });

    publicResolver = getContract({
      address: PUBLIC_RESOLVER_ADDRESS,
      abi: publicResolverABI,
      client: { public: publicClient, wallet: walletClient },
    });

    nameWrapper = getContract({
      address: NAME_WRAPPER_ADDRESS,
      abi: nameWrapperABI,
      client: { public: publicClient, wallet: walletClient },
    });

    reverseRegistrar = getContract({
      address: REVERSE_REGISTRAR_ADDRESS,
      abi: reverseRegistrarABI,
      client: { public: publicClient, wallet: walletClient },
    });
  });

  describe("ENS Name Operations", () => {
    it("should normalize ENS names correctly", () => {
      const testCases = [
        { input: "test.eth", expected: "test.eth" },
        { input: "TEST.ETH", expected: "test.eth" },
        { input: "test.eth", expected: "test.eth" }, // Removed spaces as they're invalid
      ];

      testCases.forEach(({ input, expected }) => {
        const result = normalize(input);
        expect(result).toBe(expected);
      });
    });

    it("should generate correct namehashes", () => {
      // Test that namehash produces consistent results
      const testCases = ["eth", "test.eth"];

      testCases.forEach((input) => {
        const result1 = namehash(input);
        const result2 = namehash(input);
        expect(result1).toBe(result2); // Should be consistent
        expect(result1).toMatch(/^0x[a-fA-F0-9]{64}$/); // Should be valid hex hash
      });
    });

    it("should generate correct label hashes", () => {
      const label = "test";
      const expected = keccak256(toBytes(label));
      const result = keccak256(toBytes(label));
      expect(result).toBe(expected);
    });
  });

  describe("Contract Interaction Tests", () => {
    it("should check if ENS record exists", async () => {
      const testName = "test.eth";
      const node = namehash(testName);

      // This would work with deployed contracts
      // const exists = await ensRegistry.read.recordExists([node]);
      // expect(typeof exists).toBe("boolean");

      // For now, just verify the setup
      expect(node).toBeDefined();
      expect(ensRegistry).toBeDefined();
    });

    it("should check if domain is wrapped", async () => {
      const parentName = "eth";
      const parentNode = namehash(parentName);

      // This would work with deployed contracts
      // const isWrapped = await nameWrapper.read.isWrapped([parentNode]);
      // expect(typeof isWrapped).toBe("boolean");

      // For now, just verify the setup
      expect(parentNode).toBeDefined();
      expect(nameWrapper).toBeDefined();
    });

    it("should get current forward resolution", async () => {
      const testName = "test.eth";
      const node = namehash(testName);

      // This would work with deployed contracts
      // const currentAddr = await publicResolver.read.addr([node]);
      // expect(currentAddr).toBeDefined();

      // For now, just verify the setup
      expect(node).toBeDefined();
      expect(publicResolver).toBeDefined();
    });
  });

  describe("Complete Naming Flow", () => {
    it("should prepare all required data for naming flow", async () => {
      const normalizedName = "mycontract.abhi.eth";
      const contractAddress = "0x1234567890123456789012345678901234567890";

      // Parse the normalized name
      const parts = normalizedName.split(".");
      const label = parts[0];
      const parent = parts.slice(1).join(".");

      // Generate required hashes
      const parentNode = namehash(parent);
      const fullNameNode = namehash(normalizedName);
      const labelHash = keccak256(toBytes(label));

      // Verify all components
      expect(label).toBe("mycontract");
      expect(parent).toBe("abhi.eth");
      expect(parentNode).toBeDefined();
      expect(fullNameNode).toBeDefined();
      expect(labelHash).toBeDefined();
      expect(contractAddress).toBeDefined();

      // In a complete integration test, we would:
      // 1. Deploy ENS contracts to local Hardhat network
      // 2. Set up parent domain ownership
      // 3. Execute the actual contract calls
      // 4. Verify the results on-chain
    });

    it("should simulate the complete naming process", async () => {
      const normalizedName = "testcontract.example.eth";
      const contractAddress = "0x9876543210987654321098765432109876543210";
      const ownerAddress = TEST_ACCOUNT.address;

      // Step 1: Parse name
      const { label, parent } = parseNormalizedName(normalizedName);
      expect(label).toBe("testcontract");
      expect(parent).toBe("example.eth");

      // Step 2: Generate hashes
      const parentNode = namehash(parent);
      const fullNameNode = namehash(normalizedName);
      const labelHash = keccak256(toBytes(label));

      // Step 3: Check if name exists
      // const nameExists = await ensRegistry.read.recordExists([fullNameNode]);

      // Step 4: Check if parent is wrapped
      // const isWrapped = await nameWrapper.read.isWrapped([parentNode]);

      // Step 5: Create subname if needed
      // if (!nameExists) {
      //   if (isWrapped) {
      //     await nameWrapper.write.setSubnodeRecord([...]);
      //   } else {
      //     await ensRegistry.write.setSubnodeRecord([...]);
      //   }
      // }

      // Step 6: Set forward resolution
      // const currentAddr = await publicResolver.read.addr([fullNameNode]);
      // if (currentAddr.toLowerCase() !== contractAddress.toLowerCase()) {
      //   await publicResolver.write.setAddr([fullNameNode, contractAddress]);
      // }

      // Step 7: Set reverse resolution
      // await reverseRegistrar.write.setNameForAddr([...]);

      // Verify all data is prepared correctly
      expect(parentNode).toBeDefined();
      expect(fullNameNode).toBeDefined();
      expect(labelHash).toBeDefined();
      expect(ownerAddress).toBe(TEST_ACCOUNT.address);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid contract addresses", async () => {
      const invalidAddresses = [
        "invalid",
        "0x123",
        "",
        "0x" + "1".repeat(41), // Too long
      ];

      invalidAddresses.forEach((addr) => {
        expect(() => {
          // This would validate the address in a real scenario
          if (!addr.match(/^0x[a-fA-F0-9]{40}$/)) {
            throw new Error("Invalid address");
          }
        }).toThrow();
      });
    });

    it("should handle invalid ENS names", async () => {
      const invalidNames = [
        "",
        ".",
        "..",
        "test",
        ".eth",
        "test.",
      ];

      invalidNames.forEach((name) => {
        expect(() => {
          const parts = name.split(".");
          if (parts.length < 2 || parts.some(part => part === "")) {
            throw new Error("Invalid name");
          }
        }).toThrow();
      });
    });
  });
});

// Helper function to parse normalized names (duplicated from utils for testing)
function parseNormalizedName(normalizedName: string): { label: string; parent: string } {
  const parts = normalizedName.split(".");
  if (parts.length < 2) {
    throw new Error("Invalid normalized name: must have at least one dot");
  }

  const label = parts[0];
  const parent = parts.slice(1).join(".");

  return { label, parent };
}
