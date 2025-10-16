# Verification Guide: Demo Uses Built Plugin

This guide shows how to verify that the demo project is using your locally built `@enscribe/hardhat-enscribe` plugin.

## Quick Verification Checklist

### ✅ 1. Check Package Link

```bash
cd /Users/abhi/code/hardhat-enscribe/demo
pnpm list @enscribe/hardhat-enscribe
```

**Expected output:**
```
@enscribe/hardhat-enscribe 0.1.3 <- ..
```

The `<- ..` indicates it's linked to the parent directory (the plugin).

### ✅ 2. Verify Plugin Task is Available

```bash
npx hardhat enscribe name --help
```

**Expected output:**
```
Usage: hardhat [GLOBAL OPTIONS] enscribe name [--chain <STRING>] [--contract <STRING>] [--] name

OPTIONS:
  --chain      Chain on which the address is to be named
  --contract   Contract address for which the primary name is to be set
...
```

### ✅ 3. Check Symlink Structure

```bash
ls -la node_modules/@enscribe/
```

**Expected output:**
```
hardhat-enscribe -> ../../
enscribe -> ../../../enscribe-core
```

This shows:
- `hardhat-enscribe` → Links to plugin (`/Users/abhi/code/hardhat-enscribe`)
- `enscribe` → Links to library (`/Users/abhi/code/enscribe-core`)

### ✅ 4. Verify Source File is Loaded

```bash
node -p "require.resolve('@enscribe/hardhat-enscribe')"
```

**Expected output:**
```
/Users/abhi/code/hardhat-enscribe/dist/src/index.js
```

## Testing the Plugin

### Test 1: Check Task Registration

```bash
npx hardhat | grep enscribe
```

**Expected:**
You should see the `enscribe` tasks listed.

### Test 2: Deploy and Name a Contract

**Using the Hardhat Task:**
```bash
# First deploy a contract
npx hardhat ignition deploy ignition/modules/Counter.ts --network sepolia

# Then name it (replace 0x... with actual deployed address)
npx hardhat enscribe name mycounter.myname.eth \
  --contract 0xYourContractAddress \
  --chain sepolia
```

**Using the Library Directly in a Script:**
```bash
npx hardhat run scripts/deploy-and-name-simple.ts --network sepolia
```

### Test 3: Verify Plugin Code Changes

Make a test change to the plugin:

```typescript
// In /Users/abhi/code/hardhat-enscribe/src/internal/tasks/name.ts
console.log("🧪 TEST: Using local plugin build!");
```

Then rebuild and test:
```bash
cd /Users/abhi/code/hardhat-enscribe
pnpm run build

cd demo
npx hardhat enscribe name test.eth --contract 0x1234567890123456789012345678901234567890 --chain sepolia
```

You should see your test message appear!

## Workflow: Making Changes

When you make changes to the plugin or library:

### 1. Library Changes

```bash
cd /Users/abhi/code/enscribe-core
# Edit src/ files
pnpm run build
```

### 2. Plugin Changes

```bash
cd /Users/abhi/code/hardhat-enscribe
# Edit src/ files
pnpm run build
```

### 3. Test in Demo

```bash
cd /Users/abhi/code/hardhat-enscribe/demo
# No need to reinstall, changes are automatically available!
npx hardhat enscribe name ...
```

## Common Issues & Solutions

### Issue: "Cannot find module '@enscribe/hardhat-enscribe'"

**Solution:**
```bash
cd demo
rm -rf node_modules
pnpm install
```

### Issue: Changes Not Reflected

**Solution:** Rebuild the plugin/library
```bash
cd /Users/abhi/code/enscribe-core && pnpm run build
cd /Users/abhi/code/hardhat-enscribe && pnpm run build
```

### Issue: TypeScript Errors

**Solution:** Ensure both use same TypeScript version
```bash
# Check versions
cd /Users/abhi/code/enscribe-core && pnpm list typescript
cd /Users/abhi/code/hardhat-enscribe && pnpm list typescript
```

## Dependency Chain

```
Demo Project (demo/)
    ↓ links to
Hardhat Plugin (/Users/abhi/code/hardhat-enscribe)
    ↓ imports from
Core Library (/Users/abhi/code/enscribe-core)
```

**Files to watch:**
- **demo/package.json**: `"@enscribe/hardhat-enscribe": "link:.."`
- **plugin/package.json**: `"@enscribe/enscribe": "link:/Users/abhi/code/enscribe-core"`

## Network Configuration

Make sure your `demo/hardhat.config.ts` has the networks configured:

```typescript
networks: {
  sepolia: {
    type: "http",
    chainType: "l1",
    url: configVariable("SEPOLIA_RPC_URL"),
    accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
  },
  // Add more networks as needed
}
```

And your `.env` file has:
```
SEPOLIA_RPC_URL=https://rpc.sepolia.org
SEPOLIA_PRIVATE_KEY=your_private_key_here
```

## Success Indicators

✅ **Plugin is properly linked** when:
1. `pnpm list` shows `<- ..` for the plugin
2. Task help works: `npx hardhat enscribe name --help`
3. Plugin can import from library without errors
4. Changes to plugin source reflect after rebuild

✅ **Library is properly linked** when:
1. Plugin can import `@enscribe/enscribe`
2. Changes to library reflect in plugin after rebuild
3. No TypeScript errors about missing modules

---

**Last Updated**: October 15, 2025


