import * as THREE from 'three';
const canvas=document.querySelector('canvas'), scene=new THREE.Scene(); scene.background=new THREE.Color('#101712');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));
const camera=new THREE.PerspectiveCamera(40,1,.1,100); camera.position.set(5,4,7);
let dragging=false,lastX=0,lastY=0; canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId)}); canvas.addEventListener('pointerup',()=>dragging=false); canvas.addEventListener('pointermove',e=>{if(dragging){model.rotation.y+=(e.clientX-lastX)*.01;model.rotation.x+=(e.clientY-lastY)*.01;lastX=e.clientX;lastY=e.clientY}}); canvas.addEventListener('wheel',e=>{e.preventDefault();camera.position.multiplyScalar(e.deltaY>0?1.1:.9)},{passive:false}); camera.lookAt(0,1,0);
scene.add(new THREE.HemisphereLight(0xffffff,0x343b34,2)); const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(3,6,4);scene.add(light);
const grid=new THREE.GridHelper(30,30,0x25352a,0x1c2a20);scene.add(grid);
const model=new THREE.Group(); scene.add(model);
const base=new THREE.Mesh(new THREE.CylinderGeometry(2,2,.25,80),new THREE.MeshStandardMaterial({color:0x4a483e,metalness:.25,roughness:.8}));base.position.y=.12;model.add(base);
const mesh=new THREE.Mesh(new THREE.TorusKnotGeometry(.82,.25,180,24,2,3),new THREE.MeshStandardMaterial({color:0xdedbd1,roughness:.33}));mesh.position.y=1.75; mesh.rotation.z=.4; model.add(mesh);
const rim=new THREE.Mesh(new THREE.TorusGeometry(1.98,.012,8,100),new THREE.MeshBasicMaterial({color:0xff5738}));rim.rotation.x=Math.PI/2;rim.position.y=.27;model.add(rim);
let auto=false,spin=false,mode='实体',bg=false;
function size(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}addEventListener('resize',size);size();
function draw(){requestAnimationFrame(draw);if(auto)model.rotation.y+=.004;if(spin)mesh.rotation.y+=.01;renderer.render(scene,camera)}draw();
const message=document.querySelector('#status');function status(t){message.textContent=t}
function selectMode(m){mode=m;mesh.material=m==='法线'?new THREE.MeshNormalMaterial():new THREE.MeshStandardMaterial({color:m==='陶土'?0xceaa8f:0xdedbd1,roughness:.4,wireframe:m==='线框'});document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===m));status(`示例 · ${m}模式`)}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>selectMode(b.dataset.mode));
document.querySelector('#grid').onclick=()=>{grid.visible=!grid.visible;status(grid.visible?'网格已显示':'网格已隐藏')};
document.querySelector('#auto').onclick=()=>{auto=!auto;status(auto?'自动环绕已开启':'自动环绕已关闭')};
document.querySelector('#spin').onclick=()=>{spin=!spin;status(spin?'模型自转已开启':'模型自转已关闭')};
document.querySelector('#bg').onclick=()=>{bg=!bg;scene.background.set(bg?'#343c36':'#101712');status('背景已切换')};
document.querySelector('#fit').onclick=()=>{camera.position.set(5,4,7);camera.lookAt(0,1,0);status('已适应视图')};
document.querySelector('#reset').onclick=()=>{selectMode('实体');grid.visible=true;auto=false;spin=false;bg=false;scene.background.set('#101712');camera.position.set(5,4,7);camera.lookAt(0,1,0);model.rotation.set(0,0,0);mesh.rotation.set(0,0,.4);status('示例已恢复')};
