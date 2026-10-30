/* Sort splat indices back to front without WebAssembly. */
let centers = new Float32Array(0);
self.onmessage = ({data}) => {
  if (data.init) { centers = new Float32Array(data.init.splatCount * 4); self.postMessage({sortSetupPhase1Complete:true}); return; }
  if (data.centers) { centers.set(new Float32Array(data.centers), data.range.from * 4); return; }
  if (data.sort) {
    const s=data.sort, m=s.modelViewProj, indices=Array.from(s.indexesToSort.subarray(0,s.splatRenderCount));
    const depth=i=>{const p=i*4;return centers[p]*m[2]+centers[p+1]*m[6]+centers[p+2]*m[10]+m[14]};
    indices.sort((a,b)=>depth(b)-depth(a));
    self.postMessage({sortDone:true,splatSortCount:s.splatSortCount,splatRenderCount:s.splatRenderCount,sortTime:0,sortedIndexes:Uint32Array.from(indices)});
  }
};
