/**
 * Deploy Counter module using Ignition and name it with ENS
 * 
 * Usage:
 *   npx hardhat run scripts/deploy-counter-and-name.ts --network sepolia
 */

import hre from "hardhat";
import CounterModule from "../ignition/modules/Counter.js";
import { nameContract } from "@enscribe/enscribe";
import { normalize } from "viem/ens";

async function main() {
  console.log("\n📝 Deploying Counter module using Hardhat Ignition...");
  
  const connection = await hre.network.connect();
  const { counter } = await connection.ignition.deploy(CounterModule);

  console.log(`✅ Counter deployed to: ${counter.address}`);
  
  // Get wallet client for naming
  const [walletClient] = await connection.viem.getWalletClients();
  console.log(`👤 Using account: ${walletClient.account?.address}`);
  
  // Type assertion to fix WalletClient compatibility
  const typedWalletClient = walletClient as any;
  
  // Get network name
  const networkName = connection.networkName;
  console.log(`🌐 Network: ${networkName}`);
  
  // ENS name for the contract (customize this for your needs)
  const ensName = `wpsqhsld.abhi.eth`;
  const normalizedName = normalize(ensName);
  
  console.log(`\n🏷️  Setting ENS name: ${normalizedName}`);
  console.log(`   Contract address: ${counter.address}`);
  
  try {
    const result = await nameContract({
      name: normalizedName,
      contractAddress: counter.address,
      walletClient: typedWalletClient,
      chainName: networkName,
      opType: "ignition-deploy-and-name",
      enableMetrics: true,
    });
    
    console.log("\n✅ Contract named successfully!");
    console.log(`\n📊 Results:`);
    console.log(`   Contract Type: ${result.contractType}`);
    console.log(`   Explorer URL: ${result.explorerUrl}`);
    
    console.log(`\n📝 Transactions:`);
    if (result.transactions.subname) {
      console.log(`   ✓ Subname creation: ${result.transactions.subname}`);
    }
    if (result.transactions.forwardResolution) {
      console.log(`   ✓ Forward resolution: ${result.transactions.forwardResolution}`);
    }
    if (result.transactions.reverseResolution) {
      console.log(`   ✓ Reverse resolution: ${result.transactions.reverseResolution}`);
    }
    if (result.transactions.l2ForwardResolution) {
      console.log(`   ✓ L2 forward resolution: ${result.transactions.l2ForwardResolution}`);
    }
    if (result.transactions.l2ReverseResolution) {
      console.log(`   ✓ L2 reverse resolution: ${result.transactions.l2ReverseResolution}`);
    }
    
    console.log(`\n🎉 Done! ${normalizedName} now resolves to ${counter.address}`);
    console.log(`   View at: ${result.explorerUrl}`);
  } catch (error: any) {
    console.error("\n❌ Error naming contract:");
    console.error(error.message || error);
    throw error;
  }
}

main().catch(console.error);


