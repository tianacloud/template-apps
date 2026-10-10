import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

function relativeFile(value) {
  return typeof value === "string" && value !== "" && value !== "." && value !== ".." &&
    !value.startsWith("/") && !value.startsWith("../") && !value.includes("\\") &&
    path.posix.normalize(value) === value;
}

export async function readTemplateFiles(directory, relative = "") {
  const files = {};
  for (const entry of await readdir(path.join(directory, relative), { withFileTypes: true })) {
    if (["node_modules", "dist", ".git"].includes(entry.name)) continue;
    const name = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory()) Object.assign(files, await readTemplateFiles(directory, name));
    else if (entry.isFile()) files[name] = await readFile(path.join(directory, name));
    else throw new Error(`Template entry is not a regular file: ${name}`);
  }
  return files;
}

export function validateTemplateFiles(files, templateName) {
  const metadata = JSON.parse(files["metadata.json"]?.toString() ?? "null");
  if (!metadata || metadata.name !== templateName || !metadata.display_name?.trim() || !metadata.description?.trim())
    throw new Error("metadata.json requires the template name, display_name and description");
  const variables = metadata.variables ?? [];
  for (const variable of variables) {
    if (!variable.name || !variable.description?.trim() || !/^__TIANA_[A-Z0-9_]+_[a-f0-9]+__$/.test(variable.placeholder ?? "") || !variable.files?.length)
      throw new Error(`Variable ${variable.name ?? ""} requires a name, random placeholder, description and file locations`);
    for (const name of variable.files) {
      if (!relativeFile(name) || name === "metadata.json" || !files[name]?.includes(variable.placeholder))
        throw new Error(`Variable ${variable.name}: placeholder not found in ${name}`);
    }
    for (const [name, bytes] of Object.entries(files)) {
      if (name !== "metadata.json" && bytes.includes(variable.placeholder) && !variable.files.includes(name))
        throw new Error(`Variable ${variable.name}: unrecorded location ${name}`);
    }
  }
  for (const [name, bytes] of Object.entries(files)) {
    if (name === "metadata.json") continue;
    for (const placeholder of bytes.toString().match(/__TIANA_[A-Z0-9_]+_[a-f0-9]+__/g) ?? []) {
      if (!variables.some(variable => variable.placeholder === placeholder))
        throw new Error(`Unrecorded variable ${placeholder} in ${name}`);
    }
  }
  return metadata;
}

export async function validateTemplate(root, templateName) {
  if (!relativeFile(templateName) || templateName.includes("/")) throw new Error("Template name must identify one directory");
  return validateTemplateFiles(await readTemplateFiles(path.join(root, templateName)), templateName);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const name = process.argv[2];
    const metadata = await validateTemplate(process.cwd(), name);
    console.log(JSON.stringify({ name: metadata.name, valid: true }));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
