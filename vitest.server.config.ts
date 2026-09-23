import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@vera/core": path.resolve(rootDirectory, "packages/core/src/index.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["server/**/*.test.ts"],
    globals: false,
  },
});
