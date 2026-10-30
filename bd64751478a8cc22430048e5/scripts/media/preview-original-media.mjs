// Local visual verification with the real App and unchanged media. This is an
// in-memory preview, not a Tiana authorization or persistence acceptance test.
import {build} from 'esbuild';
import {readFile, writeFile, mkdir, symlink, lstat} from 'node:fs/promises';
import {resolve} from 'node:path';

const args = process.argv.slice(2);
const option = name => args[args.indexOf(name) + 1];
if (!args.includes('--root') || !args.includes('--output')) throw new Error('Pass --root and --output');
const root = resolve(option('--root')), output = resolve(option('--output'));
const app = resolve(import.meta.dirname, '../..');
const mediaDirectory = resolve(root, 'artifacts/original-media/v1');
await mkdir(output, {recursive: true});
const manifest = JSON.parse(await readFile(resolve(mediaDirectory, 'manifest.json'), 'utf8'));
if (manifest.exerciseCount !== 5632) throw new Error('Complete media catalogue required');
const result = await build({
  absWorkingDir: app, entryPoints:['src/demo.jsx'], bundle:true, minify:true,
  format:'iife', target:'es2022', write:false, loader:{'.css':'text','.md':'text','.txt':'text'},
  define:{'process.env.NODE_ENV':'"production"','process.env.TIANA_TEMPLATE_SOURCE_URL':'"https://github.com/tianacloud/template-apps"','process.env.TIANA_DEMO':'"false"'}, legalComments:'none',
  plugins:[{name:'local-original-media',setup(b){
    b.onLoad({filter:/\/src\/demo\.jsx$/},async ({path}) => {
      let contents = await readFile(path, 'utf8');
      contents = contents.replace("'./demo-catalogue.js'", "'./catalogue.js'");
      contents = "import {ExerciseMedia} from './exercise-media.js';\n" + contents;
      contents = contents.replace('const index=new Map', "const media=new ExerciseMedia({get:path=>{if(!/^exercise-media\\/v1\\/(?:manifest\\.json|(?:still|clip)-[a-f0-9]{20}\\.zip)$/.test(path))throw new Error('Unexpected preview media path');return fetch('./media/'+path.slice('exercise-media/v1/'.length));}});\nconst index=new Map");
      contents = contents.replace('catalogue={catalogue}/>', 'catalogue={catalogue} media={media}/>');
      return {contents,loader:'jsx'};
    });
  }}],
});
const js = result.outputFiles[0].text.replaceAll('</script','<\\/script');
await writeFile(resolve(output,'index.html'),`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>openGym · 本地图示预览</title></head><body><div id="app"></div><script>${js}</script></body></html>`);
const mediaLink = resolve(output,'media');
if (!await lstat(mediaLink).catch(() => null)) await symlink(mediaDirectory,mediaLink,'dir');
console.log(JSON.stringify({preview:resolve(output,'index.html'),exercises:5632,mediaAssets:11264,data:'synthetic; page memory only',cloudAcceptance:false}));
