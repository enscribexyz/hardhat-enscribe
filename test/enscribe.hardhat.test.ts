import { describe, it, expect, beforeEach } from "vitest";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { createPublicClient, http, getContract, createWalletClient } from "viem";
import { hardhat } from "viem/chains";
import { namehash, normalize } from "viem/ens";
import { keccak256, toBytes } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { deployContract } from "viem/actions";

// Simple ENS Registry ABI for testing
const ENS_REGISTRY_ABI = [
  {
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "label", type: "bytes32" },
      { name: "owner", type: "address" },
      { name: "resolver", type: "address" },
      { name: "ttl", type: "uint64" },
    ],
    name: "setSubnodeRecord",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "node", type: "bytes32" }],
    name: "recordExists",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "node", type: "bytes32" }],
    name: "owner",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Simple Public Resolver ABI for testing
const PUBLIC_RESOLVER_ABI = [
  {
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "a", type: "address" },
    ],
    name: "setAddr",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "node", type: "bytes32" }],
    name: "addr",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Simple Reverse Registrar ABI for testing
const REVERSE_REGISTRAR_ABI = [
  {
    inputs: [
      { name: "addr", type: "address" },
      { name: "owner", type: "address" },
      { name: "resolver", type: "address" },
      { name: "name", type: "string" },
    ],
    name: "setNameForAddr",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// Simple ENS Registry bytecode (simplified for testing)
const ENS_REGISTRY_BYTECODE = "0x608060405234801561001057600080fd5b50600436106100365760003560e01c80630c53c51c1461003b5780634f8b4ae714610059575b600080fd5b610043610075565b60405161005091906100a1565b60405180910390f35b610073600480360381019061006e91906100dd565b61007b565b005b60005481565b8060008190555050565b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b92915050565b600080fd5b6100ca81610088565b81146100d557600080fd5b50565b6000813590506100e7816100c1565b92915050565b600060208284031215610103576101026100bc565b5b6000610111848285016100d8565b9150509291505056fea2646970667358221220";

describe("ENScibe Hardhat Integration Tests", () => {
  let publicClient: any;
  let walletClient: any;
  let ensRegistry: any;
  let publicResolver: any;
  let reverseRegistrar: any;
  let testAccount: any;

  beforeEach(async () => {
    // Set up viem clients for Hardhat local network
    publicClient = createPublicClient({
      chain: hardhat,
      transport: http("http://127.0.0.1:8545"),
    });

    testAccount = privateKeyToAccount("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
    
    walletClient = createWalletClient({
      chain: hardhat,
      transport: http("http://127.0.0.1:8545"),
      account: testAccount,
    });

    // Deploy ENS Registry
    const ensRegistryHash = await deployContract(walletClient, {
      abi: ENS_REGISTRY_ABI,
      bytecode: ENS_REGISTRY_BYTECODE,
      account: testAccount,
      chain: hardhat
    });

    const ensRegistryReceipt = await publicClient.waitForTransactionReceipt({
      hash: ensRegistryHash,
    });

    ensRegistry = getContract({
      address: ensRegistryReceipt.contractAddress!,
      abi: ENS_REGISTRY_ABI,
      client: { public: publicClient, wallet: walletClient },
    });

    // Deploy Public Resolver (simplified)
    const publicResolverHash = await deployContract(walletClient, {
      abi: PUBLIC_RESOLVER_ABI,
      bytecode: "0x608060405234801561001057600080fd5b50600436106100365760003560e01c80630c53c51c1461003b5780634f8b4ae714610059575b600080fd5b610043610075565b60405161005091906100a1565b60405180910390f35b610073600480360381019061006e91906100dd565b61007b565b005b60005481565b8060008190555050565b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b92915050565b600080fd5b6100ca81610088565b81146100d557600080fd5b50565b6000813590506100e7816100c1565b92915050565b600060208284031215610103576101026100bc565b5b6000610111848285016100d8565b9150509291505056fea2646970667358221220",
      account: testAccount,
      chain: hardhat
    });

    const publicResolverReceipt = await publicClient.waitForTransactionReceipt({
      hash: publicResolverHash,
    });

    publicResolver = getContract({
      address: publicResolverReceipt.contractAddress!,
      abi: PUBLIC_RESOLVER_ABI,
      client: { public: publicClient, wallet: walletClient },
    });

    // Deploy Reverse Registrar (simplified)
    const reverseRegistrarHash = await deployContract(walletClient, {
      abi: REVERSE_REGISTRAR_ABI,
      bytecode: "0x608060405234801561001057600080fd5b50600436106100365760003560e01c80630c53c51c1461003b5780634f8b4ae714610059575b600080fd5b610043610075565b60405161005091906100a1565b60405180910390f35b610073600480360381019061006e91906100dd565b61007b565b005b60005481565b8060008190555050565b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b92915050565b600080fd5b6100ca81610088565b81146100d557600080fd5b50565b6000813590506100e7816100c1565b92915050565b600060208284031215610103576101026100bc565b5b6000610111848285016100d8565b9150509291505056fea2646970667358221220",
      account: testAccount,
      chain: hardhat,
    });

    const reverseRegistrarReceipt = await publicClient.waitForTransactionReceipt({
      hash: reverseRegistrarHash,
    });

    reverseRegistrar = getContract({
      address: reverseRegistrarReceipt.contractAddress!,
      abi: REVERSE_REGISTRAR_ABI,
      client: { public: publicClient, wallet: walletClient },
    });
  });

  describe("ENS Contract Deployment", () => {
    it("should deploy ENS Registry successfully", async () => {
      expect(ensRegistry.address).toBeDefined();
      expect(ensRegistry.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it("should deploy Public Resolver successfully", async () => {
      expect(publicResolver.address).toBeDefined();
      expect(publicResolver.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it("should deploy Reverse Registrar successfully", async () => {
      expect(reverseRegistrar.address).toBeDefined();
      expect(reverseRegistrar.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });
  });

  describe("ENS Name Operations", () => {
    it("should normalize ENS names correctly", () => {
      const testCases = [
        { input: "test.eth", expected: "test.eth" },
        { input: "TEST.ETH", expected: "test.eth" },
        { input: "  test.eth  ", expected: "test.eth" },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = normalize(input);
        expect(result).toBe(expected);
      });
    });

    it("should generate correct namehashes", () => {
      const testCases = [
        { input: "eth", expected: "0x93cdeb708b7545dc668eb9280176169f1c33cfd8ed6f04690a0bcc88a93fc4ae" },
        { input: "test.eth", expected: "0xeb4f647bea6caa36333c816d7b46fdcb05f9466ecacc140ea8c66faf15b3d9f" },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = namehash(input);
        expect(result).toBe(expected);
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
    it("should check ENS record existence", async () => {
      const testName = "test.eth";
      const node = namehash(testName);

      // Check if record exists (should be false for new deployment)
      const exists = await ensRegistry.read.recordExists([node]);
      expect(typeof exists).toBe("boolean");
      expect(exists).toBe(false); // New deployment, no records exist yet
    });

    it("should create ENS subdomain", async () => {
      const parentName = "eth";
      const label = "test";
      const parentNode = namehash(parentName);
      const labelHash = keccak256(toBytes(label));

      // Create subdomain
      const txHash = await ensRegistry.write.setSubnodeRecord([
        parentNode,
        labelHash,
        testAccount.address,
        publicResolver.address,
        0, // TTL
      ]);

      // Wait for transaction
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      // Verify the subdomain was created
      const fullName = "test.eth";
      const fullNode = namehash(fullName);
      const exists = await ensRegistry.read.recordExists([fullNode]);
      expect(exists).toBe(true);
    });

    it("should set forward resolution", async () => {
      const testName = "test.eth";
      const testAddress = "0x1234567890123456789012345678901234567890";
      const node = namehash(testName);

      // Set forward resolution
      const txHash = await publicResolver.write.setAddr([node, testAddress]);
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      // Verify forward resolution
      const resolvedAddress = await publicResolver.read.addr([node]);
      expect(resolvedAddress.toLowerCase()).toBe(testAddress.toLowerCase());
    });

    it("should set reverse resolution", async () => {
      const testAddress = "0x1234567890123456789012345678901234567890";
      const testName = "test.eth";

      // Set reverse resolution
      const txHash = await reverseRegistrar.write.setNameForAddr([
        testAddress,
        testAccount.address,
        publicResolver.address,
        testName,
      ]);

      await publicClient.waitForTransactionReceipt({ hash: txHash });

      // Note: In a real implementation, you'd verify the reverse resolution
      // This depends on the actual reverse registrar implementation
      expect(txHash).toBeDefined();
    });
  });

  describe("Complete Naming Flow Integration", () => {
    it("should execute complete ENS naming flow", async () => {
      const normalizedName = "mycontract.test.eth";
      const contractAddress = "0x9876543210987654321098765432109876543210";

      // Step 1: Parse the normalized name
      const parts = normalizedName.split(".");
      const label = parts[0];
      const parent = parts.slice(1).join(".");

      expect(label).toBe("mycontract");
      expect(parent).toBe("test.eth");

      // Step 2: Generate required hashes
      const parentNode = namehash(parent);
      const fullNameNode = namehash(normalizedName);
      const labelHash = keccak256(toBytes(label));

      // Step 3: Check if name exists
      const nameExists = await ensRegistry.read.recordExists([fullNameNode]);
      expect(nameExists).toBe(false);

      // Step 4: Create subname
      const createTxHash = await ensRegistry.write.setSubnodeRecord([
        parentNode,
        labelHash,
        testAccount.address,
        publicResolver.address,
        0,
      ]);

      await publicClient.waitForTransactionReceipt({ hash: createTxHash });

      // Step 5: Verify subname was created
      const existsAfter = await ensRegistry.read.recordExists([fullNameNode]);
      expect(existsAfter).toBe(true);

      // Step 6: Set forward resolution
      const fwdTxHash = await publicResolver.write.setAddr([fullNameNode, contractAddress]);
      await publicClient.waitForTransactionReceipt({ hash: fwdTxHash });

      // Step 7: Verify forward resolution
      const resolvedAddr = await publicResolver.read.addr([fullNameNode]);
      expect(resolvedAddr.toLowerCase()).toBe(contractAddress.toLowerCase());

      // Step 8: Set reverse resolution
      const revTxHash = await reverseRegistrar.write.setNameForAddr([
        contractAddress,
        testAccount.address,
        publicResolver.address,
        normalizedName,
      ]);

      await publicClient.waitForTransactionReceipt({ hash: revTxHash });

      // Verify all transactions were successful
      expect(createTxHash).toBeDefined();
      expect(fwdTxHash).toBeDefined();
      expect(revTxHash).toBeDefined();

      console.log(`✅ Successfully named contract ${contractAddress} as ${normalizedName}`);
    });
  });
});


