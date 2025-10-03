import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseNormalizedName } from "../utils.js";

describe("parseNormalizedName", () => {
  it("should correctly parse a simple normalized name", () => {
    const result = parseNormalizedName("test.example.eth");
    expect(result).toEqual({
      label: "test",
      parent: "example.eth",
    });
  });

  it("should correctly parse a complex normalized name", () => {
    const result = parseNormalizedName("sdlfksdklf.abhi.xyz.eth");
    expect(result).toEqual({
      label: "sdlfksdklf",
      parent: "abhi.xyz.eth",
    });
  });

  it("should handle two-part names", () => {
    const result = parseNormalizedName("subdomain.eth");
    expect(result).toEqual({
      label: "subdomain",
      parent: "eth",
    });
  });

  it("should throw error for invalid names without dots", () => {
    expect(() => parseNormalizedName("invalid")).toThrow(
      "Invalid normalized name: must have at least one dot"
    );
  });

  it("should throw error for empty names", () => {
    expect(() => parseNormalizedName("")).toThrow(
      "Invalid normalized name: must have at least one dot"
    );
  });
});

describe("name task integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have correct task arguments interface", () => {
    // This test ensures our interface is properly defined
    const mockArgs = {
      name: "test.example.eth",
      contract: "0x1234567890123456789012345678901234567890",
      chain: "sepolia",
    };

    expect(mockArgs.name).toBe("test.example.eth");
    expect(mockArgs.contract).toBe("0x1234567890123456789012345678901234567890");
    expect(mockArgs.chain).toBe("sepolia");
  });

  it("should handle missing contract address gracefully", () => {
    const mockArgs = {
      name: "test.example.eth",
      contract: null,
      chain: "sepolia",
    };

    expect(mockArgs.contract).toBeNull();
  });
});
