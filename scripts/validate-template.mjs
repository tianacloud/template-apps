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
  for (const name of ["showcase/preview.html", "showcase/cover.webp", "showcase/prompt.md"]) {
    if (!files[name]?.length) throw new Error(`Missing showcase material: ${name}`);
  }
  if (files["showcase/preview.html"].length > 500000) throw new Error("showcase/preview.html must not exceed 500,000 bytes before compression");
  if (typeof metadata.database_required !== "boolean") throw new Error("metadata.json requires database_required");
  const repositories = new Map();
  for (const repo of metadata.repositories ?? []) {
    if (!repo.key || repositories.has(repo.key) || !(repo.path === "." || relativeFile(repo.path)))
      throw new Error("Repositories require unique keys and relative source paths");
    repositories.set(repo.key, repo);
  }
  if (metadata.web_repository && !repositories.has(metadata.web_repository))
    throw new Error("web_repository must reference a repository");
  const functionKeys = new Set();
  for (const fn of metadata.functions ?? []) {
    const repo = repositories.get(fn.repository);
    if (!fn.key || functionKeys.has(fn.key) || !fn.name?.trim() || !repo)
      throw new Error("Functions require unique keys, names and a declared repository");
    functionKeys.add(fn.key);
    const dir = (fn.source_dir ?? "").replace(/\/+$/, "");
    if (fn.source_dir !== "/" && (!dir.startsWith("/") || !relativeFile(dir.slice(1))))
      throw new Error("Function source_dir must be a repository path starting with /");
    const prefix = (repo.path === "." ? "" : repo.path + "/") + (dir ? dir.slice(1) + "/" : "");
    if (!files[prefix + "go.mod"])
      throw new Error(`Function ${fn.key}: source_dir requires its own go.mod`);
    if (!Object.keys(files).some(name => name.startsWith(prefix) && !name.slice(prefix.length).includes("/") && name.endsWith(".go")))
      throw new Error(`Function ${fn.key}: missing Go entry source`);
    if (fn.database && (!metadata.database_required || !fn.database.endpoint_parameter || !fn.database.token_parameter || fn.database.endpoint_parameter === fn.database.token_parameter))
      throw new Error("Function database requires database_required and distinct parameter names");
  }
  const variables = [...(metadata.variables ?? [])];
  for (const repo of repositories.values()) {
    for (const v of repo.variables ?? []) variables.push({...v, files: v.files.map(file => repo.path === "." ? file : `${repo.path}/${file}`)});
  }
  const locations = new Map();
  for (const variable of variables) {
    if (!variable.name || !variable.description?.trim() || !/^__TIANA_[A-Z0-9_]+_[a-f0-9]+__$/.test(variable.placeholder ?? "") || !variable.files?.length)
      throw new Error(`Variable ${variable.name ?? ""} requires a name, random placeholder, description and file locations`);
    for (const name of variable.files) {
      if (!relativeFile(name) || name === "metadata.json" || !files[name]?.includes(variable.placeholder))
        throw new Error(`Variable ${variable.name}: placeholder not found in ${name}`);
    }
    const recorded = locations.get(variable.placeholder) ?? new Set();
    for (const name of variable.files) recorded.add(name);
    locations.set(variable.placeholder, recorded);
  }
  for (const variable of variables) {
    for (const [name, bytes] of Object.entries(files)) {
      if (name !== "metadata.json" && bytes.includes(variable.placeholder) && !locations.get(variable.placeholder).has(name))
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
