// Shared compact subpage hero. Set <canvas id="subgl" data-obj="NAME" data-accent="HEX">.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { BUILD } from './objects3d.js';
const canvas=document.getElementById('subgl');
if(canvas && BUILD[canvas.dataset.obj]){
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const grab=document.querySelector('.subgrab');
let renderer,scene,camera,group,raf;
try{
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
  scene=new THREE.Scene();
  const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),0.04).texture;
  camera=new THREE.PerspectiveCamera(40,1,0.1,100);camera.position.set(0,0,11);
  const accent=canvas.dataset.accent?parseInt(canvas.dataset.accent,16):null;
  group=BUILD[canvas.dataset.obj]({accent});const baseScale=group.userData.scale||1;scene.add(group);
  const key=new THREE.SpotLight(0xffffff,175,50,0.6,0.5);key.position.set(6,9,10);scene.add(key);
  const rim=new THREE.SpotLight(0xffffff,80,50,0.7,0.6);rim.position.set(-8,-2,5);scene.add(rim);
  scene.add(new THREE.AmbientLight(0x404652,1.1));
  window.__setSceneTheme=(night)=>{renderer.toneMappingExposure=night?1.2:1.0;};
  window.__setSceneTheme(document.documentElement.getAttribute('data-theme')==='night');
  function resize(){const r=canvas.getBoundingClientRect();if(r.width<2){requestAnimationFrame(resize);return;}renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();
    const nw=matchMedia('(max-width:820px)').matches;group.scale.setScalar(baseScale*(nw?0.6:0.82));}
  resize();addEventListener('resize',resize);
  let mx=0,my=0,tx=0,ty=0,t=0,dragAz=0,dragVel=0,dragging=false,lastX=0,didDrag=false;
  addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-0.5);my=(e.clientY/innerHeight-0.5);},{passive:true});
  canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;dragVel=0;try{canvas.setPointerCapture(e.pointerId)}catch(_){}});
  addEventListener('pointerup',()=>{dragging=false;});
  canvas.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX;lastX=e.clientX;dragVel=dx*0.006;dragAz+=dragVel;if(Math.abs(dx)>2&&!didDrag){didDrag=true;if(grab)grab.style.opacity='0';}});
  const spin=group.userData.spin;
  function loop(){raf=requestAnimationFrame(loop);t+=0.016;
    if(!dragging){dragVel*=0.92;dragAz+=dragVel;}
    tx+=(mx*0.3-tx)*0.05;ty+=(my*0.25-ty)*0.05;
    if(group.userData.tex&&!reduce)group.userData.tex.offset.y-=0.006;
    if(group.userData.open){const o=reduce?0.16:0.16+Math.sin(t*0.9)*0.12;group.userData.open[0].rotation.z=o;group.userData.open[1].rotation.z=-o;}
    if(spin==='sway'){group.rotation.y=Math.sin(t*0.35)*0.5+dragAz+tx;group.rotation.x=0.1-ty*0.3;}
    else if(spin==='z'){if(!reduce&&!dragging)group.rotation.z-=0.006;group.rotation.y=dragAz+tx;group.rotation.x=-0.2-ty*0.3;}
    else{group.rotation.y=(reduce?0.5:0.5+t*0.22)+dragAz+tx;group.rotation.x=-ty*0.2;}
    group.position.y=Math.sin(t*0.6)*0.08;
    renderer.render(scene,camera);}
  loop();
}catch(err){console.warn('subhero WebGL fallback',err);canvas.style.display='none';}
}
