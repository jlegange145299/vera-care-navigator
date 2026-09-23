import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDefaultConfig } from "expo/metro-config";

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
config.resolver.disableHierarchicalLookup = true;
config.resolver.extraNodeModules = {
  "@vera/core": path.resolve(workspaceRoot, "packages/core/src/index.ts"),
};

export default config;
