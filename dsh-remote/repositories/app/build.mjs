import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const webSrcDir = path.join(rootDir, "web-src");
const distDir = path.join(rootDir, "dist");

const REQUIRED_MODULES = ["dsh-remote-entry.mjs", "dsh-remote-sw.js", "shell-ui.js"];
const ENTRY = "dsh-remote-entry.mjs";

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

if (!existsSync(webSrcDir)) {
  throw new Error("Missing web-src directory");
}

const modules = readdirSync(webSrcDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && /\.(mjs|js)$/u.test(entry.name))
  .map((entry) => entry.name)
  .sort();

for (const required of REQUIRED_MODULES) {
  if (!modules.includes(required)) {
    throw new Error(`Missing required frontend module: web-src/${required}`);
  }
}

for (const file of modules) {
  cpSync(path.join(webSrcDir, file), path.join(distDir, file));
}

const configPath = path.join(rootDir, "remote-config.json");
if (!existsSync(configPath)) {
  throw new Error("Missing remote-config.json");
}
JSON.parse(readFileSync(configPath, "utf8"));
cpSync(configPath, path.join(distDir, "remote-config.json"));

const iconPath = path.join(rootDir, "icon.png");
if (!existsSync(iconPath)) {
  throw new Error("Missing icon.png");
}
const iconHeader = readFileSync(iconPath).subarray(0, 8);
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!iconHeader.equals(pngSignature)) {
  throw new Error("icon.png must be a valid PNG image");
}
cpSync(iconPath, path.join(distDir, "icon.png"));

const builtFiles = [...modules, "remote-config.json", "icon.png"];
const totalBytes = builtFiles.reduce((sum, file) => sum + statSync(path.join(distDir, file)).size, 0);

console.log(`Built ${builtFiles.length} files into dist/ (${totalBytes} bytes)`);
console.log(`TIANA_PROJECT_PARAMS ${JSON.stringify({ entry: ENTRY })}`);
