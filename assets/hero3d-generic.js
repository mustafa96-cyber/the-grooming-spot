// Shared scroll-choreographed hero. Set <canvas id="gl" data-obj="NAME" data-accent="HEX">.
// Reuses the object library so any trade can pick its hero object by name.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { BUILD } from './objects3d.js?v=2';
const canvas=document.getElementById('gl');
if(canvas && BUILD[canvas.dataset.obj]){
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const heroEl=document.getElementById('top'), stageA=document.getElementById('stageA'), stageB=document.getElementById('stageB'), badge=document.getElementById('badge3d'), hprog=document.getElementById('hprog'), grab=document.querySelector('.grab');
const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x);};
function narrow(){return matchMedia('(max-width:940px)').matches;}
function progress(){if(!heroEl)return 0;const r=heroEl.getBoundingClientRect();const total=r.height-innerHeight;if(total<=0)return 0;return Math.min(1,Math.max(0,-r.top/total));}
let renderer,scene,camera,group,raf;
try{
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
  scene=new THREE.Scene();
  const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),0.04).texture;
  camera=new THREE.PerspectiveCamera(38,1,0.1,100);camera.position.set(0,0,10.5);
  const accent=canvas.dataset.accent?parseInt(canvas.dataset.accent,16):null;
  const side=canvas.dataset.side||'right';        // right | left | center
  const sideX=side==='left'?-2.4:side==='center'?0:2.4;
  const scaleMul=parseFloat(canvas.dataset.scale||(side==='center'?'1.18':'1'));
  group=BUILD[canvas.dataset.obj]({accent});
  const baseScale=(group.userData.scale||1)*scaleMul;scene.add(group);
  const shadowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const rg=g.createRadialGradient(64,64,4,64,64,64);rg.addColorStop(0,'rgba(12,16,22,.5)');rg.addColorStop(1,'rgba(12,16,22,0)');g.fillStyle=rg;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);})();
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(6,2.6),new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,opacity:.5,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=-3;scene.add(shadow);
  const key=new THREE.SpotLight(0xffffff,175,60,0.6,0.5);key.position.set(6,9,10);scene.add(key);
  const rim=new THREE.SpotLight(0xffffff,80,60,0.7,0.6);rim.position.set(-8,-2,5);scene.add(rim);
  scene.add(new THREE.AmbientLight(0x404652,1.05));
  window.__setSceneTheme=(night)=>{renderer.toneMappingExposure=night?1.2:1.02;};
  window.__setSceneTheme(document.documentElement.getAttribute('data-theme')==='night');
  function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
  resize();addEventListener('resize',resize);
  let mx=0,my=0,tx=0,ty=0,t=0,dragAz=0,dragVel=0,dragging=false,lastX=0,didDrag=false;
  addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-0.5);my=(e.clientY/innerHeight-0.5);},{passive:true});
  canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;dragVel=0;try{canvas.setPointerCapture(e.pointerId)}catch(_){}});
  addEventListener('pointerup',()=>{dragging=false;});
  canvas.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX;lastX=e.clientX;dragVel=dx*0.006;dragAz+=dragVel;if(Math.abs(dx)>2&&!didDrag){didDrag=true;if(grab)grab.style.opacity='0';}});
  const spin=group.userData.spin;
  function loop(){raf=requestAnimationFrame(loop);t+=0.016;const nw=narrow();const p=progress();
    if(!dragging){dragVel*=0.92;dragAz+=dragVel;}
    tx+=(mx*0.4-tx)*0.05;ty+=(my*0.3-ty)*0.05;
    if(group.userData.tex&&!reduce)group.userData.tex.offset.y-=0.006;
    if(group.userData.open){const o=reduce?0.16:0.16+Math.sin(t*0.9)*0.12;group.userData.open[0].rotation.z=o;group.userData.open[1].rotation.z=-o;}
    if(spin==='sway'){group.rotation.y=Math.sin(t*0.33)*0.55+dragAz+tx*0.8;group.rotation.x=0.1-ty*0.4;}
    else if(spin==='z'){if(!reduce&&!dragging)group.rotation.z-=0.006;group.rotation.y=dragAz+tx*0.8;group.rotation.x=-0.2-ty*0.4;}
    else{group.rotation.y=(reduce?0.5:0.5+t*0.25)+dragAz+tx*0.8;group.rotation.x=-ty*0.25;}
    const baseX=nw?0:sideX;group.position.x=baseX;
    group.position.y=(nw?-0.2:(side==='center'?-0.2:-0.4))+Math.sin(t*0.6)*0.08;
    group.scale.setScalar(baseScale*(nw?0.62:0.92)*(1-0.04*p));
    shadow.position.x=group.position.x;shadow.material.opacity=(nw?.35:.5)*(1-0.4*p);
    camera.position.z=10.5-0.8*ss(0,1,p);
    const aOp=1-ss(0.05,0.28,p);
    if(stageA){stageA.style.opacity=aOp;stageA.style.transform='translateY('+(-24*ss(0.05,0.3,p))+'px)';stageA.style.pointerEvents=aOp<0.15?'none':'auto';}
    if(badge)badge.style.opacity=aOp;
    if(stageB){stageB.style.opacity=ss(0.34,0.52,p)*(1-ss(0.92,1,p));stageB.style.transform='translateY(calc(-50% + '+(22*(1-ss(0.34,0.52,p)))+'px))';}
    if(hprog)hprog.style.width=(p*100).toFixed(1)+'%';
    renderer.render(scene,camera);}
  loop();
}catch(err){console.warn('WebGL hero fallback',err);canvas.style.display='none';var fb=document.querySelector('.hero-fb');if(fb)fb.style.display='block';}
}
