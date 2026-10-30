import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
const root=process.argv[2];
if(!root)throw Error('Usage: npm run prepare-assets -- /path/to/template-beat-em-up (with Git LFS files)');
const commit='ba9542d79b013b6446af1501f74dea3fcde0dcfc';
const models={
 chad:['characters/playable/chad/resources/spriteframes_chad.tres',['idle','walk','attack_1','attack_2','attack_3','jump','air_attack','hurt_high','knockout_landed']],
 sargent:['characters/enemies/sargent/resources/sarge_sprite_frames.tres',['idle','walk','punch_1','hurt_high','knockout_landed']],
 taxman:['characters/enemies/tax_man/resources/sprite_frames/tax_man_sprite_frames.tres',['idle','walk','slap','area_attack','hurt_light','knockout_kneeled']]
};
const scenes={sky:'skyboxes/area_1_skybox_1_0.png',city:'buildings/cityscape_00.png',cafe:'buildings/area_2_java_bean_dream_all.png',steak:'buildings/area_2_fire_tiger_steakhouse_all.png',mart:'buildings/foster_mart/area_2_foster_mart_store_all.png',road:'pavement/street_revised_straight.png',lanterns:'decorations/lantern/lanterns_1_50.png',lamp:'street_poles/lamp_poles/streetlamp_revised_2_00_50.png',vending:'vending_machines/vending_machines_clean_separated_red_50.png',wall:'tax_man_area/tax_man_back_brick_wall_dirty.png',throne:'tax_man_area/tax_man_throne_revised.png',tree:'tax_man_area/tax_man_tree_rightside.png'};
const manifest={upstream:'https://github.com/quiver-dev/template-beat-em-up',commit,license:'CC-BY-4.0',creator:'Quiver',modifications:'Selected frames; textures resized to 50% and encoded as WebP (quality 88). Street scenery recomposed by the browser renderer.',images:{},animations:{},scenes:{}};
await fs.rm('assets/images',{recursive:true,force:true});
await fs.rm('template-files/images',{recursive:true,force:true});
await fs.mkdir('assets/images',{recursive:true});
await fs.mkdir('template-files/images',{recursive:true});
const ids=new Map();
async function convert(file,scale=.5){
 if(ids.has(file))return ids.get(file);
 const id='img'+String(ids.size).padStart(3,'0');ids.set(file,id);
 const input=await fs.readFile(path.join(root,file)),meta=await sharp(input).metadata();
 const output=await sharp(input).resize(Math.round(meta.width*scale),Math.round(meta.height*scale)).webp({quality:88,alphaQuality:100}).toBuffer();
 await fs.writeFile(`${output.length<=16384?'assets':'template-files'}/images/${id}.webp`,output);
 manifest.images[id]={file:`images/${id}.webp`,width:meta.width,height:meta.height,source:file,source_sha256:createHash('sha256').update(input).digest('hex'),sha256:createHash('sha256').update(output).digest('hex')};return id;
}
for(const [character,[file,names]] of Object.entries(models)){
 const content=await fs.readFile(path.join(root,file),'utf8');
 const paths=Object.fromEntries([...content.matchAll(/path="res:\/\/([^"]+)" id="([^"]+)"/g)].map(m=>[m[2],m[1]]));
 manifest.animations[character]={};
 for(const match of content.matchAll(/"frames": \[([\s\S]*?)\],\s*"loop": (true|false),\s*"name": &"([^"]+)",\s*"speed": ([\d.]+)/g)){
  if(!names.includes(match[3]))continue;
  const frames=[];for(const ref of match[1].matchAll(/ExtResource\("([^"]+)"\)/g))frames.push(await convert(paths[ref[1]]));
  manifest.animations[character][match[3]]={frames,loop:match[2]==='true',fps:Number(match[4])};
 }
 for(const name of names)if(!manifest.animations[character][name])throw Error('Missing animation '+character+'/'+name);
}
for(const [name,file] of Object.entries(scenes))manifest.scenes[name]=await convert('stages/stage_01/stage_elements/'+file);
await fs.writeFile('assets/manifest.json',JSON.stringify(manifest,null,2)+'\n');
for(const [source,target] of [['LICENSE.txt','licenses/Quiver-MIT.txt'],['LICENSE_ASSETS.txt','licenses/Quiver-ASSETS.txt']])await fs.copyFile(path.join(root,source),target);
console.log(`Prepared ${ids.size} attributed images from ${commit}`);
