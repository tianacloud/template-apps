import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { unzipSync, strFromU8 } from "fflate";
import { validateTemplate } from "./validate-template.mjs";
import { packTemplate } from "./pack-template.mjs";

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), "template-pack-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const directory = path.join(root, "demo");
  await mkdir(path.join(directory, "src"), { recursive: true });
  const metadata = {
    name: "demo", display_name: "Demo", description: "Personal note application",
    variables: [{name: "WEB_ID", placeholder: "__TIANA_WEB_ID_abc139fd__", description: "The current web ID", files: ["src/config.json"]}],
    schema: "missing.sql",
  };
  await writeFile(path.join(directory, "metadata.json"), JSON.stringify(metadata));
  await writeFile(path.join(directory, "src/config.json"), '{"web":"__TIANA_WEB_ID_abc139fd__"}\n');
  await writeFile(path.join(directory, ".gitignore"), "node_modules/\ndist/\n");
  await writeFile(path.join(directory, "README.md"), "A complete source project\n");
  const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: "pipe" });
  git("init", "-q"); git("add", ".");
  git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.test", "commit", "-qm", "Template fixture");
  return {root, directory, metadata, commit: git("rev-parse", "HEAD").trim()};
}

test("pack exports the selected commit, preserves files and adds actual source provenance", async t => {
  const f = await fixture(t);
  await writeFile(path.join(f.directory, "README.md"), "uncommitted private debug text");
  const result = await packTemplate(f.root, "demo", f.commit);
  const zip = unzipSync(new Uint8Array(await readFile(result.file)));
  assert.equal(strFromU8(zip["README.md"]), "A complete source project\n");
  assert.equal(strFromU8(zip[".gitignore"]), "node_modules/\ndist/\n");
  assert.equal(strFromU8(zip["src/config.json"]), '{"web":"__TIANA_WEB_ID_abc139fd__"}\n');
  const metadata = JSON.parse(strFromU8(zip["metadata.json"]));
  assert.equal(metadata.source.commit, f.commit);
  assert.equal(metadata.source.repository, "https://github.com/tianacloud/template-apps");
  assert.equal(metadata.schema, "missing.sql");
  assert.match(result.sha256, /^[a-f0-9]{64}$/);
  assert.equal(result.size, (await readFile(result.file)).length);
  assert.equal(JSON.parse(await readFile(path.join(f.directory, "metadata.json"))).source, undefined);
});

test("packing one source commit is reproducible", async t => {
  const f = await fixture(t);
  const first = await packTemplate(f.root, "demo", f.commit);
  const bytes = await readFile(first.file);
  const second = await packTemplate(f.root, "demo", f.commit);
  assert.equal(first.sha256, second.sha256);
  assert.deepEqual(bytes, await readFile(second.file));
});

test("validation checks every recorded placeholder location and accepts absent optional SQL", async t => {
  const f = await fixture(t);
  await validateTemplate(f.root, "demo");
  await writeFile(path.join(f.directory, "src/extra.txt"), "also __TIANA_WEB_ID_abc139fd__");
  await assert.rejects(validateTemplate(f.root, "demo"), /src\/extra.txt/);
  f.metadata.variables[0].files.push("src/extra.txt");
  await writeFile(path.join(f.directory, "metadata.json"), JSON.stringify(f.metadata));
  await validateTemplate(f.root, "demo");
  await writeFile(path.join(f.directory, "src/config.json"), '{"web":"no placeholder"}');
  await assert.rejects(validateTemplate(f.root, "demo"), /src\/config.json/);
});
