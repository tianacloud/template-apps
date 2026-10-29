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

test("one Function placeholder can be recorded in multiple repositories", async t => {
  const f = await fixture(t);
  const variable = {name: "FUNCTION_ID:api", placeholder: "__TIANA_FUNCTION_API_abc139fd__", description: "API function", files: ["config.js"]};
  f.metadata.repositories = ["web", "worker"].map(key => ({key, path: `repositories/${key}`, variables: [variable]}));
  for (const repo of f.metadata.repositories) {
    await mkdir(path.join(f.directory, repo.path), {recursive: true});
    await writeFile(path.join(f.directory, repo.path, "config.js"), `export const api = '${variable.placeholder}';`);
  }
  await writeFile(path.join(f.directory, "metadata.json"), JSON.stringify(f.metadata));
  await validateTemplate(f.root, "demo");
  await writeFile(path.join(f.directory, "src/extra.js"), variable.placeholder);
  await assert.rejects(validateTemplate(f.root, "demo"), /unrecorded location src\/extra.js/);
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

test("backend install builds Web in shared repository and preserves Function recipes", async t => {
  const f = await fixture(t);
  const repo = path.join(f.directory, "repositories/app");
  await mkdir(path.join(repo, "functions/fn-old"), {recursive:true});
  await writeFile(path.join(repo, "functions/fn-old/main.go"), "package main\nfunc main() {}\n");
  await writeFile(path.join(repo,"package.json"),JSON.stringify({name:"demo",version:"1.0.0",scripts:{build:"node build.cjs"}}));
  await writeFile(path.join(repo,"package-lock.json"),JSON.stringify({name:"demo",version:"1.0.0",lockfileVersion:3,packages:{"":{name:"demo",version:"1.0.0"}}}));
  const placeholder = "__TIANA_FUNCTION_API_abc139fd__";
  await writeFile(path.join(repo,"app.js"),`call('${placeholder}');`);
  await writeFile(path.join(repo,"build.cjs"),`const fs=require('fs');fs.mkdirSync('dist');fs.copyFileSync('app.js','dist/app.js');console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'app.js'}));`);
  const variable = {name:"FUNCTION_ID:api",placeholder,description:"Function backend",files:["app.js"]};
  Object.assign(f.metadata,{private_database:true,web_repository:"app",
    repositories:[{key:"app",path:"repositories/app",variables:[variable]}],
    functions:[{key:"api",name:"API",repository:"app",source_directory:"functions/fn-old",database:{endpoint_parameter:"SQLITE_ENDPOINT",token_parameter:"SQLITE_TOKEN"}}],site_variables:[variable]});
  await writeFile(path.join(f.directory,"metadata.json"),JSON.stringify(f.metadata));
  const git = (...args) => execFileSync("git",args,{cwd:f.root,encoding:"utf8",stdio:"pipe"});
  git("add",".");git("-c","user.name=Fixture","-c","user.email=fixture@example.test","commit","-qm","Backend materials");
  const {packInstallTemplate} = await import("./pack-template.mjs");
  const result = await packInstallTemplate(f.root,"demo");
  const files = unzipSync(await readFile(result.file));
  const manifest = JSON.parse(strFromU8(files["install.json"]));
  for (const key of ["private_database","web_repository","repositories","functions","site_variables"])
    assert.deepEqual(manifest[key],f.metadata[key]);
  assert.match(strFromU8(unzipSync(files["site.tweb"])["data/app.js"]),/__TIANA_FUNCTION_API_abc139fd__/);
  assert.ok(unzipSync(files["source.zip"])["repositories/app/functions/fn-old/main.go"]);
});
