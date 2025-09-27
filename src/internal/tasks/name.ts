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
  const { viem } = await hre.network.connect("sepolia");
  // console.log(hre.userConfig.networks);
  const [senderClient, recvrClient] = await viem.getWalletClients();
  // console.log(senderClient.account);

  const nameNormalized = normalize(args.name);
  console.log(`normalized name is ${nameNormalized}`);

  await setPrimaryName(nameNormalized, args.contract, senderClient);
};

const checkIfOwnable = async (address: string, walletClient: WalletClient) => {
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
    address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e" as `0x${string}`,
    abi: ensRegistryABI,
    functionName: "recordExists",
    args: [fullNameNode],
  })) as boolean;

  // create subname
  if (!nameExists) {
    process.stdout.write(`creating subname ... `)
    let txn
    const isWrapped = await readContract(walletClient, {
      address: "0x0635513f179D50A207757E05759CbD106d7dFcE8" as `0x${string}`,
      abi: nameWrapperABI,
      functionName: "isWrapped",
      args: [parentNode],
    });

    if (isWrapped) {
      console.log(
        "create subname::writeContract calling setSubnodeRecord on NAME_WRAPPER",
      );
      txn = await writeContract(walletClient, {
        address: "0x0635513f179D50A207757E05759CbD106d7dFcE8" as `0x${string}`,
        abi: nameWrapperABI,
        functionName: "setSubnodeRecord",
        args: [
          parentNode,
          label,
          walletClient.account?.address,
          "0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5",
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
        address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e" as `0x${string}`,
        abi: ensRegistryABI,
        functionName: "setSubnodeRecord",
        args: [
          parentNode,
          labelHash,
          walletClient.account?.address,
          "0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5",
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
    address: "0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5" as `0x${string}`,
    abi: publicResolverABI,
    functionName: "addr",
    args: [fullNameNode],
  })) as `0x${string}`;

  if (currentAddr.toLowerCase() !== contractAddress.toLowerCase()) {
    console.log("set fwdres::writeContract calling setAddr on PUBLIC_RESOLVER");
    let txn = await writeContract(walletClient, {
      address: "0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5" as `0x${string}`,
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
  let txn = await writeContract(walletClient, {
    address: "0xA0a1AbcDAe1a2a4A2EF8e9113Ff0e02DD81DC0C6" as `0x${string}`,
    abi: reverseRegistrarABI,
    functionName: "setNameForAddr",
    args: [
      contractAddress,
      walletClient.account?.address,
      "0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5",
      normalizedName,
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
