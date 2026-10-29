import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, writeFile, readFile, mkdtemp, rm, readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { zipSync, unzipSync } from "fflate";
import { validateTemplateFiles } from "./validate-template.mjs";

export async function packTemplate(root, templateName, sourceCommit = "HEAD") {
  if (!templateName || templateName === "." || templateName === ".." || /[/\\\0]/.test(templateName))
    throw new Error("Template name must identify one directory");
  const git = args => execFileSync("git", args, { cwd: root, stdio: "pipe", maxBuffer: 64 * 1024 * 1024 });
  const commit = git(["rev-parse", "--verify", `${sourceCommit}^{commit}`]).toString().trim();
  const prefix = `${templateName}/`;
  const tree = git(["ls-tree", "-r", "-z", commit, "--", templateName]).toString().split("\0").filter(Boolean);
  const files = {};
  for (const row of tree) {
    const [entry, file] = row.split("\t");
    const [mode, type, oid] = entry.split(" ");
    if (type !== "blob" || !["100644", "100755"].includes(mode) || !file.startsWith(prefix))
      throw new Error(`Template entry is not a regular file: ${file}`);
    files[file.slice(prefix.length)] = git(["cat-file", "blob", oid]);
  }
  const metadata = validateTemplateFiles(files, templateName);
  metadata.source = { repository: "https://github.com/tianacloud/template-apps", commit };
  files["metadata.json"] = Buffer.from(`${JSON.stringify(metadata, null, 2)}\n`);
  const entries = {};
  for (const name of Object.keys(files).sort()) entries[name] = files[name];
  const bytes = zipSync(entries, { level: 9, mtime: new Date(1980, 0, 1, 0, 0, 0) });
  const directory = path.join(root, "dist", templateName);
  await mkdir(directory, { recursive: true });
  const file = path.join(directory, `${commit}.zip`);
  const result = { name: templateName, source_commit: commit, file, size: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
  await writeFile(file, bytes);
  await writeFile(path.join(directory, `${commit}.json`), `${JSON.stringify(result, null, 2)}\n`);
  return result;
}

const zipOptions = { level: 9, mtime: new Date(1980, 0, 1, 0, 0, 0) };
function archive(entries) {
  return zipSync(Object.fromEntries(Object.entries(entries).sort(([a], [b]) => a.localeCompare(b))), zipOptions);
}

export async function packInstallTemplate(root, templateName, sourceCommit = "HEAD") {
  const source = await packTemplate(root, templateName, sourceCommit);
  const sourceBytes = await readFile(source.file);
  const files = unzipSync(sourceBytes);
  const metadata = JSON.parse(Buffer.from(files["metadata.json"]).toString());
  for (const file of ["showcase/preview.html", "showcase/cover.webp", "showcase/prompt.md"]) {
    if (!files[file]?.length) throw new Error(`Missing showcase material: ${file}`);
  }
  const directory = path.join(root, "dist", templateName);
  const buildRoot = await mkdtemp(path.join(directory, ".build-"));
  try {
    for (const [name, data] of Object.entries(files)) {
      await mkdir(path.dirname(path.join(buildRoot, name)), { recursive: true });
      await writeFile(path.join(buildRoot, name), data);
    }
    const webRepository = (metadata.repositories ?? []).find(repo => repo.key === metadata.web_repository);
    const webRoot = webRepository ? path.join(buildRoot, webRepository.path) : buildRoot;
    const run = (args) => execFileSync("npm", args, { cwd: webRoot, env: { ...process.env, TIANA_TEMPLATE_BUILD: "1" }, encoding: "utf8", stdio: "pipe", maxBuffer: 64 * 1024 * 1024 });
    run(["ci", "--no-audit", "--no-fund"]);
    const output = run(["run", "build", "--", source.source_commit]);
    const paramsLine = output.split("\n").find(line => line.startsWith("TIANA_PROJECT_PARAMS "));
    if (!paramsLine) throw new Error("Build must report TIANA_PROJECT_PARAMS with its entry");
    const { entry } = JSON.parse(paramsLine.slice("TIANA_PROJECT_PARAMS ".length));
    const siteFiles = { "web.yaml": new Uint8Array() };
    async function collect(relative = "") {
      for (const item of await readdir(path.join(webRoot, "dist", relative), { withFileTypes: true })) {
        const name = relative ? `${relative}/${item.name}` : item.name;
        if (item.isDirectory()) await collect(name);
        else if (item.isFile()) siteFiles[`data/${name}`] = await readFile(path.join(webRoot, "dist", name));
        else throw new Error(`Build output is not a regular file: ${name}`);
      }
    }
    await collect();
    if (!entry || !siteFiles[`data/${entry}`]) throw new Error("Build output is missing its fixed entry");
    for (const variable of metadata.site_variables ?? []) {
      for (const file of variable.files) {
        if (!siteFiles[`data/${file}`]?.includes(variable.placeholder))
          throw new Error(`Built site placeholder missing: ${file}`);
      }
    }
    const site = archive(siteFiles);
    if (site.length > 16 * 1024 * 1024 || Object.values(siteFiles).reduce((sum, data) => sum + data.length, 0) > 16 * 1024 * 1024 || Object.keys(siteFiles).length > 4097)
      throw new Error("Build exceeds the Web archive resource budget");
    const materials = {
      "source.zip": sourceBytes,
      "site.tweb": site,
      "showcase/preview.html": files["showcase/preview.html"],
      "showcase/cover.webp": files["showcase/cover.webp"],
      "showcase/prompt.md": files["showcase/prompt.md"],
    };
    const sqlFiles = new Map();
    for (const [field, target] of [["schema", "schema.sql"], ["seeds", "seed.sql"]]) {
      if (metadata[field] && files[metadata[field]]) {
        materials[target] = files[metadata[field]];
        sqlFiles.set(metadata[field], target);
      }
    }
    const variables = (metadata.variables ?? []).map(variable => ({
      ...variable, files: variable.files.filter(file => sqlFiles.has(file)).map(file => sqlFiles.get(file)),
    })).filter(variable => variable.files.length);
    for (const variable of variables) {
      if (!["WEB_ID", "SQLITE_INSTANCE_ID", "APP_NAME"].includes(variable.name))
        throw new Error(`Unsupported installation SQL variable: ${variable.name}`);
    }
    const manifest = { metadata, entry, database_required: metadata.database_required, variables };
    for (const key of ["private_database", "web_repository", "repositories", "functions", "site_variables"])
      if (metadata[key] !== undefined) manifest[key] = metadata[key];
    materials["install.json"] = Buffer.from(JSON.stringify(manifest, null, 2) + "\n");
    const bytes = archive(materials);
    const file = path.join(directory, `${source.source_commit}.install.zip`);
    await writeFile(file, bytes);
    const result = { name: templateName, source_commit: source.source_commit, file, source_file: source.file, size: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
    await writeFile(path.join(directory, `${source.source_commit}.install.json`), JSON.stringify(result, null, 2) + "\n");
    return result;
  } finally {
    await rm(buildRoot, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await packInstallTemplate(process.cwd(), process.argv[2], process.argv[3] ?? "HEAD");
    console.log(JSON.stringify(result));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
