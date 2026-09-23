import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(rootDirectory, "..");
const mobileModules = path.resolve(repoRoot, "apps/mobile/node_modules");
const rootModules = path.resolve(repoRoot, "node_modules");

const packagesToLink = ["expo", "expo-asset", "expo-constants", "expo-font", "@expo/metro-runtime"];

function ensureSymlink(relativePath) {
  const source = path.resolve(mobileModules, relativePath);
  const target = path.resolve(rootModules, relativePath);

  if (!fs.existsSync(source)) return;
  if (fs.existsSync(target)) return;

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.symlinkSync(source, target, process.platform === "win32" ? "junction" : "dir");
}

for (const pkg of packagesToLink) {
  ensureSymlink(pkg);
}
