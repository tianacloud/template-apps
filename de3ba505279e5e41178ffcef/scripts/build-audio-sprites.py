#!/usr/bin/env python3
"""Join original MP3 streams into playable sprites; locate clips by PCM correlation."""
import hashlib,json,pathlib,subprocess,sys,tempfile
import numpy as np
source=pathlib.Path(sys.argv[1]); output=pathlib.Path(sys.argv[2]); output.mkdir(parents=True,exist_ok=True)
paths=sorted(source.glob('*.mp3'))
if len(paths)!=1376: raise SystemExit('Expected 1376 original clips')
def decode(p):return np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','f32le','-ac','1','-ar','22050','pipe:1'],capture_output=True,check=True).stdout,dtype='<f4')
def group_run(g):
 group=paths[g:g+24]; name=f'speech-{g//24:03d}.mp3'; index={}; audit={}
 with tempfile.TemporaryDirectory() as td:
  listing=pathlib.Path(td)/'concat.txt'
  listing.write_text(''.join("file '"+str(p.resolve()).replace("'", "'\\''")+"'\n" for p in group))
  subprocess.run(['ffmpeg','-v','error','-f','concat','-safe','0','-i',str(listing),'-c','copy','-y',str(output/name)],check=True,stderr=subprocess.DEVNULL)
  sprite=decode(output/name); previous=0
  for i,p in enumerate(group):
   a=decode(p); width=min(1024,len(a)); energy=np.convolve(a*a,np.ones(width),mode='valid'); anchor=int(np.argmax(energy)); lo=0 if i==0 else previous; hi=min(lo+5000,len(sprite)-len(a)); scores=np.correlate(sprite[lo+anchor:hi+anchor+width],a[anchor:anchor+width],'valid'); start=lo+int(np.argmax(scores)); b=sprite[start:start+len(a)]; denom=float(np.linalg.norm(a)*np.linalg.norm(b)); corr=float(np.dot(a,b)/denom) if denom else 0
   if corr < .999: raise RuntimeError(f'{p.name}: alignment correlation {corr}')
   index[p.stem]=[name,start,len(a)]; audit[p.name]={'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'correlation':corr}; previous=start+len(a)
 print(name,flush=True)
 return index,audit
import concurrent.futures
index={}; audit={}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for cues, hashes in pool.map(group_run,range(0,len(paths),24)):
  index.update(cues); audit.update(hashes)
(output/'cues.json').write_text(json.dumps({'sampleRate':22050,'clips':index},separators=(',',':'))+'\n')
pathlib.Path(sys.argv[3]).write_text(json.dumps(audit,sort_keys=True,indent=2)+'\n')
