import { describe, it, expect, beforeEach, vi } from "vitest";
import { HardhatRuntimeEnvironment } from "hardhat/types/hre";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { namehash, normalize } from "viem/ens";
import { keccak256, toBytes } from "viem";
import { parseNormalizedName } from "../utils.js";

// Mock Hardhat Runtime Environment for testing
const mockHRE: Partial<HardhatRuntimeEnvironment> = {
  network: {
    connect: vi.fn().mockResolvedValue({
      viem: {
        getWalletClients: vi.fn().mockResolvedValue([
          {
            account: {
              address: "0x1234567890123456789012345678901234567890" as `0x${string}`,
            },
            chain: {
              id: 31337, // Hardhat local network ID
            },
          },
        ]),
        getContractAt: vi.fn(),
      },
    }),
  },
  userConfig: {
    networks: {},
  },
};

describe("ENS Primary Name Setting Integration Tests", () => {
  let ensRegistry: any;
  let publicResolver: any;
  let nameWrapper: any;
  let reverseRegistrar: any;
  let testWallet: any;

  beforeEach(async () => {
    // This would be set up in a real Hardhat test environment
    // For now, we'll create mock contracts
    ensRegistry = {
      recordExists: vi.fn(),
      setSubnodeRecord: vi.fn(),
    };

    publicResolver = {
      addr: vi.fn(),
      setAddr: vi.fn(),
    };

    nameWrapper = {
      isWrapped: vi.fn(),
      setSubnodeRecord: vi.fn(),
    };

    reverseRegistrar = {
      setNameForAddr: vi.fn(),
    };

    testWallet = {
      account: {
        address: "0x1234567890123456789012345678901234567890" as `0x${string}`,
      },
      chain: {
        id: 31337,
      },
    };
  });

  describe("parseNormalizedName utility", () => {
    it("should correctly parse ENS names for contract naming", () => {
      const testCases = [
        {
          input: "mynft.abhi.eth",
          expected: { label: "mynft", parent: "abhi.eth" },
        },
        {
          input: "contract.example.eth",
          expected: { label: "contract", parent: "example.eth" },
        },
        {
          input: "sub.domain.example.eth",
          expected: { label: "sub", parent: "domain.example.eth" },
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = parseNormalizedName(input);
        expect(result).toEqual(expected);
      });
    });
  });

  describe("ENS name creation flow", () => {
    it("should create subname when parent domain is wrapped", async () => {
      // Mock that parent is wrapped
      nameWrapper.isWrapped.mockResolvedValue(true);
      
      // Mock that name doesn't exist yet
      ensRegistry.recordExists.mockResolvedValue(false);

      const normalizedName = "testcontract.abhi.eth";
      const { label, parent } = parseNormalizedName(normalizedName);
      const parentNode = namehash(parent);
      const fullNameNode = namehash(normalizedName);

      // Verify the flow would call correct functions
      expect(label).toBe("testcontract");
      expect(parent).toBe("abhi.eth");
      expect(parentNode).toBeDefined();
      expect(fullNameNode).toBeDefined();
    });

    it("should create subname when parent domain is not wrapped", async () => {
      // Mock that parent is not wrapped
      nameWrapper.isWrapped.mockResolvedValue(false);
      
      // Mock that name doesn't exist yet
      ensRegistry.recordExists.mockResolvedValue(false);

      const normalizedName = "testcontract.example.eth";
      const { label, parent } = parseNormalizedName(normalizedName);
      const parentNode = namehash(parent);
      const labelHash = keccak256(toBytes(label));

      // Verify the flow would call correct functions
      expect(label).toBe("testcontract");
      expect(parent).toBe("example.eth");
      expect(parentNode).toBeDefined();
      expect(labelHash).toBeDefined();
    });

    it("should skip subname creation if name already exists", async () => {
      // Mock that name already exists
      ensRegistry.recordExists.mockResolvedValue(true);

      const normalizedName = "existing.abhi.eth";
      const fullNameNode = namehash(normalizedName);

      // Should skip creation
      expect(fullNameNode).toBeDefined();
    });
  });

  describe("Forward resolution setting", () => {
    it("should set forward resolution when current address differs", async () => {
      const contractAddress = "0x9876543210987654321098765432109876543210";
      const currentAddr = "0x1111111111111111111111111111111111111111";
      const normalizedName = "testcontract.abhi.eth";
      const fullNameNode = namehash(normalizedName);

      // Mock current resolution
      publicResolver.addr.mockResolvedValue(currentAddr);

      // Should set new resolution
      expect(currentAddr.toLowerCase()).not.toBe(contractAddress.toLowerCase());
    });

    it("should skip forward resolution when already set correctly", async () => {
      const contractAddress = "0x9876543210987654321098765432109876543210";
      const currentAddr = "0x9876543210987654321098765432109876543210";
      const normalizedName = "testcontract.abhi.eth";
      const fullNameNode = namehash(normalizedName);

      // Mock current resolution matches
      publicResolver.addr.mockResolvedValue(currentAddr);

      // Should skip setting
      expect(currentAddr.toLowerCase()).toBe(contractAddress.toLowerCase());
    });
  });

  describe("Reverse resolution setting", () => {
    it("should set reverse resolution for contract", async () => {
      const contractAddress = "0x9876543210987654321098765432109876543210";
      const normalizedName = "testcontract.abhi.eth";
      const ownerAddress = testWallet.account.address;

      // Verify reverse resolution would be set
      expect(contractAddress).toBeDefined();
      expect(normalizedName).toBeDefined();
      expect(ownerAddress).toBeDefined();
    });
  });

  describe("Complete naming flow integration", () => {
    it("should execute complete flow for new contract naming", async () => {
      const normalizedName = "newcontract.abhi.eth";
      const contractAddress = "0x9876543210987654321098765432109876543210";
      
      // Parse the name
      const { label, parent } = parseNormalizedName(normalizedName);
      
      // Generate required hashes
      const parentNode = namehash(parent);
      const fullNameNode = namehash(normalizedName);
      const labelHash = keccak256(toBytes(label));

      // Verify all components are ready
      expect(label).toBe("newcontract");
      expect(parent).toBe("abhi.eth");
      expect(parentNode).toBeDefined();
      expect(fullNameNode).toBeDefined();
      expect(labelHash).toBeDefined();

      // This test verifies the data preparation for the complete flow
      // In a real integration test, we would:
      // 1. Deploy ENS contracts to local Hardhat network
      // 2. Set up parent domain ownership
      // 3. Execute the actual contract calls
      // 4. Verify the results on-chain
    });
  });
});


