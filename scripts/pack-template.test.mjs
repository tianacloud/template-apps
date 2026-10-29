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
    database_required: true, name: "demo", display_name: "Demo", description: "Personal note application",
    variables: [{name: "WEB_ID", placeholder: "__TIANA_WEB_ID_abc139fd__", description: "The current web ID", files: ["src/config.json"]}],
    schema: "missing.sql",
  };
  await mkdir(path.join(directory, "showcase"));
  await writeFile(path.join(directory, "showcase/preview.html"), "<!doctype html><p>Demo</p>");
  await writeFile(path.join(directory, "showcase/cover.webp"), "webp-fixture");
  await writeFile(path.join(directory, "showcase/prompt.md"), "Make a notes app from demo.");
  await writeFile(path.join(directory, "metadata.json"), JSON.stringify(metadata));
  await writeFile(path.join(directory, "src/config.json"), '{"web":"__TIANA_WEB_ID_abc139fd__"}\n');
  await writeFile(path.join(directory, ".gitignore"), "node_modules/\ndist/\n");
  await writeFile(path.join(directory, "README.md"), "A complete source project\n");
  const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: "pipe" });
  await writeFile(path.join(directory, "model.bin"), Buffer.alloc(2 * 1024 * 1024, 0xab));
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
  assert.deepEqual(Buffer.from(zip["model.bin"]), await readFile(path.join(f.directory, "model.bin")));
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


test("pack preserves photo assets larger than one MiB", async t => {
  const f = await fixture(t);
  const photo = Buffer.alloc(2 * 1024 * 1024, 173);
  await writeFile(path.join(f.directory, "photo.jpg"), photo);
  const git = (...args) => execFileSync("git", args, {cwd: f.root, encoding: "utf8", stdio: "pipe"});
  git("add", "demo/photo.jpg");
  git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.test", "commit", "-qm", "Add photo asset");
  const result = await packTemplate(f.root, "demo", git("rev-parse", "HEAD").trim());
  const zip = unzipSync(new Uint8Array(await readFile(result.file)));
  assert.deepEqual(Buffer.from(zip["photo.jpg"]), photo);
});

test("installation package builds the selected source and separates preview and SQL", async t => {
  const f = await fixture(t);
  await mkdir(path.join(f.directory, "showcase"), { recursive: true });
  for (const [name, data] of Object.entries({"preview.html":"<h1>Demo</h1>","cover.webp":"fixture-cover","prompt.md":"Use the demo template"}))
    await writeFile(path.join(f.directory, "showcase", name), data);
  await writeFile(path.join(f.directory, "package.json"), JSON.stringify({name:"demo",version:"1.0.0",scripts:{build:"node build.cjs"}}));
  await writeFile(path.join(f.directory, "package-lock.json"), JSON.stringify({name:"demo",version:"1.0.0",lockfileVersion:3,packages:{"":{name:"demo",version:"1.0.0"}}}));
  await writeFile(path.join(f.directory, "build.cjs"), `const fs=require('fs'); fs.mkdirSync('dist',{recursive:true}); fs.writeFileSync('dist/app.js','console.log("selected source")'); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'app.js'}));`);
  await writeFile(path.join(f.directory, "seed.sql"), "INSERT OR IGNORE INTO apps(id) VALUES ('__TIANA_WEB_ID_abc139fd__');");
  f.metadata.seeds = "seed.sql";
  f.metadata.variables[0].files.push("seed.sql");
  await writeFile(path.join(f.directory, "metadata.json"), JSON.stringify(f.metadata));
  const git = (...args) => execFileSync("git",args,{cwd:f.root,encoding:"utf8",stdio:"pipe"});
  git("add", "."); git("-c","user.name=Fixture","-c","user.email=fixture@example.test","commit","-qm","Add installation materials");
  const commit = git("rev-parse","HEAD").trim();
  await writeFile(path.join(f.directory, "build.cjs"), "throw Error('uncommitted')");
  const {packInstallTemplate} = await import("./pack-template.mjs");
  const result = await packInstallTemplate(f.root,"demo",commit);
  const files = unzipSync(await readFile(result.file));
  const source = unzipSync(files["source.zip"]);
  const site = unzipSync(files["site.tweb"]);
  assert.match(strFromU8(site["data/app.js"]), /selected source/);
  assert.ok("web.yaml" in site);
  assert.equal(strFromU8(files["showcase/preview.html"]),"<h1>Demo</h1>");
  assert.equal(JSON.parse(strFromU8(source["metadata.json"])).source.commit,commit);
  assert.deepEqual(JSON.parse(strFromU8(files["install.json"])), {metadata:JSON.parse(strFromU8(source["metadata.json"])),entry:"app.js",database_required:true,variables:[{...f.metadata.variables[0],files:["seed.sql"]}]});
  assert.equal(strFromU8(files["seed.sql"]),await readFile(path.join(f.directory,"seed.sql"),"utf8"));
  const again = await packInstallTemplate(f.root,"demo",commit);
  assert.equal(again.sha256,result.sha256);
});

test("file seeds are validated and bounded before building", async () => {
  const { templateFileMaterials, validateSeedPath, checkInstallBudgets } = await import("./template-files.mjs");
  for (const name of ["/a", "../a", "a/../b", "a/./b", "a//b", "a/", "a\\b", "%2e%2e/a", "a%2fb", "%252e/a", "bad%", "a\0b", "\ud800"]) assert.throws(() => validateSeedPath(name));
  assert.throws(() => templateFileMaterials({"template-files/a": Buffer.from("a")}, {}), /declaration/);
  for (const file_seeds of [null, "", "other", false]) assert.throws(() => templateFileMaterials({}, {file_seeds}));
  assert.throws(() => templateFileMaterials({}, {file_seeds:"template-files"}), /1..256/);
  assert.throws(() => templateFileMaterials({"template-files/a": Buffer.alloc(16*1024*1024+1)}, {file_seeds:"template-files"}), /16 MiB/);
  assert.throws(() => templateFileMaterials({"template-files/a":Buffer.from("a"),"template-files/a/b":Buffer.from("b")}, {file_seeds:"template-files"}), /conflicts/);
  assert.throws(() => checkInstallBudgets({}, {}, {}, 32*1024*1024+1), /32 MiB/);
  assert.throws(() => checkInstallBudgets(Object.fromEntries(Array.from({length:5001},(_,i)=>[`${i}`,Buffer.alloc(0)])), {}, {}, 1), /recursive/);
});

test("file installation uses committed bytes, separate materials, stable raw digest and clean build", async t => {
  const f = await fixture(t);
  const { createHash } = await import("node:crypto");
  const { packInstallTemplate } = await import("./pack-template.mjs");
  const git = (...args) => execFileSync("git",args,{cwd:f.root,encoding:"utf8",stdio:"pipe"});
  await mkdir(path.join(f.directory,"template-files/images"),{recursive:true});
  await mkdir(path.join(f.directory,"template-files/documents"),{recursive:true});
  const photo = Buffer.alloc(24576,0xab), attachment = Buffer.from("Synthetic guide for template-file installation.\n");
  await writeFile(path.join(f.directory,"template-files/images/cover.webp"),photo);
  await writeFile(path.join(f.directory,"template-files/documents/guide.txt"),attachment);
  f.metadata.file_seeds="template-files";
  await writeFile(path.join(f.directory,"metadata.json"),JSON.stringify(f.metadata));
  await writeFile(path.join(f.directory,"package.json"),JSON.stringify({name:"demo",version:"1.0.0",scripts:{build:"node build.cjs"}}));
  await writeFile(path.join(f.directory,"package-lock.json"),JSON.stringify({name:"demo",version:"1.0.0",lockfileVersion:3,packages:{"":{name:"demo",version:"1.0.0"}}}));
  const build = `const fs=require('fs');fs.mkdirSync('dist',{recursive:true});fs.writeFileSync('dist/app.js','console.log("template-assets/images/cover.webp")');console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'app.js'}));`;
  await writeFile(path.join(f.directory,"build.cjs"),build);
  git("add",".");git("-c","user.name=Fixture","-c","user.email=fixture@example.test","commit","-qm","File seed fixture");
  const commit=git("rev-parse","HEAD").trim();
  await writeFile(path.join(f.directory,"template-files/images/cover.webp"),"uncommitted bytes");
  const result=await packInstallTemplate(f.root,"demo",commit);
  const zip=unzipSync(await readFile(result.file)),source=unzipSync(zip["source.zip"]),site=unzipSync(zip["site.tweb"]);
  const raw=Buffer.from(zip["install.json"]).toString(), manifest=JSON.parse(raw);
  assert.equal(manifest.format_version,2);assert.deepEqual(manifest.requires,["template_files_v1"]);
  assert.deepEqual(manifest.files.entries.map(e=>e.path),["documents/guide.txt","images/cover.webp"]);
  for(const entry of manifest.files.entries){
    const bytes=Buffer.from(zip[`files/${entry.path}`]);
    assert.deepEqual(bytes,Buffer.from(source[`template-files/${entry.path}`]));
    assert.equal(entry.size,bytes.length);assert.equal(entry.sha256,createHash("sha256").update(bytes).digest("hex"));
  }
  assert.deepEqual(Buffer.from(zip["files/images/cover.webp"]),photo);
  assert.equal(result.file_count,2);assert.equal(result.file_bytes,photo.length+attachment.length);
  const rawFiles=raw.slice(raw.lastIndexOf('"files":')+8,raw.lastIndexOf("}"));
  assert.equal(result.file_manifest_sha256,createHash("sha256").update(rawFiles).digest("hex"));
  assert.deepEqual(Object.keys(site),["data/app.js","web.yaml"]);
  assert.equal((await packInstallTemplate(f.root,"demo",commit)).sha256,result.sha256);
  for(const copy of ["fs.copyFileSync('template-files/images/cover.webp','dist/cover.webp');", "fs.appendFileSync('dist/app.js',fs.readFileSync('template-files/images/cover.webp').toString('base64'));"]){
    await writeFile(path.join(f.directory,"build.cjs"),build+copy);
    git("add","demo/build.cjs");git("-c","user.name=Fixture","-c","user.email=fixture@example.test","commit","-qm","Reject bad build");
    await assert.rejects(packInstallTemplate(f.root,"demo",git("rev-parse","HEAD").trim()),/embedded/);
  }
});

test("raw manifest digest matches the server UTF-8 vector", async () => {
  const { encodeInstallManifest } = await import("./template-files.mjs");
  const raw = '{"version":1,"root":"template-assets/","entries":[{"path":"a.txt","size":1,"sha256":"ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb","content_type":"text/plain"}]}';
  const encoded = encodeInstallManifest({}, {manifest:JSON.parse(raw)});
  assert.equal(encoded.file_manifest_sha256,"57712187d2dd348f35fab47c89a5455d96c5e0e3d7fa258ca6a7221c2acdf929");
  assert.ok(encoded.bytes.toString().includes(`"files":${raw}`));
});
