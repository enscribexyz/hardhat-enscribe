import type { NewTaskActionFunction } from "hardhat/types/tasks";
import type { HardhatRuntimeEnvironment } from "hardhat/types/hre";
import "@nomicfoundation/hardhat-viem";
import { namehash, normalize } from "viem/ens";
import { readContract, writeContract } from "viem/actions";
import { keccak256, toBytes } from "viem";
import ensRegistryABI from "../abi/ENSRegistry.js";
import ownableContractABI from "../abi/Ownable.js";
import nameWrapperABI from "../abi/NameWrapper.js";
import publicResolverABI from "../abi/PublicResolver.js";
import reverseRegistrarABI from "../abi/ReverseRegistrar.js";
import {
  isAddressEmpty,
  isAddressValid,
  parseNormalizedName,
} from "../utils.js";
import { WalletClient } from "viem";
import { getContractAddresses } from "../config/contracts.js";

// Global contracts object - will be initialized based on chain
let contracts: Record<string, string> = {};

interface TaskNameArguments {
  name: string;
  contract?: string;
  chain?: string;
}
const taskName: NewTaskActionFunction<TaskNameArguments> = async (
  args,
  hre: HardhatRuntimeEnvironment,
) => {
  // console.log(args);
  if (args.contract == null) {
    console.log("need to pass a contract address");
    return;
  }

  // Determine network from chain parameter or default to sepolia
  const networkName = args.chain || "sepolia";
  
  // Initialize global contracts object based on network
  contracts = getContractAddresses(networkName as any);

  const { viem } = await hre.network.connect(networkName);
  // console.log(hre.userConfig.networks);
  const [senderClient, recvrClient] = await viem.getWalletClients();
  // console.log(senderClient.account);

  const nameNormalized = normalize(args.name);
  console.log(`normalized name is ${nameNormalized}`);

  await setPrimaryName(nameNormalized, args.contract, senderClient);
};

const isOwnable = async (address: string, walletClient: WalletClient) => {
  if (isAddressEmpty(address) || !isAddressValid(address)) {
    return false;
  }

  try {
    const _ = (await readContract(walletClient, {
      address: address as `0x${string}`,
      abi: ownableContractABI,
      functionName: "owner",
      args: [],
    })) as `0x${string}`;

    console.log("contract ownable");
  } catch (err) {
    return false;
  }
  return true;
};


const isReverseClaimable = async (address: string, walletClient: WalletClient) => {
  if (isAddressEmpty(address) || !isAddressValid(address)) {
    return
  }

  try {
    const addrLabel = address.slice(2).toLowerCase()
    const reversedNode = namehash(addrLabel + '.' + 'addr.reverse')
    const resolvedAddr = (await readContract(walletClient, {
      address: contracts.ENS_REGISTRY as `0x${string}`,
      abi: ensRegistryABI,
      functionName: 'owner',
      args: [reversedNode],
    })) as `0x${string}`
    console.log('resolvedaddr is ' + resolvedAddr)

    if (resolvedAddr.toLowerCase() === walletClient.account?.address.toLowerCase()) {
      console.log('contract implements reverseclaimable')
      return true
    } else {
      console.log('contract does not implement reverseclaimable')
      return false
    }
  } catch (err) {
    console.log('there was an error checking if the contract was reverse claimer')
    return false
  }
}

const setPrimaryName = async (
  normalizedName: string,
  contractAddress: string,
  walletClient: WalletClient,
) => {
  const { label, parent } = parseNormalizedName(normalizedName);
  const parentNode = namehash(parent);
  const labelHash = keccak256(toBytes(label));

  const fullNameNode = namehash(normalizedName);
  const nameExists = (await readContract(walletClient, {
    address: contracts.ENS_REGISTRY as `0x${string}`,
    abi: ensRegistryABI,
    functionName: "recordExists",
    args: [fullNameNode],
  })) as boolean;

  // create subname
  if (!nameExists) {
    process.stdout.write(`creating subname ... `)
    let txn
    const isWrapped = await readContract(walletClient, {
      address: contracts.NAME_WRAPPER as `0x${string}`,
      abi: nameWrapperABI,
      functionName: "isWrapped",
      args: [parentNode],
    });

    if (isWrapped) {
      console.log(
        "create subname::writeContract calling setSubnodeRecord on NAME_WRAPPER",
      );
      txn = await writeContract(walletClient, {
        address: contracts.NAME_WRAPPER as `0x${string}`,
        abi: nameWrapperABI,
        functionName: "setSubnodeRecord",
        args: [
          parentNode,
          label,
          walletClient.account?.address,
          contracts.PUBLIC_RESOLVER,
          0,
          0,
          0,
        ],
        account: walletClient.account!,
        chain: walletClient.chain,
      });

      // await logMetric(
      //     corelationId,
      //     Date.now(),
      //     chainId,
      //     existingContractAddress,
      //     walletAddress,
      //     name,
      //     'subname::setSubnodeRecord',
      //     txn,
      //     isOwnable ? 'Ownable' : 'ReverseClaimer',
      //     opType,
      // )
    } else {
      console.log(
        "create subname::writeContract calling setSubnodeRecord on ENS_REGISTRY",
      );
      txn = await writeContract(walletClient, {
        address: contracts.ENS_REGISTRY as `0x${string}`,
        abi: ensRegistryABI,
        functionName: "setSubnodeRecord",
        args: [
          parentNode,
          labelHash,
          walletClient.account?.address,
          contracts.PUBLIC_RESOLVER,
          0,
        ],
        account: walletClient.account!,
        chain: walletClient.chain,
      });

      // await logMetric(
      //   corelationId,
      //   Date.now(),
      //   chainId,
      //   existingContractAddress,
      //   walletAddress,
      //   name,
      //   'subname::setSubnodeRecord',
      //   txn,
      //   isOwnable ? 'Ownable' : 'ReverseClaimer',
      //   opType,
      // )
    }
    process.stdout.write(`done with txn: ${txn}\n`);
  } else {
    process.stdout.write(`${normalizedName} already exists. skipping subname creation.\n`);
  }

  // set fwd res
  process.stdout.write(`setting forward resolution ... `)
  const currentAddr = (await readContract(walletClient, {
    address: contracts.PUBLIC_RESOLVER as `0x${string}`,
    abi: publicResolverABI,
    functionName: "addr",
    args: [fullNameNode],
  })) as `0x${string}`;

  if (currentAddr.toLowerCase() !== contractAddress.toLowerCase()) {
    console.log("set fwdres::writeContract calling setAddr on PUBLIC_RESOLVER");
    let txn = await writeContract(walletClient, {
      address: contracts.PUBLIC_RESOLVER as `0x${string}`,
      abi: publicResolverABI,
      functionName: "setAddr",
      args: [fullNameNode, contractAddress],
      account: walletClient.account!,
      chain: walletClient.chain,
    });

    // await logMetric(
    //   corelationId,
    //   Date.now(),
    //   chainId,
    //   existingContractAddress,
    //   walletAddress,
    //   name,
    //   'fwdres::setAddr',
    //   txn,
    //   isOwnable ? 'Ownable' : 'ReverseClaimer',
    //   opType,
    // )
    process.stdout.write(`done with txn: ${txn}\n`);
  } else {
    process.stdout.write("forward resolution already set.\n");
  }

  // set rev res
  process.stdout.write(`setting reverse resolution ... `)
  let txn
  if(await isReverseClaimable(contractAddress, walletClient)){
    const addrLabel = contractAddress.slice(2).toLowerCase()
    const reversedNode = namehash(addrLabel + '.' + 'addr.reverse')
     txn = await writeContract(walletClient, {
       address: contracts.PUBLIC_RESOLVER as `0x${string}`,
       abi: publicResolverABI,
      functionName: 'setName',
      args: [
        reversedNode,
        normalizedName,
      ],
      account: walletClient.account!,
      chain: walletClient.chain
    })
  } else if(await isOwnable(contractAddress, walletClient)) {
    txn = await writeContract(walletClient, {
      address: contracts.REVERSE_REGISTRAR as `0x${string}`,
      abi: reverseRegistrarABI,
      functionName: "setNameForAddr",
      args: [
        contractAddress,
        walletClient.account?.address,
        contracts.PUBLIC_RESOLVER,
        normalizedName,
      ],
      account: walletClient.account!,
      chain: walletClient.chain,
    });
  }

  // await logMetric(
  //   corelationId,
  //   Date.now(),
  //   chainId,
  //   existingContractAddress,
  //   walletAddress,
  //   name,
  //   'revres::setNameForAddr',
  //   txn,
  //   'Ownable',
  //   opType,
  // )
  process.stdout.write(`done with txn: ${txn}\n`);
  console.log(
    `✨ Contract named: https://app.enscribe.xyz/explore/${walletClient.chain?.id}/${normalizedName}`,
  );
};

export default taskName;
