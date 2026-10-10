import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, cp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { bindFixture } from "./fixtures/bind-template.mjs";

for (const name of ["study", "two-to-three", "whiteboard", "ledger", "notes", "calendar", "team-building"])
  test(`${name}: build from a verified source commit`, async (t) => {
    const directory = await mkdtemp(path.join(tmpdir(), `tiana-${name}-build-`));
    t.after(() => rm(directory, { recursive: true, force: true }));
    await cp(new URL(`../${name}/`, import.meta.url), directory, { recursive: true });
    await bindFixture(directory, name);
    const run = (command, args) => execFileSync(command, args, { cwd: directory, encoding: "utf8", stdio: "pipe" });
    run("npm", ["ci", "--ignore-scripts", "--no-audit", "--no-fund"]);
    run("git", ["init", "-q"]);
    run("git", ["add", "."]);
    run("git", ["-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", "commit", "-qm", "Application source fixture"]);
    const commit = run("git", ["rev-parse", "HEAD"]).trim();
    assert.equal(run("git", ["status", "--porcelain"]), "");
    const output = run(process.execPath, ["scripts/build.mjs", commit]);
    const parameters = JSON.parse(output.split("TIANA_PROJECT_PARAMS ")[1].trim());
    assert.equal(parameters.entry, "assets/app.js");
    assert.equal(parameters.database_instance_id, "sqlite-fixture");
    assert.equal(parameters.git_instance_id, "git-fixture");
    assert.equal(parameters.source_commit, commit);
    assert.equal(run("git", ["status", "--porcelain"]), "");
    assert.equal(run("git", ["rev-parse", "HEAD"]).trim(), commit);
    const module = await readFile(path.join(directory, "dist/assets/app.js"), "utf8");
    assert.ok(!module.includes("process.env.NODE_ENV"));
    await readFile(path.join(directory, "dist/assets/app.css"));
    if (name === "team-building") {
      run("npm", ["test"]);
      run("npm", ["run", "test:browser"]);
    }
    for (const args of [[], ["abc"]]) {
      assert.throws(() => run(process.execPath, ["scripts/build.mjs", ...args]), /完整提交号/);

    }
  });
