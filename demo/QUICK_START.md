# Quick Start: Deploy & Name a Contract

## Prerequisites

✅ Ensure the plugin is built:
```bash
cd /Users/abhi/code/enscribe-core && pnpm run build
cd /Users/abhi/code/hardhat-enscribe && pnpm run build
cd demo && pnpm install
```

## Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` with your credentials:
```env
SEPOLIA_RPC_URL=https://rpc.sepolia.org
SEPOLIA_PRIVATE_KEY=your_private_key_here
```

## Deploy and Name with Ignition

Deploy and name a Counter contract using Hardhat Ignition:

```bash
npx hardhat run scripts/deploy-counter-and-name.ts --network sepolia
```

**What it does:**
1. ✅ Deploys a new Counter contract using Ignition
2. ✅ Sets an ENS name (e.g., `wpsqhsld.abhi.eth`)
3. ✅ Names the contract using `@enscribe/enscribe` library
4. ✅ Shows all transaction hashes and explorer URL

**Example output:**
```
📝 Deploying Counter module using Hardhat Ignition...
✅ Counter deployed to: 0x1234...
👤 Using account: 0xabcd...
🌐 Network: sepolia

🏷️  Setting ENS name: wpsqhsld.abhi.eth
   Contract address: 0x1234...

creating subname ... done with txn: 0x...
setting forward resolution ... done with txn: 0x...
setting reverse resolution ... done with txn: 0x...

✅ Contract named successfully!
📊 Results:
   Contract Type: Ownable
   Explorer URL: https://app.enscribe.xyz/explore/11155111/wpsqhsld.abhi.eth

🎉 Done! wpsqhsld.abhi.eth now resolves to 0x1234...
```

## Alternative: Using the Hardhat Task

### Step 1: Deploy the contract

```bash
npx hardhat ignition deploy ignition/modules/Counter.ts --network sepolia
```

**Note the deployed address** from the output.

### Step 2: Name the contract

```bash
npx hardhat enscribe name mycounter.myname.eth \
  --contract 0xYourDeployedAddress \
  --chain sepolia
```

## Verify It's Using the Local Plugin

### Quick Check:
```bash
pnpm list @enscribe/hardhat-enscribe
```

Should show: `@enscribe/hardhat-enscribe 0.1.3 <- ..`

### Full Verification:
See [VERIFICATION.md](./VERIFICATION.md) for comprehensive verification steps.

## Supported Networks

You can use `--chain` with:
- **Testnets**: sepolia
- **Mainnets**: mainnet

The library automatically:
- ✅ Detects it's an L2 network
- ✅ Uses Sepolia L1 for ENS operations
- ✅ Sets up L2-specific resolution
- ✅ Handles both L1 and L2 transactions

## Troubleshooting

### "Task 'name' not found"
```bash
cd demo && rm -rf node_modules && pnpm install
```

### "Cannot find module '@enscribe/enscribe'"
```bash
cd /Users/abhi/code/enscribe-core && pnpm run build
cd /Users/abhi/code/hardhat-enscribe && pnpm run build
cd demo && pnpm install
```

### Changes not reflecting
After editing plugin or library source:
```bash
cd /Users/abhi/code/enscribe-core && pnpm run build
cd /Users/abhi/code/hardhat-enscribe && pnpm run build
# Demo uses it automatically via symlinks
```

## What's Happening Under the Hood

When you run the demo:

1. **Demo** uses `@enscribe/hardhat-enscribe` (symlinked to `../`)
2. **Plugin** uses `@enscribe/enscribe` library (symlinked to `../../enscribe-core`)
3. **Library** handles all ENS contract interactions

Your changes to source code → rebuild → immediately available in demo!

## Next Steps

- ✅ Deploy and name your own contracts
- ✅ Integrate ENS naming into your deployment workflows
- ✅ Try different networks (L1, L2)
- ✅ Customize the ENS names for your project

Happy naming! 🎉

