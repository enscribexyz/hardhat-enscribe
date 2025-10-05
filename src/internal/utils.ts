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

export const METRICS_URL = 'https://app.enscribe.xyz/api/v1/metrics'

export async function logMetric(
  corelationId: String,
  timestamp: number,
  chainId: number,
  contractAddress: String,
  senderAddress: String,
  name: String,
  step: String,
  txnHash: String,
  contractType: String,
  opType: String,
) {
  await fetch(METRICS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      co_id: corelationId,
      contract_address: contractAddress,
      ens_name: name,
      deployer_address: senderAddress,
      network: chainId,
      timestamp: Math.floor(timestamp / 1000),
      step: step,
      txn_hash: txnHash,
      contract_type: contractType,
      op_type: opType,
      source: 'enscribe',
    }),
  })
}