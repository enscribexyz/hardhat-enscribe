import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 60000, // Increase timeout for blockchain operations
    hookTimeout: 60000,
  },
});
