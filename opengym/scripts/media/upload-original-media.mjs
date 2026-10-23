// Upload the verified media to this personal app only. The manifest is last, so
// a partially uploaded library is never advertised as complete.
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

const args = process.argv.slice(2);
const option = name => args[args.indexOf(name) + 1];
if (!args.includes('--root') || !args.includes('--web')) throw new Error('Pass --root and --web');
const root = resolve(option('--root'));
const web = option('--web');
if (!/^[a-z0-9]{8,32}$/.test(web)) throw new Error('Invalid Web ID');
const toolkit = resolve(import.meta.dirname, '../../../..');
const directory = resolve(root, 'artifacts/original-media/v1');
const reportDir = resolve(root, 'analysis/media-rebuild/original-media');
await mkdir(reportDir, {recursive: true});
const receiptPath = resolve(reportDir, 'uploads.json');
let receipts;
try { receipts = JSON.parse(await readFile(receiptPath, 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; receipts = {web, completed: {}, unknown: null, allComplete: false}; }
if (receipts.web !== web || receipts.unknown) throw new Error('Resolve the previous upload outcome before continuing');
const manifest = JSON.parse(await readFile(resolve(directory, 'manifest.json'), 'utf8'));
if (manifest.exerciseCount !== 5632 || Object.keys(manifest.items).length !== 5632) throw new Error('Incomplete catalogue');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');

function cli(parameters) {
  const result = spawnSync(process.execPath, [resolve(toolkit, 'dist/cli/main.js'), '--root', root, '--json', 'tiana', '--', 'file', ...parameters, '--json'], {cwd: toolkit, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024});
  let response;
  try { response = JSON.parse(result.stdout); } catch {}
  return {exit: result.status, response, stderr: result.stderr, stdout: result.stdout};
}

const files = [...manifest.packs.map(p => p.path), 'MEDIA-NOTICE.md', 'NOTICE.md', 'manifest.json'];
for (let i = 0; i < files.length; i++) {
  const name = files[i], local = resolve(directory, name), remote = `${web}/exercise-media/v1/${name}`;
  const bytes = await readFile(local), sha256 = digest(bytes);
  const previous = receipts.completed[name];
  if (previous) {
    if (previous.sha256 !== sha256) throw new Error('Previously uploaded content changed: ' + name);
    continue;
  }
  // The initial legal-notice preflight was already uploaded; read it back once.
  if (name === 'NOTICE.md' && args.includes('--notice-preuploaded')) {
    const downloaded = resolve(reportDir, 'cloud-notice.md');
    const result = cli(['get', remote, downloaded]);
    if (result.exit || digest(await readFile(downloaded)) !== sha256) throw new Error('Legal notice readback failed');
    receipts.completed[name] = {remote, bytes: bytes.length, sha256, verifiedByReadback: true};
  } else {
    // Preserve the prospective write before making it, without replaying an
    // ambiguous upload after a process interruption.
    receipts.unknown = {name, remote, sha256, bytes: bytes.length};
    await writeFile(receiptPath, JSON.stringify(receipts, null, 2) + '\n');
    const result = cli(['put', local, remote]);
    await writeFile(resolve(reportDir, `upload-${i}.json`), JSON.stringify(result, null, 2) + '\n');
    const data = result.response?.data;
    if (result.exit || result.response?.status !== 'succeeded' || data?.completed !== true || data.path !== remote) {
      throw new Error('Upload outcome requires reconciliation: ' + name);
    }
    receipts.completed[name] = {...receipts.unknown, uploadID: data.upload_id, completed: true};
    receipts.unknown = null;
  }
  await writeFile(receiptPath, JSON.stringify(receipts, null, 2) + '\n');
  if ((i + 1) % 10 === 0 || i === files.length - 1) console.log(JSON.stringify({uploaded: i + 1, total: files.length}));
}
receipts.allComplete = true;
receipts.manifestSha256 = digest(await readFile(resolve(directory, 'manifest.json')));
await writeFile(receiptPath, JSON.stringify(receipts, null, 2) + '\n');
console.log(JSON.stringify({allComplete: true, web, exercises: 5632, mediaAssets: 11264, files: files.length}));
