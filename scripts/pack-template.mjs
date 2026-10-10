import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { zipSync } from "fflate";
import { validateTemplateFiles } from "./validate-template.mjs";

export async function packTemplate(root, templateName, sourceCommit = "HEAD") {
  if (!templateName || templateName === "." || templateName === ".." || /[/\\\0]/.test(templateName))
    throw new Error("Template name must identify one directory");
  const git = args => execFileSync("git", args, { cwd: root, stdio: "pipe" });
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await packTemplate(process.cwd(), process.argv[2], process.argv[3] ?? "HEAD");
    console.log(JSON.stringify(result));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
