'use strict';
(function(){
const $ = s => document.querySelector(s);
const clamp = (v,a,b) => v<a?a:(v>b?b:v);
const FONT = 'system-ui,-apple-system,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif';
const LS_KEY = 'wbweb.doc.v2';
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,8);

const stage = $('#stage'), cv = $('#cv'), g = cv.getContext('2d'), ted = $('#tedit');
const measureCtx = document.createElement('canvas').getContext('2d');
const imgCache = new Map();

/* ── 状态 ── */
const S = {
  doc: null,
  cam: { x:0, y:0, z:1 },
  tool: 'pen',
  shape: 'rect',
  color: localStorage.getItem('wbweb.theme') === 'light' ? '#1c2126' : '#e8ecf1',
  w: { pen:[3,6,12], marker:[10,18,26], shape:[3,6,12], laser:[4,8,14], text:[22,30,44] },
  wi: { pen:1, marker:1, shape:1, laser:1, text:1 },
  undo: [], redo: [],
  laser: [],
  space:false, shift:false
};
const page = () => S.doc.pages[S.doc.pi];
const newPage = bg => ({ id:uid(), bg: bg||'white', objects:[] });
const newDoc = bg => ({ v:2, pi:0, pages:[newPage(bg)] });

let ip = null;          // 正在绘制的对象
let pan = null;         // 平移会话
let pinch = null;       // 双指会话
let lasing = null;      // 激光笔当前笔画
let erasing = false;
const ptrs = new Map();
let dirty = true;

/* ── 坐标变换 ── */
const s2wX = x => x / S.cam.z + S.cam.x;
const s2wY = y => y / S.cam.z + S.cam.y;
const DPR = () => Math.min(window.devicePixelRatio || 1, 2);

function resize(){
  const w = window.innerWidth, h = window.innerHeight, dpr = DPR();
  cv.width = Math.round(w*dpr); cv.height = Math.round(h*dpr);
  cv.style.width = w+'px'; cv.style.height = h+'px';
  dirty = true;
}
function afterCam(){ updateZoomLabel(); updateBg(); dirty = true; }
function updateBg(){
  stage.style.setProperty('--z', S.cam.z);
  stage.style.setProperty('--bx', (-S.cam.x*S.cam.z)+'px');
  stage.style.setProperty('--by', (-S.cam.y*S.cam.z)+'px');
}
function updateZoomLabel(){ $('#zVal').textContent = Math.round(S.cam.z*100)+'%'; }
function zoomAt(sx, sy, f){
  const z2 = clamp(S.cam.z*f, .15, 6);
  const wx = s2wX(sx), wy = s2wY(sy);
  S.cam.x = wx - sx/z2; S.cam.y = wy - sy/z2; S.cam.z = z2;
  afterCam();
}
function zoomBy(f){ zoomAt(cv.clientWidth/2, cv.clientHeight/2, f); }
function bbox(objs){
  if(!objs.length) return null;
  let x1=1e18,y1=1e18,x2=-1e18,y2=-1e18;
  for(const o of objs){
    if(o.type==='path'){
      for(const p of o.pts){
        x1=Math.min(x1,p.x-o.width); y1=Math.min(y1,p.y-o.width);
        x2=Math.max(x2,p.x+o.width); y2=Math.max(y2,p.y+o.width);
      }
    } else if(o.type==='shape'){
      const a=Math.min(o.x1,o.x2)-o.w, b=Math.max(o.x1,o.x2)+o.w;
      const c=Math.min(o.y1,o.y2)-o.w, d=Math.max(o.y1,o.y2)+o.w;
      x1=Math.min(x1,a); y1=Math.min(y1,c); x2=Math.max(x2,b); y2=Math.max(y2,d);
    } else if(o.type==='text'){
      const m = measureText(o);
      x1=Math.min(x1,o.x-4); y1=Math.min(y1,o.y-4);
      x2=Math.max(x2,o.x+m.w+4); y2=Math.max(y2,o.y+m.h+4);
    } else if(o.type==='image'){
      x1=Math.min(x1,o.x); y1=Math.min(y1,o.y);
      x2=Math.max(x2,o.x+o.w); y2=Math.max(y2,o.y+o.h);
    }
  }
  return { x:x1, y:y1, w:x2-x1, h:y2-y1 };
}
function fitView(){
  const bb = bbox(page().objects);
  if(!bb){ S.cam.x=0; S.cam.y=0; S.cam.z=1; }
  else{
    const pad=70;
    const z = clamp(Math.min((cv.clientWidth-pad*2)/bb.w, (cv.clientHeight-pad*2)/bb.h), .15, 3);
    S.cam.z = z;
    S.cam.x = bb.x - (cv.clientWidth/z - bb.w)/2;
    S.cam.y = bb.y - (cv.clientHeight/z - bb.h)/2;
  }
  afterCam();
}

/* ── 绘制 ── */
function measureText(o){
  measureCtx.font = o.size+'px '+FONT;
  const lines = String(o.text).split('\n');
  let w=0; for(const ln of lines) w = Math.max(w, measureCtx.measureText(ln).width);
  return { w:w, h: lines.length*o.size*1.28 };
}
function getImg(src){
  let im = imgCache.get(src);
  if(!im){ im = new Image(); im.src = src; imgCache.set(src, im); }
  return im;
}
function strokeOn(c, pts, color, width, alpha){
  c.save(); c.globalAlpha = alpha==null?1:alpha;
  c.strokeStyle = color; c.fillStyle = color;
  c.lineWidth = width; c.lineCap='round'; c.lineJoin='round';
  c.beginPath();
  if(pts.length===1){
    c.arc(pts[0].x, pts[0].y, Math.max(width/2, .6), 0, Math.PI*2); c.fill();
  } else if(pts.length===2){
    c.moveTo(pts[0].x, pts[0].y); c.lineTo(pts[1].x, pts[1].y); c.stroke();
  } else {
    c.moveTo(pts[0].x, pts[0].y);
    for(let i=1;i<pts.length-1;i++){
      const mx=(pts[i].x+pts[i+1].x)/2, my=(pts[i].y+pts[i+1].y)/2;
      c.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    const n=pts.length; c.lineTo(pts[n-1].x, pts[n-1].y); c.stroke();
  }
  c.restore();
}
function arrowHead(c, o){
  const a = Math.atan2(o.y2-o.y1, o.x2-o.x1);
  const h = Math.max(11, o.w*3.4);
  c.save(); c.fillStyle = o.color; c.beginPath();
  c.moveTo(o.x2, o.y2);
  c.lineTo(o.x2-h*Math.cos(a-0.42), o.y2-h*Math.sin(a-0.42));
  c.lineTo(o.x2-h*Math.cos(a+0.42), o.y2-h*Math.sin(a+0.42));
  c.closePath(); c.fill(); c.restore();
}
function drawOn(c, o){
  if(o.type==='path'){
    strokeOn(c, o.pts, o.color, o.width, o.tool==='marker' ? .32 : 1);
  } else if(o.type==='shape'){
    c.save(); c.strokeStyle=o.color; c.lineWidth=o.w; c.lineCap='round'; c.lineJoin='round';
    c.beginPath();
    if(o.shape==='rect') c.rect(o.x1, o.y1, o.x2-o.x1, o.y2-o.y1);
    else if(o.shape==='ellipse'){
      c.ellipse((o.x1+o.x2)/2, (o.y1+o.y2)/2, Math.abs(o.x2-o.x1)/2, Math.abs(o.y2-o.y1)/2, 0, 0, Math.PI*2);
    } else { c.moveTo(o.x1,o.y1); c.lineTo(o.x2,o.y2); }
    c.stroke(); c.restore();
    if(o.shape==='arrow') arrowHead(c, o);
  } else if(o.type==='text'){
    c.save(); c.fillStyle=o.color; c.textBaseline='top';
    c.font = o.size+'px '+FONT;
    const lines = String(o.text).split('\n');
    for(let i=0;i<lines.length;i++) c.fillText(lines[i], o.x, o.y+i*o.size*1.28);
    c.restore();
  } else if(o.type==='image'){
    const im = getImg(o.src);
    if(im.complete && im.naturalWidth) c.drawImage(im, o.x, o.y, o.w, o.h);
  }
}
function drawLaser(c){
  const now = performance.now();
  let alive = false;
  for(const L of S.laser){
    const age = (now - L.t0)/1500;
    if(age >= 1) continue;
    alive = true;
    const a = 1-age;
    strokeOn(c, L.pts, '#f43f5e', S.w.laser[S.wi.laser]*2.6, .20*a);
    strokeOn(c, L.pts, '#fb7185', S.w.laser[S.wi.laser]*1.1, .92*a);
  }
  if(alive) dirty = true; else S.laser.length = 0;
}
function render(){
  const dpr = DPR(), W = cv.clientWidth, H = cv.clientHeight;
  g.setTransform(dpr,0,0,dpr,0,0);
  g.clearRect(0,0,W,H);
  g.translate(-S.cam.x*S.cam.z, -S.cam.y*S.cam.z);
  g.scale(S.cam.z, S.cam.z);
  const objs = page().objects;
  for(let i=0;i<objs.length;i++) drawOn(g, objs[i]);
  if(ip) drawOn(g, ip);
  drawLaser(g);
}
function loop(){ if(dirty){ dirty=false; render(); } requestAnimationFrame(loop); }

/* ── 命中测试（橡皮 = 点谁删谁） ── */
function distSeg(px,py,a,b){
  const dx=b.x-a.x, dy=b.y-a.y, L2=dx*dx+dy*dy;
  let t = L2 ? ((px-a.x)*dx+(py-a.y)*dy)/L2 : 0;
  t = clamp(t,0,1);
  return Math.hypot(px-(a.x+t*dx), py-(a.y+t*dy));
}
function hit(o, wx, wy){
  const pad = 11;
  if(o.type==='path'){
    const pts=o.pts, r=o.width/2+pad;
    if(pts.length===1) return Math.hypot(wx-pts[0].x, wy-pts[0].y) <= r;
    for(let i=0;i<pts.length-1;i++) if(distSeg(wx,wy,pts[i],pts[i+1]) <= r) return true;
    return false;
  }
  if(o.type==='shape'){
    if(o.shape==='line'||o.shape==='arrow')
      return distSeg(wx,wy,{x:o.x1,y:o.y1},{x:o.x2,y:o.y2}) <= o.w/2+pad;
    return wx>=Math.min(o.x1,o.x2)-pad && wx<=Math.max(o.x1,o.x2)+pad
        && wy>=Math.min(o.y1,o.y2)-pad && wy<=Math.max(o.y1,o.y2)+pad;
  }
  if(o.type==='text'){
    const m = measureText(o);
    return wx>=o.x-pad && wx<=o.x+m.w+pad && wy>=o.y-pad && wy<=o.y+m.h+pad;
  }
  if(o.type==='image'){
    return wx>=o.x-pad && wx<=o.x+o.w+pad && wy>=o.y-pad && wy<=o.y+o.h+pad;
  }
  return false;
}
function eraseAt(wx, wy){
  const objs = page().objects;
  for(let i=objs.length-1;i>=0;i--){
    if(hit(objs[i], wx, wy)){ pushUndo(); objs.splice(i,1); scheduleSave(); dirty=true; return; }
  }
}

/* ── 指针输入 ── */
cv.addEventListener('pointerdown', e=>{
  e.preventDefault();
  try{ cv.setPointerCapture(e.pointerId); }catch(err){}
  ptrs.set(e.pointerId, { x:e.offsetX, y:e.offsetY });
  if(ptrs.size===2){
    ip=null; lasing=null; erasing=false; pan=null;
    const a=[...ptrs.values()][0], b=[...ptrs.values()][1];
    const mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
    pinch = { d: Math.hypot(a.x-b.x, a.y-b.y)||1, z:S.cam.z, wx:s2wX(mx), wy:s2wY(my) };
    dirty=true; return;
  }
  if(e.button===1 || S.space){
    pan = { sx:e.offsetX, sy:e.offsetY, cx:S.cam.x, cy:S.cam.y };
    cv.style.cursor='grabbing';
    return;
  }
  if(e.pointerType==='mouse' && e.button!==0) return;
  startTool(e.offsetX, e.offsetY);
});
cv.addEventListener('pointermove', e=>{
  const rec = ptrs.get(e.pointerId);
  if(!rec) return;
  rec.x=e.offsetX; rec.y=e.offsetY;
  if(pinch && ptrs.size>=2){
    const vs=[...ptrs.values()], a=vs[0], b=vs[1];
    const d = Math.hypot(a.x-b.x, a.y-b.y)||1;
    const mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
    const z2 = clamp(pinch.z*(d/pinch.d), .15, 6);
    S.cam.x = pinch.wx - mx/z2; S.cam.y = pinch.wy - my/z2; S.cam.z = z2;
    afterCam(); return;
  }
  if(pan){
    S.cam.x = pan.cx - (e.offsetX-pan.sx)/S.cam.z;
    S.cam.y = pan.cy - (e.offsetY-pan.sy)/S.cam.z;
    afterCam(); return;
  }
  moveTool(e.offsetX, e.offsetY);
});
function endPtr(e){
  ptrs.delete(e.pointerId);
  if(ptrs.size<2) pinch=null;
  if(pan && ptrs.size===0){ pan=null; setCursor(); }
  if(ptrs.size===0) endTool();
}
cv.addEventListener('pointerup', endPtr);
cv.addEventListener('pointercancel', endPtr);
cv.addEventListener('contextmenu', e=>e.preventDefault());

function startTool(sx, sy){
  const wx=s2wX(sx), wy=s2wY(sy);
  if(S.tool==='pen' || S.tool==='marker'){
    ip = { type:'path', tool:S.tool, color:S.color, width:S.w[S.tool][S.wi[S.tool]], pts:[{x:wx,y:wy}] };
  } else if(S.tool==='shape'){
    ip = { type:'shape', shape:S.shape, color:S.color, w:S.w.shape[S.wi.shape], x1:wx, y1:wy, x2:wx, y2:wy };
  } else if(S.tool==='text'){
    openEditor(sx, sy);
  } else if(S.tool==='laser'){
    lasing = { pts:[{x:wx,y:wy}], t0:performance.now() };
    S.laser.push(lasing);
  } else if(S.tool==='eraser'){
    erasing = true; eraseAt(wx, wy);
  }
  dirty=true;
}
function moveTool(sx, sy){
  const wx=s2wX(sx), wy=s2wY(sy);
  if(ip){
    if(ip.type==='path'){
      const p=ip.pts, last=p[p.length-1];
      if(Math.hypot(wx-last.x, wy-last.y) >= 1.2) p.push({x:wx,y:wy});
    } else if(ip.type==='shape'){
      let x2=wx, y2=wy;
      if(S.shift){
        const dx=x2-ip.x1, dy=y2-ip.y1;
        if(ip.shape==='rect' || ip.shape==='ellipse'){
          const s=Math.max(Math.abs(dx), Math.abs(dy));
          x2=ip.x1+(dx<0?-1:1)*s; y2=ip.y1+(dy<0?-1:1)*s;
        } else {
          const a=Math.atan2(dy,dx), step=Math.PI/12;
          const sa=Math.round(a/step)*step, len=Math.hypot(dx,dy);
          x2=ip.x1+Math.cos(sa)*len; y2=ip.y1+Math.sin(sa)*len;
        }
      }
      ip.x2=x2; ip.y2=y2;
    }
    dirty=true;
  } else if(lasing){
    const p=lasing.pts, last=p[p.length-1];
    if(Math.hypot(wx-last.x, wy-last.y) >= 2){ p.push({x:wx,y:wy}); lasing.t0=performance.now(); }
    dirty=true;
  } else if(erasing){
    eraseAt(wx, wy);
  }
}
function endTool(){
  if(ip){ pushUndo(); page().objects.push(ip); scheduleSave(); ip=null; }
  lasing=null; erasing=false;
  dirty=true;
}

/* ── 文字编辑 ── */
function openEditor(sx, sy){
  ted._wx = s2wX(sx); ted._wy = s2wY(sy); ted._cancel = false;
  ted.value = '';
  ted.style.left = sx+'px'; ted.style.top = sy+'px';
  ted.style.fontSize = Math.max(12, S.w.text[S.wi.text]*S.cam.z)+'px';
  ted.style.color = S.color;
  ted.style.display = 'block';
  setTimeout(()=>ted.focus(), 0);
}
ted.addEventListener('keydown', e=>{
  e.stopPropagation();
  if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); ted.blur(); }
  else if(e.key==='Escape'){ ted._cancel = true; ted.blur(); }
});
ted.addEventListener('blur', ()=>{
  const v = ted.value.replace(/[\s]+$/,'');
  ted.style.display = 'none';
  if(ted._cancel || !v.trim()) return;
  pushUndo();
  page().objects.push({ type:'text', x:ted._wx, y:ted._wy, text:v, size:S.w.text[S.wi.text], color:S.color });
  scheduleSave(); dirty=true;
});

/* ── 历史（撤销/重做） ── */
function snap(){ return JSON.stringify({ p:S.doc.pages, i:S.doc.pi }); }
function pushUndo(){
  S.undo.push(snap());
  if(S.undo.length>120) S.undo.shift();
  S.redo.length = 0;
}
function undo(){
  if(!S.undo.length){ toast('没有可撤销的操作'); return; }
  S.redo.push(snap());
  const d = JSON.parse(S.undo.pop());
  S.doc.pages = d.p; S.doc.pi = Math.min(d.i, d.p.length-1);
  afterHist();
}
function redo(){
  if(!S.redo.length){ toast('没有可重做的操作'); return; }
  S.undo.push(snap());
  const d = JSON.parse(S.redo.pop());
  S.doc.pages = d.p; S.doc.pi = Math.min(d.i, d.p.length-1);
  afterHist();
}
function afterHist(){ applyBg(); scheduleSave(); syncPages(); syncTools(); dirty=true; }

/* ── 保存 / 打开 / 导出 ── */
let saveTimer = 0;
function scheduleSave(){
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 400);
}
function saveNow(){
  try{
    localStorage.setItem(LS_KEY, JSON.stringify(S.doc));
    const d = new Date(), p = n=>String(n).padStart(2,'0');
    $('#saveState').textContent = '已保存 '+p(d.getHours())+':'+p(d.getMinutes());
  }catch(e){
    $('#saveState').textContent = '空间不足';
    toast('本浏览器存储空间不足，请用「保存」导出白板文件');
  }
}
function loadSaved(){
  try{
    const t = localStorage.getItem(LS_KEY);
    if(t){ const d = JSON.parse(t); if(d && d.pages && d.pages.length) return d; }
  }catch(e){}
  return null;
}
function stamp(){
  const d=new Date(), p=n=>String(n).padStart(2,'0');
  return d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes());
}
function dl(blob, name){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href), 4000);
}
function saveFile(){
  dl(new Blob([JSON.stringify(S.doc)], {type:'application/json'}), '课堂白板-'+stamp()+'.json');
  toast('白板文件已保存'); markSaved();
}
function markSaved(){
  const d = new Date(), p = n=>String(n).padStart(2,'0');
  $('#saveState').textContent = '已保存 '+p(d.getHours())+':'+p(d.getMinutes());
}
function openFile(f){
  const fr = new FileReader();
  fr.onload = ()=>{
    try{
      const d = JSON.parse(fr.result);
      if(!d || !d.pages || !d.pages.length) throw new Error('bad');
      S.doc = d; S.doc.pi = 0;
      S.undo.length = 0; S.redo.length = 0;
      applyBg(); scheduleSave(); syncPages(); syncTools(); fitView();
      toast('白板已打开');
    }catch(e){ toast('这个文件不是白板文件'); }
  };
  fr.readAsText(f);
}
function exportPNG(){
  const objs = page().objects;
  const bb = bbox(objs) || { x:S.cam.x, y:S.cam.y, w:cv.clientWidth/S.cam.z, h:cv.clientHeight/S.cam.z };
  const w = Math.max(1, Math.ceil(bb.w)), h = Math.max(1, Math.ceil(bb.h));
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.fillStyle = page().bg==='black' ? '#16191e' : '#ffffff';
  x.fillRect(0,0,w,h);
  x.translate(-bb.x, -bb.y);
  for(const o of objs) drawOn(x, o);
  c.toBlob(b=>{
    dl(b, '课堂白板-第'+(S.doc.pi+1)+'页-'+stamp()+'.png');
    toast('本页已导出 PNG');
  }, 'image/png');
}
function newBoard(){
  if(!confirm('新建空白白板？当前内容会清空（Ctrl+Z 可撤销一次）')) return;
  pushUndo();
  S.doc = newDoc(themeBg(document.documentElement.classList.contains('light') ? 'light' : 'dark'));
  applyBg(); scheduleSave(); syncPages(); syncTools(); fitView();
  toast('已新建空白白板');
}

/* ── 图片导入 ── */
function addImageFile(file, sx, sy){
  if(!file || !/^image\//.test(file.type)) return;
  const fr = new FileReader();
  fr.onload = ()=>{
    const src = fr.result;
    const im = new Image();
    im.onload = ()=>{
      let w = im.naturalWidth, h = im.naturalHeight, out = src;
      if(w > 2400){ // 大图压缩，避免撑爆 localStorage
        const k = 2400/w, c = document.createElement('canvas');
        c.width = 2400; c.height = Math.round(h*k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        out = c.toDataURL('image/jpeg', .88);
        w = c.width; h = c.height;
      }
      const maxW = cv.clientWidth*.5/S.cam.z, maxH = cv.clientHeight*.6/S.cam.z;
      const k = Math.min(1, maxW/w, maxH/h);
      pushUndo();
      page().objects.push({ type:'image', src:out, x:s2wX(sx)-w*k/2, y:s2wY(sy)-h*k/2, w:w*k, h:h*k });
      scheduleSave(); dirty=true;
      toast('图片已插入');
    };
    im.src = src;
  };
  fr.readAsDataURL(file);
}
let dragDepth = 0;
stage.addEventListener('dragenter', e=>{ e.preventDefault(); dragDepth++; stage.classList.add('dropping'); });
stage.addEventListener('dragover',  e=>{ e.preventDefault(); stage.classList.add('dropping'); });
stage.addEventListener('dragleave', ()=>{ dragDepth = Math.max(0, dragDepth-1); if(!dragDepth) stage.classList.remove('dropping'); });
stage.addEventListener('drop', e=>{
  e.preventDefault(); dragDepth = 0; stage.classList.remove('dropping');
  const r = cv.getBoundingClientRect();
  let handled = false;
  for(const f of (e.dataTransfer.files||[])){
    if(/\.(json|wbs)$/i.test(f.name)){ openFile(f); handled = true; }
    else if(/^image\//.test(f.type)){ addImageFile(f, e.clientX-r.left, e.clientY-r.top); handled = true; }
  }
  if(!handled) toast('只能插入图片或 .json 白板文件');
});
document.addEventListener('paste', e=>{
  const items = (e.clipboardData && e.clipboardData.items) || [];
  for(const it of items){
    if(it.type && it.type.indexOf('image/')===0){
      addImageFile(it.getAsFile(), cv.clientWidth/2, cv.clientHeight/2);
    }
  }
});

/* ── 滚轮 / 键盘 ── */
cv.addEventListener('wheel', e=>{
  e.preventDefault();
  const k = e.deltaMode===1 ? 33 : (e.deltaMode===2 ? 100 : 1);
  if(e.ctrlKey || e.metaKey){
    zoomAt(e.offsetX, e.offsetY, Math.exp(-e.deltaY*k*0.0016));
  } else {
    S.cam.x -= e.deltaX*k/S.cam.z;
    S.cam.y -= e.deltaY*k/S.cam.z;
    afterCam();
  }
},{passive:false});

const KEYTOOL = { p:'pen', m:'marker', e:'eraser', t:'text', l:'laser' };
const KEYSHAPE = { r:'rect', c:'ellipse', x:'line', a:'arrow' };
window.addEventListener('keydown', e=>{
  const t = e.target;
  if(t===ted || t && (t.tagName==='INPUT' || t.tagName==='TEXTAREA')) return;
  const mod = e.ctrlKey || e.metaKey;
  if(e.code==='Space'){ S.space=true; setCursor(); e.preventDefault(); return; }
  if(e.key==='Shift'){ S.shift=true; return; }
  if(mod && e.key.toLowerCase()==='z'){ e.preventDefault(); e.shiftKey?redo():undo(); return; }
  if(mod && e.key.toLowerCase()==='y'){ e.preventDefault(); redo(); return; }
  if(mod && e.key.toLowerCase()==='s'){ e.preventDefault(); saveFile(); return; }
  if(mod && e.key.toLowerCase()==='o'){ e.preventDefault(); $('#fOpen').click(); return; }
  if(mod) return;
  const k = e.key.toLowerCase();
  if(KEYTOOL[k]){ setTool(KEYTOOL[k]); e.preventDefault(); }
  else if(KEYSHAPE[k]){ setTool('shape'); setShape(KEYSHAPE[k]); e.preventDefault(); }
  else if(k==='+' || k==='='){ zoomBy(1.25); e.preventDefault(); }
  else if(k==='-' || k==='_'){ zoomBy(0.8); e.preventDefault(); }
  else if(k==='0'){ fitView(); e.preventDefault(); }
  else if(e.key==='PageUp' || k==='['){ gotoPage(S.doc.pi-1); e.preventDefault(); }
  else if(e.key==='PageDown' || k===']'){ gotoPage(S.doc.pi+1); e.preventDefault(); }
  else if(k==='?'){ togglePop($('#helpPop'), $('#helpBtn')); e.preventDefault(); }
});
window.addEventListener('keyup', e=>{
  if(e.code==='Space'){ S.space=false; setCursor(); }
  if(e.key==='Shift'){ S.shift=false; }
});

/* ── 页面 ── */
function syncPages(){
  $('#pgCur').textContent = S.doc.pi+1;
  $('#pgTotal').textContent = S.doc.pages.length;
  $('#pPrev').disabled = S.doc.pi===0;
  $('#pNext').disabled = S.doc.pi===S.doc.pages.length-1;
  document.querySelectorAll('[data-bg]').forEach(b=>b.classList.toggle('on', b.dataset.bg===page().bg));
}
function gotoPage(i){
  if(i<0 || i>=S.doc.pages.length || i===S.doc.pi) return;
  S.doc.pi = i; scheduleSave(); syncPages(); dirty=true;
}
function addPage(){
  pushUndo();
  S.doc.pages.splice(S.doc.pi+1, 0, newPage(page().bg));
  S.doc.pi++; scheduleSave(); syncPages(); dirty=true;
  toast('已添加第 '+(S.doc.pi+1)+' 页');
}
function dupPage(){
  pushUndo();
  const c = JSON.parse(JSON.stringify(page()));
  c.id = uid();
  S.doc.pages.splice(S.doc.pi+1, 0, c);
  S.doc.pi++; scheduleSave(); syncPages(); dirty=true;
}
function delPage(){
  if(S.doc.pages.length<=1){ toast('至少要保留一页'); return; }
  if(page().objects.length && !confirm('当前页有内容，删除这一页？（Ctrl+Z 可撤销）')) return;
  pushUndo();
  S.doc.pages.splice(S.doc.pi, 1);
  S.doc.pi = Math.max(0, S.doc.pi-1);
  scheduleSave(); syncPages(); dirty=true;
}
function applyBg(){
  stage.classList.remove('bg-white','bg-dots','bg-grid','bg-lines','bg-black');
  stage.classList.add('bg-'+page().bg);
}
function setBg(bg){
  if(page().bg===bg) return;
  pushUndo();
  page().bg = bg;
  bgAuto = false;   // 用户手动选过背景 ⇒ 不再跟随主题
  try{ localStorage.setItem(BGAUTO_KEY, '0'); }catch(e){}
  applyChromeVars(BG_HEX[bg] || '#ffffff');   // chrome 跟随板面色（桌面版 applyBoardBg 同机制）
  scheduleSave(); applyBg(); syncPages(); dirty=true;
}
/* 主题默认背景的静默切换（不进撤销栈、不改 bgAuto） */
function setBgSilent(bg){
  const p = page();
  if(!p || p.bg===bg) return;
  p.bg = bg; applyBg(); syncPages(); dirty=true; scheduleSave();
  applyChromeVars(BG_HEX[bg] || '#ffffff');
}
const themeBg = t => t==='light' ? 'white' : 'black';

/* ── 工具栏联动 ── */
function setTool(t){ S.tool=t; syncTools(); setCursor(); }
function setShape(s){ S.shape=s; S.tool='shape'; syncTools(); setCursor(); }
function setCursor(){
  cv.style.cursor = S.space ? 'grab'
    : S.tool==='text' ? 'text'
    : S.tool==='eraser' ? 'cell'
    : 'crosshair';
}
function syncTools(){
  document.querySelectorAll('[data-tool]').forEach(b=>{
    const on = b.dataset.tool===S.tool && (!b.dataset.shape || b.dataset.shape===S.shape);
    b.classList.toggle('on', on);
  });
  document.querySelectorAll('[data-c]').forEach(b=>b.classList.toggle('on', b.dataset.c===S.color));
  $('#cCustom').value = S.color;
  /* 颜色触发按钮圆点 = 当前色；粗细触发按钮横条 = 当前档位 */
  const dot = $('#cDot');
  if(dot) dot.style.background = S.color;
  const fam = S.tool==='eraser' ? null : S.tool;
  const wbar = $('#wBar');
  if(wbar){
    const f = fam || 'pen';
    wbar.style.height = clamp(S.w[f][S.wi[f]], 3, 14) + 'px';
    wbar.style.width  = clamp(S.w[f][S.wi[f]], 8, 20) + 'px';
  }
  $('#wBtn').disabled = !fam;
  $('#wBtn').title = fam ? (fam==='text' ? '字号' : '粗细') : '橡皮（点选删除，无粗细）';
  const wt = $('#wPopT');
  if(wt) wt.textContent = fam==='text' ? '字号' : '粗细';
  document.querySelectorAll('#wList .wopt').forEach(b=>{
    const on = !!fam && +b.dataset.wi===S.wi[fam];
    b.classList.toggle('on', on);
    const i = b.querySelector('i');
    if(i && fam){
      const h = clamp(S.w[fam][+b.dataset.wi], 3, 14);
      i.style.height = h+'px'; i.style.width = clamp(h, 8, 26)+'px';
    }
  });
}

/* ── 弹出层 ── */
function closePops(){ document.querySelectorAll('.pop.show').forEach(p=>p.classList.remove('show')); }
/* 面板定位：对齐桌面版 wbPlacePanel 规则，并按按钮实际位置智能防飞出
   左竖排 → 按钮右侧、top 对齐（右侧不够翻左侧）；
   横排 + 按钮在屏幕下半（底部工具栏）→ 按钮正上方居中（桌面版底排规则）；
   横排 + 按钮在屏幕上半（顶部页码 Dock）→ 落到按钮下方 */
function wbPlacePanel(panel, btn){
  if(!panel || !btn) return;
  const gap = 8, M = 8;
  const r = btn.getBoundingClientRect();
  const vw = window.innerWidth, vh = window.innerHeight;
  const w = panel.offsetWidth || panel.scrollWidth || 200;
  const ph = panel.offsetHeight || 160;
  if(document.body.classList.contains('tb-left')){
    let left = r.right + gap;
    if(left + w > vw - M) left = Math.max(M, r.left - w - gap);
    panel.style.left = Math.round(left) + 'px';
    panel.style.bottom = 'auto';
    let top = r.top;
    if(top + ph > vh - M) top = Math.max(M, vh - ph - M);
    panel.style.top = Math.round(top) + 'px';
    panel.style.maxHeight = Math.max(120, Math.round(vh - r.top - 6)) + 'px';
  }else{
    let left = r.left + r.width/2 - w/2;
    left = Math.max(M, Math.min(left, vw - w - M));
    panel.style.left = Math.round(left) + 'px';
    if(r.top < vh * 0.5){          // 按钮在上半 → 面板落到按钮下方
      panel.style.top = Math.round(r.bottom + gap) + 'px';
      panel.style.bottom = 'auto';
      panel.style.maxHeight = Math.max(120, Math.round(vh - r.bottom - gap - M)) + 'px';
    }else{                          // 按钮在下半（底部工具栏）→ 按钮正上方居中
      panel.style.bottom = Math.round(vh - r.top + gap) + 'px';
      panel.style.top = 'auto';
      panel.style.maxHeight = Math.max(120, Math.round(r.top - gap - M)) + 'px';
    }
  }
}
function togglePop(pop, btn){
  const show = !pop.classList.contains('show');
  closePops();
  if(!show) return;
  pop.classList.add('show');
  pop._btn = btn;          // 记住锚点：布局切换 / resize 后重新摆位
  wbPlacePanel(pop, btn);
}
function repositionPops(){
  document.querySelectorAll('.pop.show').forEach(p=>{
    if(p._btn) wbPlacePanel(p, p._btn);
  });
}
document.addEventListener('pointerdown', e=>{
  if(e.target.closest('.pop') || e.target.closest('#bgBtn') || e.target.closest('#helpBtn')
     || e.target.closest('#cBtn') || e.target.closest('#wBtn') || e.target.closest('#setBtn')) return;
  closePops();
}, true);

/* ── Toast ── */
let toastTimer = 0;
function toast(msg){
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), 1800);
}

/* ── 绑定 ── */
function bindUI(){
  document.querySelectorAll('[data-tool]').forEach(b=>{
    b.addEventListener('click', ()=>{
      if(b.dataset.shape) setShape(b.dataset.shape); else setTool(b.dataset.tool);
    });
  });
  document.querySelectorAll('[data-c]').forEach(b=>{
    b.addEventListener('click', ()=>{ S.color=b.dataset.c; syncTools(); closePops(); });
  });
  $('#cCustom').addEventListener('input', e=>{ S.color=e.target.value; syncTools(); });
  $('#cBtn').addEventListener('click', ()=>togglePop($('#cPop'), $('#cBtn')));
  $('#wBtn').addEventListener('click', ()=>{
    if($('#wBtn').disabled){ toast('橡皮是点选删除，没有粗细'); return; }
    togglePop($('#wPop'), $('#wBtn'));
  });
  $('#setBtn').addEventListener('click', ()=>togglePop($('#setPop'), $('#setBtn')));
  document.querySelectorAll('#tbpos-row .setopt').forEach(b=>{
    b.addEventListener('click', ()=>applyTbPos(b.dataset.pos));
  });
  document.querySelectorAll('[data-wi]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const fam = S.tool==='eraser' ? 'pen' : S.tool;
      S.wi[fam] = +b.dataset.wi; syncTools(); dirty=true; closePops();
    });
  });
  $('#bOpen').addEventListener('click', ()=>$('#fOpen').click());
  $('#bSave').addEventListener('click', saveFile);
  $('#bPng').addEventListener('click', exportPNG);
  $('#bNew').addEventListener('click', newBoard);
  $('#helpBtn').addEventListener('click', ()=>togglePop($('#helpPop'), $('#helpBtn')));
  $('#themeBtn').addEventListener('click', ()=>{
    const next = document.documentElement.classList.contains('light') ? 'dark' : 'light';
    applyTheme(next);
    toast(next === 'light' ? '已切换到明亮主题' : '已切换到暗黑主题');
  });
  $('#bgBtn').addEventListener('click', ()=>togglePop($('#bgPop'), $('#bgBtn')));
  document.querySelectorAll('[data-bg]').forEach(b=>b.addEventListener('click', ()=>{ setBg(b.dataset.bg); closePops(); }));
  $('#pPrev').addEventListener('click', ()=>gotoPage(S.doc.pi-1));
  $('#pNext').addEventListener('click', ()=>gotoPage(S.doc.pi+1));
  $('#pAdd').addEventListener('click', addPage);
  $('#pDup').addEventListener('click', dupPage);
  $('#pDel').addEventListener('click', delPage);
  $('#zIn').addEventListener('click', ()=>zoomBy(1.25));
  $('#zOut').addEventListener('click', ()=>zoomBy(0.8));
  $('#zFit').addEventListener('click', fitView);
  $('#fOpen').addEventListener('change', e=>{
    if(e.target.files && e.target.files[0]) openFile(e.target.files[0]);
    e.target.value = '';
  });
  window.addEventListener('resize', ()=>{ resize(); repositionPops(); });
  window.addEventListener('beforeunload', ()=>{ try{ localStorage.setItem(LS_KEY, JSON.stringify(S.doc)); }catch(e){} });
  document.addEventListener('visibilitychange', ()=>{
    if(document.hidden){ try{ localStorage.setItem(LS_KEY, JSON.stringify(S.doc)); }catch(e){} }
  });
}

/* ── chrome 配色：复刻桌面版 applyBoardBg（Board.html:1982-2000）的 mixOpaque 公式 ──
   桌面版没有「暗/亮主题类」，工具栏颜色是**跟随板面背景色动态混色**的：
   深色板面 → 按钮向白混（下限亮度 46，保证在黑板上浮得起）；浅色板面 → 向黑混 12%。
   网页版的暗/亮主题只是「板面默认色」的简化替代，chrome 数值用同款公式才算外观一致。 */
function lum(hex){
  let h=String(hex||'').trim(); if(h.startsWith('#')) h=h.slice(1);
  if(h.length===3) h=h.split('').map(c=>c+c).join('');
  if(h.length<6) return 255;
  const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
  return Math.round(0.299*r+0.587*g+0.114*b);
}
function mixOpaque(hex, target, ratio){
  let h=(hex||'').trim(); if(h.startsWith('#')) h=h.slice(1);
  if(h.length===3) h=h.split('').map(c=>c+c).join('');
  if(h.length<6) return target===255?'#e8ecef':'#2a2f36';
  const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
  return 'rgb('+Math.round(r+(target-r)*ratio)+','+Math.round(g+(target-g)*ratio)+','+Math.round(b+(target-b)*ratio)+')';
}
function applyChromeVars(bgHex){
  const rs = document.documentElement.style;
  const dark = lum(bgHex) < 140;
  rs.setProperty('--tool-fg', dark ? 'rgb(240,244,248)' : 'rgb(28,34,42)');
  const btnBase = dark ? Math.max(0.14, (46 - lum(bgHex)) / (255 - 46)) : 0.12;
  const btnHov  = dark ? Math.min(0.42, btnBase + 0.16) : 0.24;
  rs.setProperty('--tool-btn-bg', mixOpaque(bgHex, dark ? 255 : 0, btnBase));
  rs.setProperty('--tool-btn-bg-hover', mixOpaque(bgHex, dark ? 255 : 0, btnHov));
  rs.setProperty('--tool-sep', dark ? 'rgba(255,255,255,0.20)' : 'rgba(20,26,32,0.16)');
}
/* 背景名 → 板面 hex（与桌面版默认值一致：白 #ffffff / 黑板 #16191e） */
const BG_HEX = { white:'#ffffff', black:'#16191e', dots:'#ffffff', grid:'#ffffff', lines:'#ffffff' };

/* ── 主题（默认暗黑；localStorage 记忆，开始页 + 白板页面背景跟随） ── */
const THEME_KEY = 'wbweb.theme';
const TBPOS_KEY = 'wbweb.tbpos';      // bottom（默认，底部一行）| left（左侧竖排）
const BGAUTO_KEY = 'wbweb.bgauto';    // 背景是否跟随主题：默认 1（跟随），用户手动选背景后置 0
let bgAuto = true;
try{ bgAuto = localStorage.getItem(BGAUTO_KEY) !== '0'; }catch(e){}
function applyTheme(t){
  document.documentElement.classList.toggle('light', t === 'light');
  try{ localStorage.setItem(THEME_KEY, t); }catch(e){}
  const m = document.querySelector('meta[name="theme-color"]');
  if(m) m.setAttribute('content', t === 'light' ? '#eef1f4' : '#1e2429');
  $('#themeBtn').title = t === 'light' ? '切换到暗黑主题' : '切换到明亮主题';
  if(bgAuto && S.doc) setBgSilent(themeBg(t));   // 页面背景跟随主题（暗→黑板，亮→白纸）
}

/* ── 工具栏布局（默认底部一行；与桌面版切换即收面板同行为） ── */
function applyTbPos(pos, silent){
  const p = pos==='left' ? 'left' : 'bottom';
  document.body.classList.toggle('tb-left', p==='left');
  document.body.classList.toggle('tb-bottom', p!=='left');
  document.querySelectorAll('#tbpos-row .setopt').forEach(b=>b.classList.toggle('on', b.dataset.pos===p));
  if(!silent){
    try{ localStorage.setItem(TBPOS_KEY, p); }catch(e){}
    closePops();   // 布局变了面板位置全失效 → 收起，下次点开重新算
    toast(p==='left' ? '工具栏已移到左侧竖排' : '工具栏已移到底部一行');
  }
}

/* ── 启动 ── */
const bootTheme = localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
applyTheme(bootTheme);
applyChromeVars(BG_HEX[themeBg(bootTheme)]);   // chrome 初始配色 = 桌面版公式（暗→黑板混白，亮→白纸混黑）
S.doc = loadSaved() || newDoc(themeBg(bootTheme));
S.doc.pi = Math.min(S.doc.pi||0, S.doc.pages.length-1);
if(!bgAuto) applyChromeVars(BG_HEX[page().bg] || '#ffffff');   // 用户选过背景：按存的板面色算
applyTbPos(localStorage.getItem(TBPOS_KEY) || 'bottom', true);
resize();
bindUI();
applyBg(); syncTools(); syncPages(); updateZoomLabel(); updateBg();
fitView();
requestAnimationFrame(loop);

/* 开始页面：显示 1 秒后自动进入（淡出 0.35s） */
setTimeout(()=>{
  const sp = $('#splash');
  if(!sp) return;
  sp.classList.add('hide');
  setTimeout(()=>{ sp.style.display = 'none'; }, 400);
}, 1000);

/* 调试探针（供自动化测试用，不影响使用） */
window.__wb = {
  get doc(){ return S.doc; },
  get tool(){ return S.tool; },
  get cam(){ return S.cam; },
  setCam(x,y,z){ S.cam.x=x; S.cam.y=y; S.cam.z=z; afterCam(); },
  get objects(){ return page().objects; },
  get pageIndex(){ return S.doc.pi; },
  get theme(){ return document.documentElement.classList.contains('light') ? 'light' : 'dark'; },
  setTheme(t){ applyTheme(t); },
  get color(){ return S.color; },
  get strokeW(){ return S.w[S.tool==='eraser'?'pen':S.tool][S.wi[S.tool==='eraser'?'pen':S.tool]]; },
  get wiNow(){ return S.wi[S.tool==='eraser'?'pen':S.tool]; },
  get tbpos(){ return document.body.classList.contains('tb-left') ? 'left' : 'bottom'; },
  setTbPos(p){ applyTbPos(p); },
  get bgAuto(){ return bgAuto; },
  get pageBg(){ return page().bg; },
  stroke(sx, sy, pts){ // 以屏幕坐标模拟画一笔（测试用）
    startTool(sx, sy);
    for(const p of pts) moveTool(p[0], p[1]);
    endTool();
  },
  toast: toast
};
})();
