import { isAddress } from "viem";

function isEmpty(value: string) {
  return value == null || value.trim().length === 0;
}

export const isAddressEmpty = (existingContractAddress: string): boolean => {
  return isEmpty(existingContractAddress);
};

export const isAddressValid = (existingContractAddress: string): boolean => {
  if (isEmpty(existingContractAddress)) {
    return false;
  }

  if (!isAddress(existingContractAddress)) {
    return false;
  }

  return true;
};

export const parseNormalizedName = (
  normalizedName: string,
): { label: string; parent: string } => {
  const parts = normalizedName.split(".");
  if (parts.length < 2) {
    throw new Error("Invalid normalized name: must have at least one dot");
  }

  const label = parts[0];
  const parent = parts.slice(1).join(".");

  return { label, parent };
};
