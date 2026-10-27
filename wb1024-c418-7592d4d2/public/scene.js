import * as THREE from './vendor/three.module.js';

const host = document.getElementById('classroom');
const home = document.getElementById('home-view');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, powerPreference:'low-power' });
  buildScene(renderer);
} catch (error) {
  renderer?.dispose();
  host.classList.remove('has-3d');
  document.getElementById('lamp-button').removeAttribute('style');
  document.documentElement.dataset.sceneState='fallback';
  console.warn('三维场景不可用，已使用轻量教室。', error.message);
}

function buildScene(renderer) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(37, 1, .1, 60);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.domElement.className = 'scene-canvas';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.prepend(renderer.domElement);
  const room = new THREE.Group(); scene.add(room);
  const textures = [];
  let seed = 73;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  function texture(w,h,draw) {
    const c = document.createElement('canvas'); c.width=w;c.height=h;
    draw(c.getContext('2d'),w,h);
    const t = new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
    t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());textures.push(t);return t;
  }
  const woodMap = texture(512,512,(c,w,h) => {
    c.fillStyle='#a88b6b';c.fillRect(0,0,w,h);
    for(let i=0;i<620;i++) {
      const y=rand()*h;
      c.strokeStyle=rand()>.45?`rgba(44,22,12,${rand()*.10})`:`rgba(255,218,159,${rand()*.12})`;
      c.lineWidth=.3+rand()*1.3;c.beginPath();c.moveTo(0,y);
      c.bezierCurveTo(130,y+rand()*6,350,y-rand()*8,512,y+rand()*3);c.stroke();
    }
  });
  const plasterMap=texture(128,128,(c,w,h)=>{
    c.fillStyle='#a89982';c.fillRect(0,0,w,h);
    for(let i=0;i<8000;i++){c.fillStyle=`rgba(${rand()>.5?'255,245,220':'38,24,18'},${rand()*.08})`;c.fillRect(rand()*w,rand()*h,1,1);}
  });
  plasterMap.wrapS=plasterMap.wrapT=THREE.RepeatWrapping;plasterMap.repeat.set(4,3);
  const mat=(color,options={})=>new THREE.MeshStandardMaterial({color,roughness:.65,...options});
  const wood=mat('#dcc6a9',{map:woodMap,roughness:.52});
  const darkWood=mat('#ab9277',{map:woodMap,roughness:.65});
  const wall=mat('#887b66',{map:plasterMap,roughness:.94});
  const trim=mat('#bc9871',{roughness:.48});
  const brass=mat('#c9aa6e',{metalness:.58,roughness:.32});
  const cream=mat('#e0c7a2',{roughness:.3});
  const leafMat=mat('#66804d',{roughness:.64});
  const shadows = (mesh,parent=room) => {mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;};
  // 圆角立方体由带倒角的挤出几何构成，灯光在边缘产生真实高光。
  function box(w,h,d,m,x=0,y=0,z=0,r=.035,parent=room) {
    r=Math.min(r,w/3,h/3,d/3);
    const s=new THREE.Shape(),a=w/2-r,b=h/2-r;
    s.moveTo(-a,-b);s.lineTo(a,-b);s.lineTo(a,b);s.lineTo(-a,b);s.closePath();
    const geo=new THREE.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:r,bevelThickness:r,curveSegments:3});
    geo.translate(0,0,-(d-2*r)/2);
    const o=shadows(new THREE.Mesh(geo,m),parent);o.position.set(x,y,z);return o;
  }
  function cylinder(rt,rb,h,m,x,y,z,parent=room){const o=shadows(new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,32),m),parent);o.position.set(x,y,z);return o;}
  function sphere(rx,ry,rz,m,x,y,z,parent=room){const o=shadows(new THREE.Mesh(new THREE.SphereGeometry(1,24,16),m),parent);o.scale.set(rx,ry,rz);o.position.set(x,y,z);return o;}
  function rod(a,b,r,m,parent=room){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);const o=cylinder(r,r,v.length(),m,0,0,0,parent);o.position.copy(av.add(bv).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
  function plane(w,h,m,x,y,z,ry=0,parent=room){const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);o.position.set(x,y,z);o.rotation.y=ry;o.receiveShadow=true;parent.add(o);return o;}

  // 房间留出前墙和右墙，镜头从敞开的一侧看到完整空间。
  box(9.3,.15,7.4,darkWood,0,-.1,.5,.04);
  const floorWood=mat('#a69b92',{map:woodMap,roughness:.85});
  for(let z=-2.8;z<4;z+=.65) box(9.1,.035,.635,floorWood,0,-.006,z,.006);
  box(9.3,4.8,.16,wall,0,2.3,-3.08,.025);
  box(.16,4.8,1.12,wall,-4.58,2.3,-2.5,.025);
  box(.16,4.8,1.63,wall,-4.58,2.3,3,.025);
  box(.16,1.05,4.3,wall,-4.58,.43,.26,.025);
  box(.16,.92,4.3,wall,-4.58,4.23,.26,.025);
  box(9.4,.18,2.6,mat('#695747'),0,4.72,-1.8,.08);
  box(9.1,.16,.12,darkWood,0,.13,-2.94);
  box(.12,.16,7.1,darkWood,-4.43,.13,.5);

  const skyMap=texture(512,512,(c,w,h)=>{
    const gradient=c.createLinearGradient(0,0,0,h);gradient.addColorStop(0,'#0a1533');gradient.addColorStop(1,'#344863');c.fillStyle=gradient;c.fillRect(0,0,w,h);
    for(let i=0;i<14;i++){const x=i*42-10,top=260+rand()*130;c.fillStyle=i%2?'#142338':'#182940';c.fillRect(x,top,36,h-top);for(let a=0;a<3;a++)for(let b=0;b<9;b++){if(rand()>.6){c.fillStyle=rand()>.5?'#b09569':'#657c93';c.fillRect(x+6+a*9,top+10+b*17,3,6);}}}
    c.fillStyle='#f8e3b0';c.beginPath();c.arc(328,116,32,0,Math.PI*2);c.fill();c.globalCompositeOperation='destination-out';c.beginPath();c.arc(342,104,30,0,Math.PI*2);c.fill();c.globalCompositeOperation='destination-over';c.fillStyle=gradient;c.fillRect(0,0,w,h);
  });
  plane(4.1,2.85,new THREE.MeshBasicMaterial({map:skyMap}),-4.57,2.35,.25,Math.PI/2);
  const win=mat('#c4b49a',{roughness:.5});
  for(const z of [-1.83,.25,2.33])box(.18,2.96,.095,win,-4.42,2.35,z);
  for(const y of [.88,2.32,3.83])box(.18,.1,4.3,win,-4.42,y,.25);
  box(.42,.12,4.65,wood,-4.33,.82,.25);
  rod([-4.25,4.02,-2.1],[-4.25,4.02,2.63],.045,brass);
  function curtain(zCenter,width) {
    const g=new THREE.PlaneGeometry(width,3.2,28,18),p=g.attributes.position;
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),y=p.getY(i),bottom=(1.6-y)/3.2;
      p.setXYZ(i,x*(1-.18*Math.sin(bottom*Math.PI)),y,.09*Math.sin(x*27)+.018*Math.cos(y*2));
    }g.computeVertexNormals();
    const cloth=mat('#b49569',{roughness:1,side:THREE.DoubleSide});
    const o=shadows(new THREE.Mesh(g,cloth));o.rotation.y=Math.PI/2;o.position.set(-4.19,2.37,zCenter);return o;
  }
  curtain(-1.68,.85);curtain(2.1,.85);

  // 黑板、粉笔槽和钟表。
  box(5.65,2.25,.13,darkWood,.55,2.62,-2.88,.06);
  box(5.43,2.03,.075,mat('#193e32',{roughness:.95}),.55,2.62,-2.78,.02);
  for(const y of [1.53,3.72])box(5.65,.12,.17,wood,.55,y,-2.72,.04);
  for(const x of [-2.23,3.33])box(.12,2.24,.17,wood,x,2.62,-2.72,.035);
  box(5.85,.13,.37,wood,.55,1.4,-2.65,.035);
  for(let i=0;i<3;i++)rod([1.5+i*.2,1.49,-2.52],[1.64+i*.2,1.49,-2.52],.025,cream);
  box(.36,.08,.16,mat('#444b40'),-1.5,1.49,-2.56,.025);
  const chalkMap=texture(1024,384,(c,w,h)=>{
    c.fillStyle='rgba(232,229,207,.86)';c.textAlign='center';c.font='48px KaiTi, STKaiti, serif';c.fillText('今天就到这里吧',w/2,145);
    c.strokeStyle='rgba(232,229,207,.45)';c.lineWidth=2;c.beginPath();c.moveTo(300,170);c.lineTo(724,169);c.stroke();
    c.font='28px KaiTi, STKaiti, serif';c.fillStyle='rgba(232,229,207,.6)';c.fillText('备课     作业     班级群',w/2,270);
  });
  const chalkMaterial=new THREE.MeshBasicMaterial({map:chalkMap,transparent:true,depthWrite:false});
  plane(4.85,1.8,chalkMaterial,.55,2.62,-2.731);
  const clockMap=texture(256,256,(c,w,h)=>{
    c.fillStyle='#d2bd97';c.fillRect(0,0,w,h);c.translate(128,128);
    c.strokeStyle='#554733';c.lineWidth=3;
    for(let i=0;i<12;i++){c.save();c.rotate(i*Math.PI/6);c.beginPath();c.moveTo(0,-96);c.lineTo(0,-85);c.stroke();c.restore();}
    c.lineCap='round';c.lineWidth=5;c.beginPath();c.moveTo(-45,31);c.lineTo(0,0);c.lineTo(38,-57);c.stroke();
  });
  const clock=cylinder(.37,.37,.1,wood,4.05,3.17,-2.83);clock.rotation.x=Math.PI/2;
  const face=new THREE.Mesh(new THREE.CircleGeometry(.32,40),new THREE.MeshStandardMaterial({map:clockMap,roughness:.7}));face.position.set(4.05,3.17,-2.765);room.add(face);

  // 主讲台，圆角实木桌面与柜体。
  const desk=new THREE.Group();desk.position.set(.85,0,1.35);room.add(desk);
  box(4.05,.2,2.05,wood,0,1.3,0,.085,desk);
  box(3.5,.95,1.6,darkWood,0,.69,-.05,.04,desk);
  box(3.08,.58,.08,wood,0,.85,.79,.035,desk);
  box(.48,.065,.09,mat('#3e3528',{metalness:.65,roughness:.35}),0,.86,.87,.026,desk);
  for(const x of [-1.6,1.6])for(const z of [-.65,.65])box(.17,.28,.17,darkWood,x,.14,z,.03,desk);
  // 参考图里的陶瓷杯，有内壁和真正的杯口。
  const cupPoints=[new THREE.Vector2(.13,0),new THREE.Vector2(.155,.025),new THREE.Vector2(.17,.32),new THREE.Vector2(.16,.34),new THREE.Vector2(.14,.32),new THREE.Vector2(.125,.055)];
  const cup=new THREE.Mesh(new THREE.LatheGeometry(cupPoints,40),cream);shadows(cup,desk);cup.position.set(.65,1.41,.18);
  const handle=new THREE.Mesh(new THREE.TorusGeometry(.115,.034,12,28),cream);handle.position.set(.84,1.58,.18);shadows(handle,desk);
  cylinder(.139,.139,.012,mat('#392216',{roughness:.25}),.65,1.69,.18,desk);
  const notebook=new THREE.Group();notebook.position.set(-.6,1.42,.2);notebook.rotation.y=-.12;desk.add(notebook);
  box(1.12,.07,.73,mat('#b4b5a6'),0,.02,0,.018,notebook);
  box(1.16,.035,.77,mat('#526078'),0,.072,0,.012,notebook);
  box(1.09,.055,.71,cream,0,.115,-.015,.012,notebook);
  box(1.15,.028,.76,mat('#bb976d'),0,.157,-.015,.012,notebook);
  box(.26,.002,.12,mat('#d7c3a0'),-.1,.174,-.04,.0005,notebook);
  rod([.06,1.43,.12],[.51,1.43,-.04],.024,mat('#8b3227'),desk);
  rod([.51,1.43,-.04],[.58,1.43,-.07],.015,brass,desk);
  // 台灯是可交互的立体物体，操作按钮投影到灯罩旁。
  const lamp=new THREE.Group();lamp.position.set(1.35,1.41,-.35);desk.add(lamp);
  cylinder(.29,.32,.075,brass,0,.04,0,lamp);
  cylinder(.038,.045,.98,brass,0,.55,0,lamp);
  const shade=cylinder(.18,.43,.34,cream,0,1.17,0,lamp);
  const lampBulbMat=mat('#f9dfad',{emissive:'#ffbf68',emissiveIntensity:3,roughness:.3});
  cylinder(.39,.39,.016,lampBulbMat,0,1.005,0,lamp);
  sphere(.06,.055,.06,brass,0,1.36,0,lamp);
  rod([.28,1.02,0],[.28,.68,0],.008,brass,lamp);
  sphere(.025,.04,.025,brass,.28,.65,0,lamp);
  const lampPoint=new THREE.PointLight('#ffd3a0',8,8,2);lampPoint.position.set(0,.94,.05);lamp.add(lampPoint);
  lampPoint.castShadow=true;lampPoint.shadow.mapSize.set(512,512);lampPoint.shadow.bias=-.003;lampPoint.shadow.normalBias=.025;
  lampPoint.shadow.radius=4;
  const lampTarget=new THREE.Object3D();lampTarget.position.set(0,1.2,.1);lamp.add(lampTarget);
  // 灯罩本身不遮掉内部光源的全部照明。
  shade.castShadow=false;
  const lampSoft=new THREE.SpotLight('#ffd19b',14,10,1.1,.85,2);lampSoft.position.set(0,1.02,.02);lampSoft.target.position.set(-.3,-.2,.2);lamp.add(lampSoft,lampSoft.target);

  function chair(x,z,scale=1,rotation=0) {
    const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;g.scale.setScalar(scale);room.add(g);
    box(.96,.12,.9,wood,0,.67,0,.05,g);
    for(const xx of [-.35,.35])for(const zz of [-.3,.3])rod([xx,.65,zz],[xx*1.18,.03,zz*1.18],.055,darkWood,g);
    for(const xx of [-.35,.35])rod([xx,.55,-.33],[xx,1.45,-.4],.045,darkWood,g);
    box(.9,.44,.095,wood,0,1.21,-.4,.05,g);return g;
  }
  chair(.7,-.45,1.05,.07);
  chair(-3.05,2.3,.86,.12);
  const pupilDesk=new THREE.Group();pupilDesk.position.set(-3.2,0,.7);room.add(pupilDesk);
  box(1.55,.13,.96,wood,0,.99,0,.06,pupilDesk);
  for(const x of [-.6,.6])for(const z of [-.32,.32])rod([x,.94,z],[x*1.08,.03,z*1.12],.055,darkWood,pupilDesk);
  // 花盆与有曲面的叶片。
  cylinder(.32,.23,.58,mat('#a46943',{roughness:.85}),-2.25,.3,-.05);
  cylinder(.35,.35,.08,mat('#bd8255'),-2.25,.59,-.05);
  cylinder(.3,.3,.014,mat('#382f22'),-2.25,.635,-.05);
  for(let i=0;i<9;i++){
    const angle=i*2.4, h=.9+(i%4)*.18;
    const end=[-2.25+Math.cos(angle)*.39,h,-.05+Math.sin(angle)*.34];
    rod([-2.25,.63,-.05],end,.014,mat('#596e3b'));
    const leaf=sphere(.12,.29,.035,leafMat,...end);leaf.rotation.set(Math.sin(angle)*.5,angle,Math.cos(angle)*.8);
  }

  const ceilingLights=[];
  for(let i=0;i<2;i++){
    const x=-1.3+i*3.8;
    for(const xx of [x-1,x+1])rod([xx,4.62,-1.4],[xx,4.04,-1.4],.015,mat('#615b4b'));
    box(2.5,.13,.37,trim,x,4,-1.4,.05);
    const bulb=mat('#fff1cd',{emissive:'#ffe0a0',emissiveIntensity:2.4});
    box(2.28,.03,.27,bulb,x,3.93,-1.4,.015);
    const light=new THREE.SpotLight('#ffddaa',42,12,1.05,.8,2);light.position.set(x,3.88,-1.4);light.target.position.set(x,.3,-.3);room.add(light,light.target);
    if(i===0){light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.bias=-.001;light.shadow.normalBias=.035;light.shadow.radius=4;}
    ceilingLights.push({light,bulb});
  }
  const ambient=new THREE.HemisphereLight('#a5abc5','#8d7661',1.25);scene.add(ambient);
  const moonLight=new THREE.DirectionalLight('#8baeff',1.4);moonLight.position.set(-7,3.1,1);moonLight.target.position.set(1,0,1);scene.add(moonLight,moonLight.target);
  moonLight.castShadow=true;moonLight.shadow.mapSize.set(1024,1024);moonLight.shadow.camera.left=-6;moonLight.shadow.camera.right=6;moonLight.shadow.camera.top=5;moonLight.shadow.camera.bottom=-5;moonLight.shadow.normalBias=.03;
  moonLight.shadow.radius=3;
  const frontFill=new THREE.DirectionalLight('#dfcbb3',1.1);frontFill.position.set(3,6,8);scene.add(frontFill);

  const glowMap=texture(64,64,(c,w,h)=>{const g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,205,120,.38)');g.addColorStop(.3,'rgba(255,180,85,.12)');g.addColorStop(1,'rgba(255,160,70,0)');c.fillStyle=g;c.fillRect(0,0,w,h);});
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowMap,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.65}));
  glow.position.set(0,.96,.07);glow.scale.set(1.35,.9,1);lamp.add(glow);

  // 一点杯口热气提供持续但很轻的动画，后台和减少动态效果模式下停止。
  const steamMap=texture(64,64,(c,w,h)=>{const g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,233,200,.2)');g.addColorStop(1,'rgba(255,233,200,0)');c.fillStyle=g;c.fillRect(0,0,w,h);});
  const steam=[];
  for(let i=0;i<3;i++){const o=new THREE.Sprite(new THREE.SpriteMaterial({map:steamMap,transparent:true,depthWrite:false,opacity:.35}));desk.add(o);steam.push(o);}

  let frame=0,last=0,alive=true,ready=false,draws=0,zoom=1;
  const levels=[1,1,1,1];
  let desired=[1,1,1,1];
  let viewWidth=1,viewHeight=1;
  const lampButton=document.getElementById('lamp-button');
  const projected=new THREE.Vector3();
  const completedViews=['ending','done'];
  let sceneHost=host,sceneMode='home';
  function shown(){return sceneMode!=='hidden'&&!document.hidden;}
  function layout(){
    if(!shown())return;
    viewWidth=sceneHost.clientWidth;viewHeight=sceneHost.clientHeight;
    if(!viewWidth||!viewHeight)return;
    renderer.setSize(viewWidth,viewHeight,false);camera.aspect=viewWidth/viewHeight;
    const mobile=viewWidth<700;
    camera.position.set(mobile?5.1:5.3,3.9,mobile?10.6:10.7);
    camera.fov=mobile?41:37;camera.lookAt(-.3,1.95,-.2);camera.updateProjectionMatrix();
    draw(performance.now(),true);
  }
  function sync(){
    const mode=!home.hidden?'home':completedViews.find(name=>!document.getElementById(name+'-view').hidden)||'hidden';
    const changed=mode!==sceneMode;sceneMode=mode;
    if(!shown()){cancelAnimationFrame(frame);frame=0;return;}
    const nextHost=mode==='home'?host:document.getElementById(mode+'-room');
    if(nextHost!==sceneHost){sceneHost.classList.remove('has-3d');sceneHost=nextHost;sceneHost.prepend(renderer.domElement);}
    desired=mode==='home'?['ceiling-light-1','ceiling-light-2','lamp-bulb','chalk-writing'].map(id=>document.getElementById(id).classList.contains('is-off')?0:1):[0,0,0,0];
    if(mode!=='home'){
      levels.fill(0);zoom=1;camera.zoom=1;camera.updateProjectionMatrix();cancelAnimationFrame(frame);frame=0;layout();return;
    }
    if(changed)layout();
    if(!frame)frame=requestAnimationFrame(tick);
  }
  function draw(now,force=false){
    if(!alive||!shown()||!viewWidth||!viewHeight)return;
    let changing=false;
    for(let i=0;i<4;i++){
      const diff=desired[i]-levels[i];
      if(Math.abs(diff)>.002){levels[i]+=diff*(reduced.matches?.85:.2);changing=true;}else levels[i]=desired[i];
    }
    ceilingLights.forEach(({light,bulb},i)=>{light.intensity=42*levels[i];bulb.emissiveIntensity=2.4*levels[i];});
    lampPoint.intensity=8*levels[2];lampSoft.intensity=14*levels[2];lampBulbMat.emissiveIntensity=3*levels[2];chalkMaterial.opacity=levels[3];
    const roomLight=(levels[0]+levels[1])/2;
    ambient.intensity=(sceneMode==='home'?.55:.95)+.7*roomLight;frontFill.intensity=(sceneMode==='home'?.3:.85)+.8*roomLight;
    glow.material.opacity=.65*levels[2];
    const targetZoom=sceneMode==='home'&&home.classList.contains('ritual')&&!reduced.matches?1.045:1;
    if(Math.abs(targetZoom-zoom)>.0001){zoom+=(targetZoom-zoom)*.08;changing=true;camera.zoom=zoom;camera.updateProjectionMatrix();}
    steam.forEach((o,i)=>{const f=(now/3400+i/3)%1;o.visible=sceneMode==='home'&&!reduced.matches;o.position.set(.65+Math.sin(f*6+i)*.04,1.76+f*.55,.18);o.scale.setScalar(.13+f*.3);o.material.opacity=Math.sin(f*Math.PI)*.24;});
    if(reduced.matches&&!changing&&!force&&ready)return;
    room.updateMatrixWorld(true);camera.updateMatrixWorld();
    lampTarget.getWorldPosition(projected).project(camera);
    const x=Math.max(36,Math.min(viewWidth-36,(projected.x*.5+.5)*viewWidth));
    const y=Math.max(54,Math.min(viewHeight-54,(-projected.y*.5+.5)*viewHeight));
    lampButton.style.left=`${x}px`;lampButton.style.top=`${y}px`;
    renderer.render(scene,camera);draws++;
    ready=true;sceneHost.classList.add('has-3d');document.documentElement.dataset.sceneState='ready';
    sceneHost.dataset.rendered='true';
  }
  function tick(now){frame=0;if(!alive||home.hidden||document.hidden)return;if(now-last>=66){draw(now);last=now;}frame=requestAnimationFrame(tick);}
  const resize=new ResizeObserver(layout);resize.observe(host);completedViews.forEach(name=>resize.observe(document.getElementById(name+'-room')));
  const observe=new MutationObserver(sync);
  ['ceiling-light-1','ceiling-light-2','lamp-bulb','chalk-writing', 'home-view','done-view','ending-view'].forEach(id=>observe.observe(document.getElementById(id),{attributes:true,attributeFilter:['class','hidden']}));
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',()=>{draw(performance.now(),true);sync();});
  renderer.domElement.addEventListener('webglcontextlost',event=>{
    event.preventDefault();alive=false;cancelAnimationFrame(frame);frame=0;sceneHost.classList.remove('has-3d');lampButton.removeAttribute('style');
    document.documentElement.dataset.sceneState='fallback';
  });
  renderer.domElement.addEventListener('webglcontextrestored',()=>{alive=true;ready=false;layout();sync();});
  window.classroom3D={getState:()=>({ready,alive,mode:sceneMode,levels:[...levels],desired:[...desired],draws,triangles:renderer.info.render.triangles,calls:renderer.info.render.calls,width:viewWidth,height:viewHeight}),dispose:()=>{alive=false;cancelAnimationFrame(frame);resize.disconnect();observe.disconnect();renderer.dispose();textures.forEach(t=>t.dispose());}};
  sync();layout();
}

// 两个小工具共用一个按需创建的 WebGL 渲染器，切换时复用画布。
installToolScenes();
function installToolScenes() {
  const toolsView = document.getElementById('tools-view');
  const woodPanel = document.getElementById('wood-panel');
  const breathPanel = document.getElementById('breath-panel');
  let controller, failed = false;
  function sync() {
    if (!controller && !toolsView.hidden && !failed) {
      try { controller = createToolScenes(); }
      catch (error) { failed = true; console.warn('放松工具使用轻量画面。', error.message); }
    }
    controller?.sync();
  }
  const observer = new MutationObserver(sync);
  for (const node of [toolsView,woodPanel,breathPanel]) observer.observe(node,{attributes:true,attributeFilter:['hidden']});
  sync();
}
function createToolScenes() {
  const view = document.getElementById('tools-view');
  const woodPanel = document.getElementById('wood-panel');
  const stages = {wood:document.querySelector('.wood-stage'),breath:document.querySelector('.breath-stage')};
  const hitButton = document.getElementById('wood-button');
  const breathLabel = document.querySelector('.breath-label');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  const canvas=renderer.domElement;canvas.className='tool-scene-canvas';canvas.setAttribute('aria-hidden','true');
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(37,1,.1,30);
  const woodGroup=new THREE.Group(),breathGroup=new THREE.Group();scene.add(woodGroup,breathGroup);
  let randomSeed=123;
  const rand=()=>{randomSeed=(randomSeed*16807)%2147483647;return randomSeed/2147483647;};
  function texture(w,h,draw) {const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return t;}
  const timber=texture(512,256,(c,w,h)=>{c.fillStyle='#b48b5c';c.fillRect(0,0,w,h);for(let i=0;i<420;i++){const y=rand()*h;c.strokeStyle=`rgba(59,27,11,${.035+rand()*.16})`;c.lineWidth=.3+rand();c.beginPath();c.moveTo(0,y);c.bezierCurveTo(140,y+rand()*10,360,y-rand()*8,512,y+rand()*6);c.stroke();}});
  const fabric=texture(128,128,(c,w,h)=>{c.fillStyle='#7c6854';c.fillRect(0,0,w,h);for(let i=0;i<w;i+=3){c.strokeStyle=i%2?'#857360':'#6f5f4f';c.lineWidth=.5;c.beginPath();c.moveTo(i,0);c.lineTo(i,h);c.moveTo(0,i);c.lineTo(w,i);c.stroke();}});
  fabric.wrapS=fabric.wrapT=THREE.RepeatWrapping;fabric.repeat.set(4,4);
  const m=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.6,...extra});
  const wood=m('#d3b182',{map:timber,roughness:.38});
  const edge=m('#9c794e',{map:timber,roughness:.5});
  const brass=m('#d4af70',{metalness:.55,roughness:.3});
  const cream=m('#e5d0ad',{roughness:.35});
  function mesh(g,material,x,y,z,parent=scene){const o=new THREE.Mesh(g,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function ellipsoid(x,y,z,rx,ry,rz,material,parent=scene){const o=mesh(new THREE.SphereGeometry(1,48,32),material,x,y,z,parent);o.scale.set(rx,ry,rz);return o;}
  function cyl(x,y,z,rt,rb,h,material,parent=scene){return mesh(new THREE.CylinderGeometry(rt,rb,h,48),material,x,y,z,parent);}
  function rod(a,b,r,material,parent=scene){const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),v=q.clone().sub(p);const o=cyl(0,0,0,r,r,v.length(),material,parent);o.position.copy(p.add(q).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
  function rounded(w,h,d,x,y,z,material,r=.04,parent=scene){r=Math.min(r,w/3,h/3,d/3);const s=new THREE.Shape();s.moveTo(-w/2+r,-h/2+r);s.lineTo(w/2-r,-h/2+r);s.lineTo(w/2-r,h/2-r);s.lineTo(-w/2+r,h/2-r);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:3,steps:1});g.translate(0,0,-(d-2*r)/2);return mesh(g,material,x,y,z,parent);}
  function curve(points,r,material,parent=scene){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),48,r,10,false),material,0,0,0,parent);}
  // 与教室相同的木桌、夜窗和台灯，两个工具共享这一角空间。
  rounded(6.8,.2,3.65,0,-.08,0,wood,.08);
  rounded(6.55,.38,3.45,0,-.35,-.02,edge,.05);
  rounded(7,3.6,.12,0,1.53,-1.85,m('#453a30'),.025);
  const sky=texture(256,256,(c,w,h)=>{const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#0d1933');g.addColorStop(1,'#344457');c.fillStyle=g;c.fillRect(0,0,w,h);for(let i=0;i<8;i++){let x=i*35,top=135+rand()*55;c.fillStyle='#1a2738';c.fillRect(x,top,29,h-top);for(let j=0;j<5;j++)if(rand()>.4){c.fillStyle='#bfa276';c.fillRect(x+8,top+10+j*17,4,6);}}c.fillStyle='#f3dfb0';c.beginPath();c.arc(170,65,22,0,7);c.fill();c.globalCompositeOperation='destination-out';c.beginPath();c.arc(180,57,21,0,7);c.fill();c.globalCompositeOperation='destination-over';c.fillStyle=g;c.fillRect(0,0,w,h);});
  mesh(new THREE.PlaneGeometry(1.25,1.8),new THREE.MeshBasicMaterial({map:sky}),-2.28,1.8,-1.77);
  for(const x of [-2.95,-2.28,-1.61])rounded(.065,1.93,.1,x,1.8,-1.69,edge,.02);
  for(const y of [.86,1.8,2.74])rounded(1.42,.065,.1,-2.28,y,-1.69,edge,.02);
  rounded(1.5,.1,.3,-2.28,.82,-1.6,wood,.025);
  const lamp=new THREE.Group();lamp.position.set(2.1,.04,-1.0);scene.add(lamp);
  cyl(0,.04,0,.3,.33,.08,brass,lamp);rod([0,.08,0],[0,1.61,0],.035,brass,lamp);
  const shade=cyl(0,1.69,0,.19,.44,.38,cream,lamp);shade.castShadow=false;
  cyl(0,1.49,0,.4,.4,.02,m('#ffdc99',{emissive:'#ffc578',emissiveIntensity:2}),lamp);
  ellipsoid(0,1.91,0,.05,.035,.05,brass,lamp);
  const lampLight=new THREE.PointLight('#ffd099',13,8,2);lampLight.position.set(2.1,1.45,-.98);scene.add(lampLight);
  const warm=new THREE.SpotLight('#ffdbad',65,15,.85,.75,2);warm.position.set(-2.5,5,4);warm.target.position.set(0,.7,0);warm.castShadow=true;warm.shadow.mapSize.set(1024,1024);warm.shadow.normalBias=.025;warm.shadow.radius=4;scene.add(warm,warm.target);
  const fill=new THREE.DirectionalLight('#ffe2bd',1.1);fill.position.set(2,3,4);scene.add(fill);
  const cool=new THREE.DirectionalLight('#8eaaff',1.3);cool.position.set(-5,2,-1);scene.add(cool);
  scene.add(new THREE.HemisphereLight('#a5abc5','#7b6249',1.1));
  // 木鱼：椭圆实体、绕着表面雕刻的开口、布垫与木槌。
  ellipsoid(0,.19,.05,1.42,.19,1.08,m('#b09878',{map:fabric,roughness:1}),woodGroup);
  const seam=mesh(new THREE.TorusGeometry(1,.014,8,80),brass,0,.2,.05,woodGroup);seam.rotation.x=Math.PI/2;seam.scale.set(1.36,1.02,1);
  const fish=new THREE.Group();fish.position.set(0,.32,.05);woodGroup.add(fish);
  const body=ellipsoid(0,.72,0,1.12,.83,.88,wood,fish);
  // 深色开口和下沿贴合木鱼的弧面，避免悬浮在物体前面。
  const mouth=[],lip=[];
  for(let i=0;i<=24;i++){const x=-.73+i/24*1.46,z=.88*Math.sqrt(1-(x/1.12)**2)+.014,y=.67+.055*Math.cos(x*2);mouth.push([x,y,z]);lip.push([x,y-.052,z+.002]);}
  curve(mouth,.045,m('#29170e',{roughness:.9}),fish);curve(lip,.014,m('#d4a469'),fish);
  for(const sign of [-1,1]) {
    const line=[];
    for(let i=0;i<=36;i++){const a=i/36*Math.PI*1.6,x=sign*(.77+.19*Math.cos(a)),y=.9+.24*Math.sin(a);const v=Math.max(.03,1-(x/1.12)**2-((y-.72)/.83)**2);line.push([x,y,.88*Math.sqrt(v)+.012]);}
    curve(line,.013,m('#9d703e'),fish);
  }
  const mallet=new THREE.Group();mallet.position.set(1.23,2.42,-.15);woodGroup.add(mallet);
  rod([.28,.14,0],[-.68,-.56,.26],.055,wood,mallet);
  const malletHead=ellipsoid(-.72,-.59,.27,.23,.17,.18,m('#d2ac77',{map:timber,roughness:.48}),mallet);malletHead.rotation.z=-.65;
  // 呼吸：有体积的暖色柔光球与黄铜底座，起伏只由呼吸状态驱动。
  cyl(0,.08,.05,.76,.83,.16,edge,breathGroup);
  cyl(0,.18,.05,.7,.74,.055,brass,breathGroup);
  const orbPivot=new THREE.Group();orbPivot.position.set(0,1.23,.05);breathGroup.add(orbPivot);
  const orbMaterial=new THREE.MeshPhysicalMaterial({color:'#c29f65',metalness:.24,roughness:.21,clearcoat:1,clearcoatRoughness:.18,emissive:'#d18d35',emissiveIntensity:.12});
  ellipsoid(0,0,0,.83,.83,.83,orbMaterial,orbPivot);
  // 后方柔光只出现在球周围，不遮住文字。
  const glowMap=texture(128,128,(c,w,h)=>{const g=c.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'rgba(255,197,109,.35)');g.addColorStop(.5,'rgba(255,177,77,.1)');g.addColorStop(1,'rgba(255,177,77,0)');c.fillStyle=g;c.fillRect(0,0,w,h);});
  const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowMap,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));halo.position.set(0,1.23,-.15);halo.scale.setScalar(3.1);breathGroup.add(halo);
  const orbit=mesh(new THREE.TorusGeometry(.96,.013,10,96),brass,0,0,0,orbPivot);orbit.rotation.x=1.13;orbit.rotation.z=-.22;
  const orbLight=new THREE.PointLight('#ffcb86',2.5,4,2);orbLight.position.set(0,1.1,.3);breathGroup.add(orbLight);
  let kind='wood',frame=0,last=0,draws=0,alive=true,ready=false,struckAt=-10000;
  let breath=window.restBreathingState||{scale:1,running:false,phase:'idle'};
  let width=0,height=0;
  const projected=new THREE.Vector3();
  function visible(){return !view.hidden&&!document.hidden;}
  function draw(now){
    if(!alive||!visible()||!width||!height)return;
    const hitAge=(now-struckAt)/420,hit=!reduced.matches&&hitAge>=0&&hitAge<1?Math.sin(Math.PI*hitAge):0;
    fish.scale.set(1+hit*.018,1-hit*.045,1+hit*.018);mallet.rotation.z=hit*.46;
    const scale=reduced.matches?1:(breath.scale||1);
    orbPivot.scale.setScalar(scale);orbPivot.position.y=1.23+(scale-1)*.5;
    halo.scale.setScalar(3.1*scale);halo.position.y=orbPivot.position.y;
    orbMaterial.emissiveIntensity=.12+(scale-1)*.45;orbLight.intensity=2.5+(scale-1)*5;
    renderer.shadowMap.needsUpdate=true;
    scene.updateMatrixWorld(true);camera.updateMatrixWorld();
    if(kind==='wood'){
      projected.set(0,1.05,.25).project(camera);
      hitButton.style.left=`${(projected.x*.5+.5)*width}px`;hitButton.style.top=`${(-projected.y*.5+.5)*height}px`;
    }else{
      orbPivot.getWorldPosition(projected).project(camera);
      breathLabel.style.left=`${(projected.x*.5+.5)*width}px`;breathLabel.style.top=`${(-projected.y*.5+.5)*height}px`;
    }
    renderer.render(scene,camera);draws++;ready=true;stages[kind].classList.add('has-tool-3d');
  }
  function queue(){if(!frame&&alive&&visible())frame=requestAnimationFrame(tick);}
  function tick(now){frame=0;if(!alive||!visible())return;if(now-last>=32||(kind==='wood'&&now-struckAt>=420)){draw(now);last=now;}
    if(!reduced.matches&&((kind==='wood'&&now-struckAt<440)||(kind==='breath'&&breath.running)))queue();
  }
  function layout(){const stage=stages[kind];width=stage.clientWidth;height=stage.clientHeight;if(!width||!height||!visible())return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.position.set(width<600?2.35:2.6,2.8,width<600?6.2:6.6);camera.fov=width<600?43:37;camera.lookAt(0,1.08,0);camera.updateProjectionMatrix();draw(performance.now());queue();}
  function sync(){
    if(!visible()){cancelAnimationFrame(frame);frame=0;return;}
    kind=woodPanel.hidden?'breath':'wood';woodGroup.visible=kind==='wood';breathGroup.visible=kind==='breath';
    if(canvas.parentElement!==stages[kind]){stages[kind].prepend(canvas);for(const stage of Object.values(stages))stage.classList.remove('has-tool-3d');}
    layout();
  }
  const resize=new ResizeObserver(layout);resize.observe(stages.wood);resize.observe(stages.breath);
  hitButton.addEventListener('click',()=>{struckAt=performance.now();draw(struckAt);queue();});
  window.addEventListener('rest:breathing',event=>{breath=event.detail;if(kind==='breath'&&visible()&&!reduced.matches) {if(!breath.running)draw(performance.now());queue();}});
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',()=>{draw(performance.now());queue();});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();alive=false;cancelAnimationFrame(frame);frame=0;for(const stage of Object.values(stages))stage.classList.remove('has-tool-3d');hitButton.removeAttribute('style');breathLabel.removeAttribute('style');});
  canvas.addEventListener('webglcontextrestored',()=>{alive=true;sync();});
  window.tools3D={getState:()=>({kind,alive,ready,draws,scale:orbPivot.scale.x,running:breath.running,hit:Math.max(0,Math.min(1,(performance.now()-struckAt)/420)),calls:renderer.info.render.calls}),sync};
  return {sync};
}
