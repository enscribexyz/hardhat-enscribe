# Development Guide - Hardhat ENScribe Plugin

## Overview

This is the Hardhat v3 plugin for ENScribe. It depends on the standalone `@enscribe/core` library.

## Repository Structure

- **Plugin Repository**: `/Users/abhi/code/hardhat-enscribe/` (this repo)
- **Core Library**: `/Users/abhi/code/enscribe/` (standalone library)

## Local Development Setup

### Prerequisites

1. Node.js >= 18.0.0
2. pnpm package manager

### Initial Setup

1. **Install plugin dependencies:**
```bash
cd /Users/abhi/code/hardhat-enscribe
pnpm install
```

2. **Link the local core library** (for development):
```bash
pnpm install /Users/abhi/code/enscribe
```

3. **Build the plugin:**
```bash
pnpm run build
```

## Development Workflow

### Working with Both Repositories

When developing features that span both the core library and the plugin:

1. **Make changes to the core library:**
```bash
cd /Users/abhi/code/enscribe
# Edit source files in src/
pnpm run build
```

2. **The plugin automatically uses the linked library:**
```bash
cd /Users/abhi/code/hardhat-enscribe
pnpm run build
pnpm test
```

### Plugin-Only Changes

If you're only changing plugin code (not the library):

```bash
cd /Users/abhi/code/hardhat-enscribe
# Edit files in src/
pnpm run build
pnpm test
```

### Testing

Run all tests:
```bash
pnpm test
```

Run specific test suites:
```bash
pnpm run test:unit        # Unit tests
pnpm run test:integration # Integration tests
pnpm run test:hardhat     # Hardhat integration tests (requires local node)
```

### Available Scripts

- `pnpm run build` - Build the TypeScript source
- `pnpm run lint` - Run ESLint
- `pnpm run format` - Format code with Prettier
- `pnpm test` - Run all tests
- `pnpm run test:unit` - Run unit tests only
- `pnpm run test:integration` - Run integration tests
- `pnpm run test:hardhat` - Run Hardhat integration tests

## Using Published Library

When the core library is published to npm, update `package.json`:

```json
{
  "dependencies": {
    "@enscribe/core": "^0.1.0"
  }
}
```

Then install normally:
```bash
pnpm install
```

## Project Structure

```
hardhat-enscribe/
├── src/
│   ├── index.ts                    # Plugin entry point
│   └── internal/
│       ├── tasks/
│       │   └── name.ts             # Main task implementation
│       ├── config/
│       │   └── contracts.ts        # (Now in @enscribe/core)
│       ├── type-extensions.ts      # Hardhat type extensions
│       └── constants.ts            # Constants
├── test/                           # Integration tests
├── demo/                           # Example usage
├── dist/                           # Built output (git-ignored)
└── package.json
```

## Publishing the Plugin

### Prerequisites

1. Ensure `@enscribe/core` is published to npm
2. Update `package.json` version
3. Build and test thoroughly

### Publishing Steps

```bash
# Build
pnpm run build

# Test
pnpm test

# Publish
pnpm publish
```

## Demo Application

Test the plugin with the demo application:

```bash
cd demo
pnpm install
npx hardhat name mycontract.myname.eth --contract 0x... --chain sepolia
```

## Common Tasks

### Adding a New Network

Networks are now configured in `@enscribe/core`. See the core library's documentation.

### Adding a New Task

1. Create task file in `src/internal/tasks/`
2. Register in `src/index.ts`
3. Add tests
4. Update documentation

### Debugging

Use TypeScript source maps for debugging:
```bash
# The built files include source maps
node --inspect-brk dist/src/index.js
```

## Troubleshooting

### "Cannot find module '@enscribe/core'"

The library isn't linked or installed:
```bash
# For development
pnpm install /Users/abhi/code/enscribe

# For production
pnpm install @enscribe/core
```

### Build Errors

```bash
# Clean and rebuild
rm -rf dist node_modules
pnpm install
pnpm run build
```

### Test Failures

```bash
# Ensure both repos are built
cd /Users/abhi/code/enscribe && pnpm run build
cd /Users/abhi/code/hardhat-enscribe && pnpm run build

# Run tests
pnpm test
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## Questions?

- Check the main [README.md](./README.md)
- Review the [core library docs](/Users/abhi/code/enscribe/README.md)
- Open an issue on GitHub

