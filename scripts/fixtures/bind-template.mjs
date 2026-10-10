import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Test-only stand-in for the Agent editing the declared JSON values.
export async function bindFixture(directory, name) {
  const metadata = JSON.parse(await readFile(path.join(directory, "metadata.json"), "utf8"));
  const values = {WEB_ID: `fixture_${name}`, SQLITE_INSTANCE_ID: "sqlite-fixture", GIT_INSTANCE_ID: "git-fixture", APP_NAME: `Fixture ${name}`};
  for (const file of new Set(metadata.variables.flatMap(variable => variable.files))) {
    const visit = value => typeof value === "string"
      ? metadata.variables.reduce((text, variable) => text.split(variable.placeholder).join(values[variable.name]), value)
      : Array.isArray(value) ? value.map(visit)
      : value !== null && typeof value === "object" ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, visit(item)]))
      : value;
    const absolute = path.join(directory, file);
    await writeFile(absolute, JSON.stringify(visit(JSON.parse(await readFile(absolute, "utf8"))), null, 2) + "\n");
  }
}
