import street from '../assets/frame-street.jpg';
import fields from '../assets/frame-fields.jpg';
import art1 from '../assets/frame-01-birds.png';
import art5 from '../assets/frame-5.jpg';
import art7 from '../assets/frame-7.jpg';
import art3 from '../assets/frame-3.jpg';
import game6 from '../assets/game-screen-7.jpg';
import game7 from '../assets/game-screen-8.png';
import game0 from '../assets/game-screen-1.jpg';
import game1 from '../assets/game-screen-2.jpg';
import game2 from '../assets/game-screen-3.jpg';
import game3 from '../assets/game-screen-4.jpg';
import game4 from '../assets/game-screen-5.jpg';
import game5 from '../assets/game-screen-6.jpg';
import {createRoomEntrance} from './room-entrance';
import * as T from 'three';
import {createPrototypeSound,playRoomSound} from '../lib/prototype-sound';
import {createFrameEditor} from './frame-editor';
import {createMemoryProps} from './memory-props';
import {setupIdeasBook} from './ideas-book';
import {setupJournal} from './journal';
import {createSceneInteractions} from './scene-interactions';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
import shelfUrl from '../assets/shelf-1.fbx';
import {wallPhotos} from './wall-photos';
import centerArtUrl from '../assets/frame-04-rainbow.jpg';
import sofaUrl from '../assets/sofa-tripo.glb';
import deskUrl from '../assets/desk.glb';
import chairUrl from '../assets/chair.glb';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

export type Mode = 'night' | 'blue' | 'day';
export type RoomPrototypeEngine = {setSofa:(useImported:boolean)=>void;resetView:()=>void;setMode:(mode:Mode)=>void;nextSlide:(direction:number)=>void;focusItem:(label:string)=>void};
type V = [number,number,number];
type Item = {label:string;position:T.Vector3;target:T.Vector3};
export const slides = ['第一次远行','工作室的夜晚','一起通关的日子'];
// Original wall and sofa finishes retained; floor halfway between light and dark.
const warmLeatherPalette = false;
const darkerWoodFloor = true;
const roomMinPolarAngle = 1.02, roomMaxPolarAngle = 1.39;

export function createRoomPrototype(host:HTMLElement, callbacks:{onReady:()=>void;onFocus:(label:string|null)=>void;onSofaStatus?:(status:string)=>void}) {
 const sound=createPrototypeSound(host);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,1,.1,120);
 let entranceController:ReturnType<typeof createRoomEntrance>|undefined;
 function entranceView():T.Camera{entranceController?.update();return camera}
 const renderer=new T.WebGLRenderer({antialias:true,stencil:true});renderer.localClippingEnabled=true;renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;host.appendChild(renderer.domElement);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.zoomToCursor=true;controls.screenSpacePanning=true;controls.minDistance=6;controls.maxDistance=14;controls.minPolarAngle=roomMinPolarAngle;controls.maxPolarAngle=roomMaxPolarAngle;controls.minAzimuthAngle=-.24;controls.maxAzimuthAngle=.24;
 controls.mouseButtons={LEFT:T.MOUSE.ROTATE,MIDDLE:T.MOUSE.PAN,RIGHT:T.MOUSE.PAN};
 controls.touches={ONE:T.TOUCH.ROTATE,TWO:T.TOUCH.DOLLY_PAN};controls.enableZoom=true;
 const home=new T.Vector3(.35,3.8,9.4),target=new T.Vector3(0,.95,-.1);camera.position.copy(home);controls.target.copy(target);
 const room=new T.Group();room.name='AnnualRoom';scene.add(room);const meshes:T.Mesh[]=[],materials:T.Material[]=[],textures:T.Texture[]=[];const pickables:T.Object3D[]=[];
 const mat=(color:number,roughness=.75,metalness=0)=>{const m=new T.MeshStandardMaterial({color,roughness,metalness});materials.push(m);return m};
 const wood=mat(0x985735),edge=mat(0xb36a3f),wall=mat(0xf0eadc),cream=mat(0xf1e8d7,.98),seam=mat(0xded3bf),green=mat(0x78804b),white=mat(0xf5f1e9),black=mat(0x252b31),silver=mat(0xc9ced1,.3,.65),blue=mat(0x81b7cd),yellow=mat(0xe5ad46);
 const mesh=(g:T.BufferGeometry,m:T.Material,p:T.Object3D=room)=>{const o=new T.Mesh(g,m);o.castShadow=true;o.receiveShadow=true;p.add(o);meshes.push(o);return o};
 const box=(s:V,p:V,m:T.Material,r=.025,parent:T.Object3D=room)=>{const o=mesh(r?new RoundedBoxGeometry(...s,4,Math.min(r,...s.map(x=>x*.46))):new T.BoxGeometry(...s),m,parent);o.position.set(...p);return o};
 const cyl=(r:number,h:number,p:V,m:T.Material,parent:T.Object3D=room)=>{const o=mesh(new T.CylinderGeometry(r,r,h,32),m,parent);o.position.set(...p);return o};
 const tube=(points:V[],r:number,m:T.Material,parent:T.Object3D=room)=>mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),24,r,8,false),m,parent);
 function canvasTexture(w:number,h:number,draw:(c:CanvasRenderingContext2D)=>void){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d')!);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();textures.push(t);return t;}
 let seed=83;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const grain=canvasTexture(512,512,c=>{c.fillStyle='#b89679';c.fillRect(0,0,512,512);for(let i=0;i<1600;i++){c.strokeStyle=`rgba(80,42,20,${random()*.075})`;c.beginPath();const y=random()*512;c.moveTo(0,y);c.bezierCurveTo(180,y+random()*8,310,y-random()*8,512,y);c.stroke()}});wood.map=grain;wood.color.setHex(0xe1cbbb);edge.map=grain;edge.color.setHex(0xe7c5a7);
 const fabric=canvasTexture(256,256,c=>{c.fillStyle='#dedbd3';c.fillRect(0,0,256,256);for(let i=0;i<256;i+=3){c.strokeStyle=i%2?'#e8e5df':'#c9c6bf';c.beginPath();c.moveTo(i,0);c.lineTo(i,256);c.stroke();c.beginPath();c.moveTo(0,i);c.lineTo(256,i);c.stroke()}});cream.bumpMap=fabric;cream.bumpScale=.018;
 // Layout V2: metres; x = drawing x/1000 - 3; y = height; z = drawing depth/1000 - 2.
 // Named, local-origin groups are replacement slots for future GLB furniture.
 const group=(name:string,p:V=[0,0,0])=>{const g=new T.Group();g.name=name;g.position.set(...p);room.add(g);return g};
 function soft(s:V,p:V,m:T.Material,parent:T.Object3D,r=.12){
  const geo=new RoundedBoxGeometry(...s,8,Math.min(r,...s.map(v=>v*.44)));
  const pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
   const nx=x/(s[0]/2),nz=z/(s[2]/2);
   // Broad upholstery compression, not random noise or a hard rectangular block.
   const bulge=Math.max(0,1-nx*nx)*Math.max(0,1-nz*nz);
   pos.setY(i,y+Math.sign(y)*.045*bulge);
  }geo.computeVertexNormals();const o=mesh(geo,m,parent);o.position.set(...p);return o;
 }
 const sideInset=.892/4;
 function createRoom(){
  const g=group('Architecture');
  // Side-wall run = 4m × 2/3; no steps at the open ends.
  const run=8/3,end=-2+run,center=-2+run/2;
  box([6.2-2*sideInset,.24,4.2],[0,-.12,0],wood,.025,g);
  const paleFloor=canvasTexture(1536,1024,c=>{
   c.fillStyle='#dcb789';c.fillRect(0,0,1536,1024);
   // Top-face UV v follows room depth: planks and grain run front to back.
   for(let col=0;col<24;col++){
    const x=col*64;
    // Full-depth continuous planks: no transverse joints or mid-board colour changes.
    c.fillStyle=['#dfbc91','#d9b386','#e2bf94','#dbb78b'][(col*3)%4];c.fillRect(x,0,64,1024);
    c.strokeStyle='rgba(176,142,103,.32)';c.lineWidth=1.8;c.beginPath();c.moveTo(x,0);c.lineTo(x,1024);c.stroke();
    c.strokeStyle='rgba(255,237,207,.4)';c.lineWidth=.8;c.beginPath();c.moveTo(x+1.7,0);c.lineTo(x+1.7,1024);c.stroke();
   }
   for(let i=0;i<2200;i++){const x=random()*1536,y=random()*1024;c.strokeStyle=i%3?'rgba(127,77,35,.065)':'rgba(255,232,196,.11)';c.lineWidth=.7;c.beginPath();c.moveTo(x,y);const length=35+random()*210;c.bezierCurveTo(x+1.5,y+length*.3,x-1,y+length*.7,x+.3,y+length);c.stroke()}
  });
  const fm=mat(darkerWoodFloor?0xdac9b9:0xffffff,.83);fm.map=paleFloor;box([6-2*sideInset,.018,4],[0,.009,0],fm,0,g);
  if(warmLeatherPalette)wall.color.copy(green.color);
  box([4.32-sideInset,2.6,.1],[-.84+sideInset/2,1.3,-2.05],wall,.005,g);
  box([1.68-sideInset,.8,.1],[2.16-sideInset/2,.4,-2.05],wall,.005,g);box([1.68-sideInset,.2,.1],[2.16-sideInset/2,2.5,-2.05],wall,.005,g);
  box([.1,2.6,run],[-3.05+sideInset,1.3,center],wall,.005,g);
  box([.1,.8,run],[3.05-sideInset,.4,center],wall,.005,g);box([.1,.2,run],[3.05-sideInset,2.5,center],wall,.005,g);
  box([.1,1.6,.4],[3.05-sideInset,1.6,end-.2],wall,.005,g);
  box([6.2-2*sideInset,.12,.16],[0,2.66,-2.05],edge,.01,g);
  for(const x of[-3.05+sideInset,3.05-sideInset]){box([.16,.12,run+.1],[x,2.66,center],edge,.01,g);box([.16,2.72,.16],[x,1.3,end],edge,.01,g);box([.035,.065,run],[x>0?2.983-sideInset:-2.983+sideInset,.0325,center],wood,.003,g)}
 }
 // Upholstery relief: quiet stitched botanical loops, not a printed high-contrast pattern.
 const upholstery=canvasTexture(512,512,c=>{
  c.fillStyle='#aaaaaa';c.fillRect(0,0,512,512);
  for(let y=-32;y<550;y+=64)for(let x=-32;x<550;x+=64){
   const cx=x+((Math.floor(y/64)%2)*16);
   c.strokeStyle='#8e8e8e';c.lineWidth=2;c.beginPath();
   c.moveTo(cx,y+32);c.bezierCurveTo(cx+3,y+3,cx+32,y+3,cx+32,y-2);
   c.bezierCurveTo(cx+60,y+12,cx+60,y+38,cx+32,y+62);
   c.bezierCurveTo(cx+24,y+42,cx+4,y+48,cx,y+32);c.stroke();
   c.strokeStyle='#c1c1c1';c.lineWidth=1;c.beginPath();c.moveTo(cx+4,y+32);c.quadraticCurveTo(cx+30,y+17,cx+32,y+5);c.moveTo(cx+32,y+5);c.quadraticCurveTo(cx+34,y+32,cx+51,y+34);c.stroke();
  }
 });upholstery.wrapS=upholstery.wrapT=T.RepeatWrapping;upholstery.repeat.set(3,2);
 cream.bumpMap=upholstery;cream.bumpScale=.009;yellow.bumpMap=upholstery;yellow.bumpScale=.006;
 function plush(size:V,p:V,m:T.Material,parent:T.Object3D,compression=0){
  const geo=new T.SphereGeometry(1,64,40),pos=geo.attributes.position;
  const sp=(v:number,power:number)=>Math.sign(v)*Math.pow(Math.abs(v),power);
  for(let i=0;i<pos.count;i++){
   const sy=T.MathUtils.clamp(pos.getY(i),-1,1),lat=Math.asin(sy),lon=Math.atan2(pos.getZ(i),pos.getX(i));
   const ring=Math.pow(Math.max(0,Math.cos(lat)),.42);
   const x=ring*sp(Math.cos(lon),.35)*size[0]/2;
   const z=ring*sp(Math.sin(lon),.4)*size[2]/2;
   let y=sp(Math.sin(lat),.52)*size[1]/2;
   if(y>0)y-=compression*Math.exp(-Math.pow(x/(size[0]*.34),4)-Math.pow(z/(size[2]*.34),4));
   pos.setXYZ(i,x,y,z);
  }
  geo.computeVertexNormals();const o=mesh(geo,m,parent);o.position.set(...p);return o;
 }
 function createFloorLamp(){
  const lamp=group('Sofa_Floor_Lamp',[-1.82,.018,-.66]);
  lamp.userData.editable=true;lamp.userData.label='沙发左侧落地灯';
  const cordMaterial=mat(0x65574a,.9);
  tube([[.075,.06,0],[.13,.015,-.04],[.25,.008,-.10],[.36,.008,-.23],[.52,.008,-.27],[.67,.008,-.42],[.85,.008,-.50]],.004,cordMaterial,lamp);
  const red=new T.MeshPhysicalMaterial({color:0xe7663c,roughness:.42,metalness:.12,clearcoat:.22,clearcoatRoughness:.35});materials.push(red);
  // Reference proportions: narrow tall cylindrical plinth and a broad ivory shade.
  cyl(.098,.014,[0,.007,0],red,lamp);
  cyl(.082,.027,[0,.0275,0],red,lamp);
  const ribbedRed=red.clone();materials.push(ribbedRed);
  const ribs=canvasTexture(512,256,c=>{
   c.fillStyle='#888888';c.fillRect(0,0,512,256);
   for(let x=0;x<512;x+=4){c.fillStyle=x%8?'#999999':'#6f6f6f';c.fillRect(x,0,1,256)}
  });ribs.colorSpace=T.NoColorSpace;ribbedRed.bumpMap=ribs;ribbedRed.bumpScale=.0006;
  cyl(.078,.40,[0,.24,0],ribbedRed,lamp);
  cyl(.079,.008,[0,.444,0],red,lamp);
  cyl(.007,1.36,[0,1.12,0],red,lamp);
  const head=new T.Group();head.position.set(0,1.48,0);lamp.add(head);
  const shadeMaterial=mat(0xf0e9d9,.9);
  shadeMaterial.emissive.setHex(0xffd9a6);
  const lining=mat(0xf6e9c7,.65);lining.side=T.BackSide;lining.emissive.setHex(0xffd8a0);
  const shade=mesh(new T.CylinderGeometry(.075,.285,.29,64,1,true),shadeMaterial,head);shade.position.y=.145;
  const inner=mesh(new T.CylinderGeometry(.072,.282,.288,64,1,true),lining,head);
  inner.position.y=.145;inner.castShadow=false;
  for(const [radius,y] of [[.2835,0],[.0735,.29]]){
   const rim=mesh(new T.TorusGeometry(radius,.002,8,64),shadeMaterial,head);rim.rotation.x=Math.PI/2;rim.position.y=y;
  }
  const bulbMaterial=mat(0xfff2d4,.5);bulbMaterial.emissive.setHex(0xffd49a);
  const bulb=mesh(new T.SphereGeometry(.035,24,16),bulbMaterial,head);
  bulb.position.y=.045;bulb.castShadow=false;
  const light=new T.PointLight(0xffd5a0,1.4,3.2,2);
  light.position.set(0,-.015,0);head.add(light);
  // Broad bounced light carries the room illumination; the bulb is only a local accent.
  const bounce=new T.HemisphereLight(0xffe5c3,0xbba18a,.55);lamp.add(bounce);
  const softFill=new T.DirectionalLight(0xffe5c3,1.05);softFill.position.set(1.2,3,3.5);lamp.add(softFill);
  const reverseFill=new T.DirectionalLight(0xe0e9ff,.32);reverseFill.position.set(-1,3,4);lamp.add(reverseFill);
  lamp.userData.setRoomLight=(level:number)=>{light.intensity=2.2*level;bounce.intensity=.24*level;softFill.intensity=.38*level;reverseFill.intensity=.12*level;bulbMaterial.emissiveIntensity=.75*level;lining.emissiveIntensity=.45*level;shadeMaterial.emissiveIntensity=.55*level};
 }
 function createFurniture(){
  createFloorLamp();
  // Expand depth .8 -> 1.0m toward the open front; rear edge stays at z=.3.
  // Legs inherit the new tabletop centre (z=.8 instead of .7).
  const coffee=group('Coffee_Table',[0,0,.8]);
  // Plan-view circular corners independent of slab thickness: flat top, vertical sides.
  const outline=new T.Shape(),hw=1.343,hd=.493,radius=.19;
  outline.moveTo(-hw+radius,-hd);outline.lineTo(hw-radius,-hd);
  outline.absarc(hw-radius,-hd+radius,radius,-Math.PI/2,0,false);
  outline.lineTo(hw,hd-radius);outline.absarc(hw-radius,hd-radius,radius,0,Math.PI/2,false);
  outline.lineTo(-hw+radius,hd);outline.absarc(-hw+radius,hd-radius,radius,Math.PI/2,Math.PI,false);
  outline.lineTo(-hw,-hd+radius);outline.absarc(-hw+radius,-hd+radius,radius,Math.PI,Math.PI*1.5,false);outline.closePath();
  const top=mesh(new T.ExtrudeGeometry(outline,{depth:.096,bevelEnabled:true,bevelSize:.007,bevelThickness:.007,bevelSegments:3,curveSegments:32}),wood,coffee);
  top.name='Straight_Edge_Round_Corner_Tabletop';top.rotation.x=-Math.PI/2;top.position.y=.302;
  for(const x of[-1.03,1.03])box([.36,.295,.48],[x,.1475,0],wood,.055,coffee);
  const rugMap=canvasTexture(1024,768,c=>{c.fillStyle='#e9dfc7';c.fillRect(0,0,1024,768);const colors=['#c87551','#94bfc5','#d9ae55'];for(let y=35;y<760;y+=82)for(let x=20;x<1000;x+=15){if(random()<.18)continue;c.fillStyle=colors[Math.floor(x/150+y/80)%3];c.fillRect(x,y,3,27+random()*12)}c.fillStyle='#bc6045';c.fillRect(764,420,52,160);c.strokeStyle='#86afb8';c.lineWidth=3;c.beginPath();c.moveTo(145,0);c.lineTo(145,768);c.stroke();c.strokeStyle='#c57756';c.strokeRect(300,165,520,400)});
  const rm=mat(0xffffff,1);rm.map=rugMap;rm.bumpMap=fabric;rm.bumpScale=.003;box([3.3,.012,2.8],[0,.027,.35],rm,.005,group('Rug'));
  const luggage=group('Silver_Suitcase',[-2.35,0,1.35]);luggage.rotation.y=-25*Math.PI/180;luggage.userData.editable=true;luggage.userData.label='旅行行李箱';
  box([.5,.6,.18],[0,.37,-.05],silver,.04,luggage);
  box([.46,.55,.006],[0,.37,.042],black,.003,luggage);
  const hinge=new T.Group();hinge.name='CaseHinge';hinge.position.set(-.25,0,.045);luggage.add(hinge);
  box([.5,.6,.095],[.25,.37,.0475],silver,.035,hinge);
  for(let i=-3;i<=3;i++)box([.008,.48,.008],[.25+i*.057,.37,.097],silver,.003,hinge);
  
  for(const x of[-.18,.18])for(const z of[-.09,.09]){const wheel=cyl(.035,.03,[x,.05,z],black,luggage);wheel.rotation.z=Math.PI/2}
  tube([[-.08,.674,0],[-.08,.682,.045],[.08,.682,.045],[.08,.674,0]],.012,black,luggage);
 }
 // Original volumetric skyline and three-car train, raised above the sill.
 const city=new T.Group();city.name='City_HighFloor_View';city.scale.setScalar(.57);city.position.set(1.5,-.15,.28);scene.add(city);
 const buildingMats=[mat(0x334965),mat(0x455876),mat(0x566880)];
 const windowMat=new T.MeshStandardMaterial({color:0xffd7a2,emissive:0xffba67,emissiveIntensity:1.4});materials.push(windowMat);
 const train=new T.Group();train.name='Original_3D_Train';city.add(train);
 let sceneryDay=0,lastScenery=-1;
 function paintCity(time:number,day:number){
  buildingMats.forEach((m,i)=>m.color.lerpColors(new T.Color([0x334965,0x455876,0x566880][i]),new T.Color(0x94a8b8),day));
  windowMat.emissiveIntensity=1.5*(1-day)+.1*day;
  windowMat.color.lerpColors(new T.Color(0xffd7a2),new T.Color(0x8ea9b9),day);
  train.position.x=-12+(time%22)*1.2;train.visible=time%22<19;
 }
 function createCity(){
  // Dedicated deterministic seed preserves the original city's irregular silhouettes.
  let citySeed=83;const cityRandom=()=>{citySeed=(citySeed*1664525+1013904223)>>>0;return citySeed/4294967296};
  for(let i=0;i<40;i++){
   const x=-6+i*1.25,h=1.5+cityRandom()*2.4,z=-6.1-cityRandom()*1.5;
   box([.94,h,.8],[x,h/2+.2,z],buildingMats[i%3],.015,city);
   for(let y=.65;y<h;y+=.5)for(let k=0;k<3;k++)if(cityRandom()>.23)box([.13,.2,.025],[x-.28+k*.27,y,z+.414],windowMat,0,city);
  }
  // Rail and cars are raised a further .30m in world space, together.
  const lift=.50/.57;
  box([18,.13,.4],[1,.95+lift,-5.1],mat(0x526077),.03,city);
  for(let x=-7;x<10;x+=2.2)box([.16,.9+lift,.2],[x,(.9+lift)/2,-5.1],buildingMats[0],.01,city);
  train.position.y=lift;
  for(let i=0;i<3;i++){
   box([1.5,.38,.34],[i*1.57,1.27,-5.1],white,.09,train);
   box([1.28,.045,.355],[i*1.57,1.17,-5.1],blue,.01,train);
   for(let k=0;k<5;k++)box([.16,.15,.014],[i*1.57-.55+k*.25,1.32,-4.918],windowMat,.02,train);
  }
  // Continue the same skyline around the right side, beyond the return window.
  for(let i=0;i<6;i++){
   const x=5.7+(i%2)*1.15,z=-3.7+i*.95,h=1.8+cityRandom()*1.3;
   box([.85,h,.76],[x,h/2+.2,z],buildingMats[i%3],.015,city);
   for(let y=.65;y<h;y+=.45)for(let k=0;k<3;k++)box([.018,.15,.12],[x-.435,y,z-.23+k*.23],windowMat,0,city);
  }
  // Lower foreground buildings expose their roofs through the return window.
  const rooftopStart=new Set(city.children);
  for(let i=0;i<7;i++){
   const x=4.3+(i%3)*.9,z=-3.6+Math.floor(i/3)*1.25+(i%2)*.18,h=1.45+(i%3)*.20;
   box([.73,h,.86],[x,h/2+.2,z],buildingMats[i%3],.015,city);
   box([.80,.055,.93],[x,h+.23,z],mat(0x73818d),.012,city);
   for(const dx of[-.37,.37])box([.025,.10,.91],[x+dx,h+.30,z],buildingMats[1],.004,city);
   box([.19,.14,.24],[x+.1,h+.32,z-.15],mat(0x85929b),.009,city);
   for(let y=.6;y<h;y+=.34)for(let k=0;k<3;k++)box([.018,.12,.13],[x-.375,y,z-.27+k*.25],windowMat,0,city);
  }
  // Raise whole assemblies by 25 cm in world space, preserving roof/window alignment.
  city.children.filter(o=>!rooftopStart.has(o)).forEach(o=>o.position.y+=.25/.57);
  const bark=mat(0x65564a),leaves=[mat(0x375c50),mat(0x496b57),mat(0x617b61)];
  // Tree crowns sit below the eye line and closer than the railway/buildings.
  const tree=(x:number,z:number,h:number,i:number)=>{
   const treeLift=.25/.57;
   cyl(.065,h*.62,[x,h*.31+treeLift,z],bark,city);
   for(let k=0;k<11;k++){
    const angle=k*2.39996,r=k===0?0:.16+(k%3)*.07;
    const crown=mesh(new T.SphereGeometry(.28+(k%3)*.045,16,12),leaves[(i+k)%3],city);
    crown.position.set(x+Math.cos(angle)*r,h*.59+(k%4)*.105+treeLift,z+Math.sin(angle)*r);crown.scale.set(1,.95,1);
   }
  };
  // Keep the full canopy behind the rail corridor (z=-5.1), not in the train path.
  [-1,1,3.3,5.5].forEach((x,i)=>tree(x,-6.35,1.75+(i%2)*.3,i));
  for(let i=0;i<4;i++)tree(5.15,-2.8+i*.85,1.8+(i%2)*.25,i);
  // Align with the return-window sightline from the home camera, not just its world-space z.
  tree(3.25,-4.05,2.15,4);
  // Only render exterior geometry through the two real window apertures.
  // Unlike the old x clipping plane this allows scenery beyond the right wall.
  const maskMaterial=new T.MeshBasicMaterial({colorWrite:false,depthWrite:false,side:T.DoubleSide,stencilWrite:true,stencilRef:1,stencilFunc:T.AlwaysStencilFunc,stencilZPass:T.ReplaceStencilOp});materials.push(maskMaterial);
  for(const [w,p,ry] of [[1.68-sideInset,[2.16-sideInset/2,1.6,-2.06],0],[34/15,[3.06-sideInset,1.6,-13/15],-Math.PI/2]] as [number,V,number][]){
   const mask=mesh(new T.PlaneGeometry(w,1.6),maskMaterial,scene);mask.position.set(...p);mask.rotation.y=ry;mask.renderOrder=1;mask.castShadow=false;mask.receiveShadow=false;
  }
  const copies=new Map<T.Material,T.Material>();
  city.traverse(o=>{if(o instanceof T.Mesh){let original=o.material as T.Material;
   // Shared interior white/blue must not inherit the exterior-only stencil test.
   if(original===white||original===blue){let copy=copies.get(original);if(!copy){copy=original.clone();materials.push(copy);copies.set(original,copy)}o.material=copy;original=copy}
   original.stencilWrite=true;original.stencilRef=1;original.stencilFunc=T.EqualStencilFunc;original.stencilZPass=T.KeepStencilOp;
   o.renderOrder=2;o.castShadow=false;o.receiveShadow=false;
  }});
  paintCity(4,0);
 }
 function createWindow(){
  const g=group('Corner_Window'),length=34/15,center=-2+length/2;
  // Frame and glass sit inside the .10m wall thickness, not on its interior face.
  for(const y of[.8025,2.3775]){box([1.68,.045,.06],[2.16,y,-2.05],white,.004,g);box([.06,.045,length],[3.05,y,center],white,.004,g)}
  for(const x of[1.3425,3.025])box([.045,1.6,.06],[x,1.6,-2.05],white,.004,g);
  box([.06,1.6,.045],[3.05,1.6,-2+length-.0225],white,.004,g);
  const glass=new T.MeshStandardMaterial({color:0xc7e5fa,transparent:true,opacity:.035,roughness:.15,depthWrite:false,side:T.DoubleSide});materials.push(glass);
  for(const [size,pos] of[[[1.59,1.51,.008],[2.16,1.6,-2.05]],[[.008,1.51,length-.09],[3.05,1.6,center]]] as [V,V][]){box(size,pos,glass,0,g).castShadow=false}
  // Raised blinds cover only the top quarter of each opening. Final inset coordinates
  // keep these separate assemblies clear of the window-frame normalization below.
  const blindMaterial=mat(0x94a8b8,.86),cordMaterial=mat(0xc0b49e,.95);
  for(const [name,width,pos,angle] of [
   ['Back_Window_Blind',1.59-sideInset,[2.16-sideInset/2,0,-1.985],0],
   ['Right_Window_Blind',length-.09,[2.985-sideInset,0,center],-Math.PI/2]
  ] as [string,number,V,number][]){
   const blind=group(name,pos);blind.rotation.y=angle;
   const movingSlats:T.Object3D[]=[];let blindAmount=0,blindDown=false;

   box([width,.045,.07],[0,2.345,0],blindMaterial,.006,blind);
   for(let i=0;i<40;i++){
    const slat=box([width-.012,.039,.058],[0,2.307-i*.008,0],blindMaterial,.003,blind);
    slat.rotation.x=.12;movingSlats.push(slat);
   }
   const bottomRail=box([width,.020,.065],[0,1.995,0],blindMaterial,.004,blind);
   for(const x of [-width*.32,width*.32]){
    cyl(.0018,.345,[x,2.17,.023],cordMaterial,blind);
    cyl(.0018,.345,[x,2.17,-.023],cordMaterial,blind);
   }
   const hitMaterial=new T.MeshBasicMaterial({colorWrite:false,depthWrite:false});materials.push(hitMaterial);
   const blindHit=box([width+.12,.48,.16],[0,2.14,.02],hitMaterial,0,blind);
   const threads=blind.children.filter(o=>o instanceof T.Mesh&&o.geometry.type==='CylinderGeometry');
   blind.userData.onActivate=()=>{if(room.userData.editMode)return;blindDown=!blindDown;window.dispatchEvent(new CustomEvent('room-hint',{detail:blindDown?'拉上帘子了':'外面有轻轨驶过，你听'}));playRoomSound('leaves')};
   blind.userData.updateBlind=(dt:number)=>{blindAmount=T.MathUtils.damp(blindAmount,blindDown?1:0,5,dt);const drop=1.15*blindAmount;movingSlats.forEach((o,i)=>o.position.y=2.307-i*(.008+drop/39));bottomRail.position.y=1.995-drop;blindHit.scale.y=(.48+drop)/.48;blindHit.position.y=2.14-drop/2;threads.forEach(o=>{o.scale.y=(.345+drop)/.345;o.position.y=2.17-drop/2})};
   // Short pull loop beside the raised slats, not across the clear view below.
   tube([[width/2-.025,2.32,.04],[width/2-.025,1.94,.04],[width/2-.008,1.92,.04],[width/2+.008,1.94,.04],[width/2+.008,2.32,.04]],.0018,cordMaterial,blind);
  }
  for(const name of ['Back_Window_Blind','Right_Window_Blind']){const blind=room.getObjectByName(name)!;blind.traverse(o=>{if(o instanceof T.Mesh)o.userData.root=blind})}
  const desk=group('L_Desk');
  // Thicken downward, preserving the surface and props; extend to the window frame.
  box([1.6745-sideInset,.09,.62],[2.18275-sideInset/2,.735,-1.71],wood,.012,desk);
  box([.50,.09,length-.6],[2.77-sideInset,.735,-1.4+(length-.6)/2],wood,.012,desk);
  // Back-wall cabinet now reaches the right wall; return beyond it remains open.
  const cabinet=group('Olive_Cabinet',[1.3455,0,-2]);
  const cabinetWidth=1.6545-sideInset;
  box([cabinetWidth,.72,.035],[cabinetWidth/2,.36,.025],wood,.006,cabinet);
  for(const y of[.012,.246,.480,.708])box([cabinetWidth,.024,.6],[cabinetWidth/2,y,.3],wood,.003,cabinet);
  for(const x of[.015,.7155,.9495,1.1835,cabinetWidth-.015])box([.03,.72,.6],[x,.36,.3],wood,.003,cabinet);
  for(let row=0;row<3;row++){
   const y=.129+row*.234;
   const makeDrawer=(x:number,width:number)=>{
    if(row!==2)return cabinet;
    const drawer=new T.Group();drawer.name='Top_Drawer_'+x;cabinet.add(drawer);
    box([width-.018,.014,.48],[x,y-.083,.31],wood,.003,drawer);
    for(const side of [-1,1])box([.012,.155,.48],[x+side*(width/2-.012),y,.31],wood,.003,drawer);
    box([width-.018,.155,.012],[x,y,.075],wood,.003,drawer);
    let opened=false,pendingFocus=false;
    drawer.userData.onActivate=()=>{if(room.userData.editMode)return;opened=!opened;pendingFocus=opened;playRoomSound('pickup')};
    drawer.userData.animateDrawer=(dt:number)=>{drawer.position.z=T.MathUtils.damp(drawer.position.z,opened?.42:0,7,dt);if(pendingFocus&&drawer.position.z>.38){pendingFocus=false;room.userData.focusDrawer?.(drawer,x,y)}};
    drawer.userData.closeDrawer=()=>{opened=false;pendingFocus=false};
    return drawer;
   };
   const longDrawer=makeDrawer(.476-sideInset/2,.892*.75);
   box([.892*.75,.198,.03],[.476-sideInset/2,y,.56],green,.004,longDrawer);
   box([.08,.012,.008],[.476-sideInset/2,y+.075,.580],row===2?wood:black,.003,longDrawer);
   for(let col=0;col<3;col++){const x=1.0395+col*.234-sideInset;

    box([.198,.198,.03],[x,y,.56],green,.004,cabinet);
    const knob=cyl(.018,.004,[x,y,.579],black,cabinet);knob.rotation.x=Math.PI/2;
   }
  }
  for(const drawer of cabinet.children.filter(o=>o.name.startsWith('Top_Drawer_')))drawer.traverse(o=>{o.userData.root=drawer});
 }
 const screenCanvas=document.createElement('canvas');screenCanvas.width=768;screenCanvas.height=480;const screenTexture=new T.CanvasTexture(screenCanvas);screenTexture.colorSpace=T.SRGBColorSpace;textures.push(screenTexture);let slideIndex=0;
 const gameImages=[game0,game1,game2,game3,game4,game5,game6,game7].map(src=>{const img=new Image();img.onload=()=>paintScreen();img.src=src;return img});
 let nextGameSlide=performance.now()+6000;
 function paintScreen(){const c=screenCanvas.getContext('2d')!;c.fillStyle='#000';c.fillRect(0,0,768,480);const img=gameImages[slideIndex];if(img?.naturalWidth){const k=Math.min(768/img.naturalWidth,480/img.naturalHeight);const w=img.naturalWidth*k,h=img.naturalHeight*k;c.drawImage(img,(768-w)/2,(480-h)/2,w,h)}screenTexture.needsUpdate=true;}
 function turnGame(d:number){slideIndex=(slideIndex+d+gameImages.length)%gameImages.length;nextGameSlide=performance.now()+6000;paintScreen()}
 function register(root:T.Object3D,item:Item){root.userData.item=item;root.traverse(o=>{if(o instanceof T.Mesh){o.userData.root=root;pickables.push(o)}})}
 function createLaptop(){const g=new T.Group();g.name='Laptop';g.position.set(2.76,.81,-.38);g.rotation.y=-Math.PI/2;g.scale.setScalar(.42);room.add(g);box([.82,.045,.58],[0,0,0],silver,.025,g);box([.28,.008,.17],[0,.028,.13],mat(0x8d969d),.015,g);for(let row=0;row<4;row++)for(let col=0;col<11;col++)box([.045,.009,.035],[-.32+col*.062,.03,-.18+row*.051],black,.004,g);const lid=new T.Group();lid.position.set(0,.03,-.27);lid.rotation.x=-.15;g.add(lid);box([.82,.54,.035],[0,.27,0],black,.026,lid);const sm=new T.MeshStandardMaterial({map:screenTexture,emissiveMap:screenTexture,emissive:0xffffff,emissiveIntensity:.6,roughness:.8});materials.push(sm);box([.75,.46,.009],[0,.28,.025],sm,.003,lid);register(g,{label:'笔记本电脑',target:new T.Vector3(2.7,.92,-.38),position:new T.Vector3(1.5,1.6,.85)});g.userData.onActivate=(point?:T.Vector3)=>{if(room.userData.editMode)return;if(room.userData.currentFocus!=='笔记本电脑'){room.userData.focusProp?.(g,'笔记本电脑');return}if(point)turnGame(lid.worldToLocal(point.clone()).x<0?-1:1)};paintScreen()}
 function createFrames(){
 // Individual centimetre dimensions and 15/20 cm gaps override conflicting overall labels.
 frame([-.6,2.05,-1.98],.5,.7,0,0);
 sculptedFrame([-.025,2.075,-1.95],1);
 frame([.575,2.075,-1.98],.55,.45,0,2);
 frame([-.65,1.4,-1.98],.25,.3,0,3);
 frame([-.025,1.475,-1.98],.7,.45,0,4);
 frame([.625,1.5,-1.98],.3,.4,0,5);
 frame([-1.12,1.67,-1.98],.3,.4,0,6);
 for(const [id,url] of [[1,art1],[2,art5],[3,art3],[4,centerArtUrl],[5,fields],[6,art7],[7,street]] as const){
  const frame=room.getObjectByName('Memory_Frame_'+id)!;
  const paper=frame.children.find(o=>o instanceof T.Mesh && o.material===white) as T.Mesh<T.BoxGeometry,T.MeshStandardMaterial>;
  const {width,height}=paper.geometry.parameters;
  paper.material=mat((id===1||id===4)?0xc9c9c9:(id===5||id===7)?0x000000:0xffffff);

  const material=mat(0xffffff,.85);
  const picture=mesh(new T.PlaneGeometry(1,1),material,frame);
  picture.position.z=paper.position.z+paper.geometry.parameters.depth/2+.001;
  picture.userData.root=frame;
  picture.visible=false;
  const map=new T.TextureLoader().load(url,texture=>{
   const aspect=texture.image.width/texture.image.height;
   frame.userData.fitArtwork=()=>{
    const frameAspect=width*frame.scale.x/(height*frame.scale.y);
    if(id===1||id===5||id===6||id===7){
     const w=Math.min(width*frame.scale.x,height*frame.scale.y*aspect)*((id===1||id===6)?7/8:1);
     picture.scale.set(w/frame.scale.x,w/aspect/frame.scale.y,1);
    }else{
     const photoScale = id === 4 ? (7/8)**2 : 1;
     picture.scale.set(width * photoScale, height * photoScale, 1);
     texture.repeat.set(Math.min(1,frameAspect/aspect),Math.min(1,aspect/frameAspect));
     texture.offset.set((1-texture.repeat.x)/2,(1-texture.repeat.y)/2);
    }
   };
   frame.userData.fitArtwork();picture.visible=true;
  });
  map.colorSpace=T.SRGBColorSpace;map.anisotropy=renderer.capabilities.getMaxAnisotropy();material.map=map;textures.push(map);
  const original=new T.MeshBasicMaterial({map,toneMapped:false});materials.push(original);
  frame.userData.updatePhotoColor=()=>{picture.material=room.userData.currentFocus===frame.userData.item.label?original:material};
  paper.onBeforeRender=()=>frame.userData.fitArtwork?.();
 }
 const stringMaterial=mat(0x9b815b,.95),photoImage=mat(0xb3b6ac,.9);
 const photoRows=[{y:2.03,zs:[-.66,-.33,0,.33]},{y:1.52,zs:[-.55,-.17,.21]}];
 let photoIndex=8;
 for(const row of photoRows){
  const cord=group('Photo_Cord_'+row.y,[-2.98+sideInset,0,0]);cord.userData.editable=true;cord.userData.label='相纸挂绳 '+(row.y>2?'上排':'下排');
  const cordY=(z:number)=>row.y-.13*(1-Math.pow((z+.175)/.665,2));
  const points=Array.from({length:25},(_,i)=>{const z=-.84+1.33*i/24;return new T.Vector3(.018,cordY(z),z)});
  mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),48,.003,8,false),stringMaterial,cord);
  for(const z of[-.84,.49]){const nail=mesh(new T.SphereGeometry(.012,12,8),silver,cord);nail.position.set(.016,row.y,z);nail.scale.x=.45}
  for(const z of [...row.zs].reverse()){
   const photo=wallPhotos[photoIndex-8],ratio=photo?.ratio||.75;
   const iw=(ratio>=1?.255:.20)*(photoIndex===14?1.18:1),ih=iw/ratio,w=iw+.032,h=ih+.056,y=cordY(z)-h/2;
   const g=group('Memory_Frame_'+(++photoIndex),[-2.98,y,z]);g.rotation.y=Math.PI/2;g.userData.label='白边相纸 '+(photoIndex-8);
   box([w,h,.008],[0,0,0],white,.001,g);
   let imageMaterial=photoImage;
   if(photo){const map=new T.TextureLoader().load(photo.url);map.colorSpace=T.SRGBColorSpace;map.anisotropy=renderer.capabilities.getMaxAnisotropy();textures.push(map);imageMaterial=mat(0xffffff,.85);imageMaterial.map=map}
   const imageMesh=box([iw,ih,.001],[0,.008,.0045],imageMaterial,0,g);imageMesh.userData.photoFace=true;
   g.userData.photoUrl=photo?.url;g.userData.photoWidth=w;g.userData.photoHeight=h;
   box([.025,.065,.018],[0,h/2,.016],wood,.003,g);
   box([.03,.009,.021],[0,h/2,.018],silver,.002,g);
   register(g,{label:'记忆 '+String(photoIndex).padStart(2,'0'),target:g.position.clone(),position:g.position.clone().add(new T.Vector3(1.5,.12,0))});
   g.userData.hangingPhoto=true;
  }
 }
 }
 function sculptedFrame(p:V,i:number){
  const g=group('Memory_Frame_'+(i+1),p);
  // Four inward scallops and a rectangular aperture, not a rectangular substitute.
  const s=new T.Shape();s.moveTo(-.175,.175);s.lineTo(-.055,.175);
  s.bezierCurveTo(-.025,.151,-.015,.135,0,.135);s.bezierCurveTo(.015,.135,.035,.157,.075,.175);
  s.lineTo(.175,.175);s.lineTo(.175,.06);
  s.bezierCurveTo(.12,.005,.12,-.04,.175,-.08);s.lineTo(.175,-.175);s.lineTo(.06,-.175);
  s.bezierCurveTo(.005,-.12,-.025,-.12,-.09,-.175);s.lineTo(-.175,-.175);s.lineTo(-.175,-.03);
  s.bezierCurveTo(-.13,.015,-.13,.07,-.175,.105);s.closePath();
  const hole=new T.Path();hole.moveTo(-.095,-.105);hole.lineTo(.095,-.105);hole.lineTo(.095,.105);hole.lineTo(-.095,.105);hole.closePath();s.holes.push(hole);
  mesh(new T.ExtrudeGeometry(s,{depth:.025,bevelEnabled:true,bevelSize:.002,bevelThickness:.002,bevelSegments:2,curveSegments:24}),edge,g);
  box([.19,.21,.012],[0,0,.003],white,0,g);
  for(const [x,y] of[[0,.151],[-.155,.05],[.155,-.015],[-.025,-.151]]){
   const bead=mesh(new T.SphereGeometry(.014,20,12),edge,g);bead.position.set(x,y,.015);bead.scale.z=.65;
  }
  // Diagonal mitre lines describe the four broad sculpted frame sections.
  for(const [x,y] of[[-1,1],[1,1],[-1,-1],[1,-1]]){
   const a=new T.Vector3(x*.097,y*.107,.028),b=new T.Vector3(x*.173,y*.173,.028);
   mesh(new T.TubeGeometry(new T.LineCurve3(a,b),1,.0009,5,false),wood,g);
  }
  register(g,{label:'记忆 '+String(i+1).padStart(2,'0'),target:g.position.clone(),position:g.position.clone().add(new T.Vector3(0,.12,1.5))});
 }
 function frame(p:V,w:number,h:number,ry:number,i:number){const g=new T.Group();g.name='Memory_Frame_'+(i+1);g.position.set(...p);g.rotation.y=ry;room.add(g);for(const y of[-h/2,h/2])box([w,.015,.055],[0,y,0],edge,.006,g);for(const x of[-w/2,w/2])box([.015,h,.055],[x,0,0],edge,.006,g);box([w-.015,h-.015,.018],[0,0,-.01],white,0,g);const n=new T.Vector3(0,0,1).applyEuler(g.rotation);register(g,{label:'记忆 '+String(i+1).padStart(2,'0'),target:g.position.clone(),position:g.position.clone().add(n.multiplyScalar(1.5)).add(new T.Vector3(0,.12,0))})}
 let disposed=false;
 let pendingFurniture=4;
 renderer.domElement.style.visibility='hidden';
 function furnitureReady(){if(disposed)return;if(--pendingFurniture===0){
  // Prepare the flame shader while the loading screen still covers the room.
  const birthdayCake=room.getObjectByName('Prop_Cake');
  birthdayCake?.userData.setLit(true);
  try{renderer.compile(scene,camera)}finally{birthdayCake?.userData.setLit(false)}
  renderer.render(scene,camera);entranceController=createRoomEntrance(scene,room,camera,renderer,target);
  renderer.domElement.style.visibility='visible';callbacks.onReady()
 }}
 // Retained API compatibility; the room now has only its current sofa.
 function setSofa(_useImported:boolean){}
 function loadSofa(){
  callbacks.onSofaStatus?.('正在加载新沙发…');
  new GLTFLoader().load(sofaUrl,gltf=>{
   const model=gltf.scene;
   const release=()=>model.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();for(const m of(Array.isArray(o.material)?o.material:[o.material])){for(const v of Object.values(m))if(v instanceof T.Texture)v.dispose();m.dispose()}}});
   if(disposed){release();return}
   const wrapper=new T.Group();wrapper.name='Imported_Tripo_Sofa';wrapper.add(model);model.rotation.y=-Math.PI/2;
   model.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3());
   // Fit by width without distorting the supplied model's proportions.
   const scale=2.99*.9/size.x;model.scale.setScalar(scale);model.updateMatrixWorld(true);
   bounds.setFromObject(model);const center=bounds.getCenter(new T.Vector3());
   model.position.set(-center.x,.035-bounds.min.y,-2-bounds.min.z);
   model.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=true;o.receiveShadow=true;meshes.push(o);for(const m of(Array.isArray(o.material)?o.material:[o.material])){materials.push(m);for(const v of Object.values(m))if(v instanceof T.Texture&&!textures.includes(v)){v.anisotropy=renderer.capabilities.getMaxAnisotropy();textures.push(v)}}}});
   if(warmLeatherPalette){
    // Keep the GLB and its embedded materials intact for a reversible finish change.
    const leather=new T.MeshPhysicalMaterial({color:0x78452c,roughness:.43,metalness:0,clearcoat:.12,clearcoatRoughness:.52});
    materials.push(leather);
    model.traverse(o=>{if(o instanceof T.Mesh){o.userData.originalMaterial=o.material;o.material=leather}});
   }
   room.add(wrapper);callbacks.onSofaStatus?.('当前沙发已加载');furnitureReady();
  },undefined,()=>{if(!disposed)callbacks.onSofaStatus?.('沙发加载失败，请刷新重试')});
 }
 function loadFurniture(url:string,name:string,position:V,rotation:number,targetSize:number,axis:'x'|'y',replace?:string,fbx=false){
  // Register the stable transform before asynchronous loading so the editor can restore it.
  const wrapper=group(name,position);wrapper.position.x+=name==='Imported_Window_Chair'?-sideInset:sideInset;
  if(name==='Imported_Round_Desk'){wrapper.userData.editable=true;wrapper.userData.label='独立小圆桌'}
  if(name==='Imported_Window_Chair'){wrapper.userData.editable=true;wrapper.userData.label='转角桌椅子'}
  const loaded=(model:T.Group)=>{
   if(disposed){model.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();for(const m of(Array.isArray(o.material)?o.material:[o.material])){for(const v of Object.values(m))if(v instanceof T.Texture)v.dispose();m.dispose()}}});return}
   model.rotation.y=rotation;model.updateMatrixWorld(true);
   const bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3());model.scale.setScalar(targetSize/size[axis]);
   // Keep imported furniture proportions: one uniform scale on all axes.
   model.updateMatrixWorld(true);bounds.setFromObject(model);
   const center=bounds.getCenter(new T.Vector3());model.position.set(-center.x,.018-bounds.min.y,-center.z);
   if(fbx)model.position.set(-bounds.min.x,.018-bounds.min.y,-bounds.min.z);
   wrapper.add(model);
   if(name==='Imported_Round_Desk'){
    // Measured outer tabletop band in the imported mesh; preserve its top height.
    const topY=.018+size.y*targetSize/size[axis];
    const thickness=(.3994140923-.3662109077)*targetSize/size[axis]*2*(5/3)*.75;
    const cap=cyl(targetSize*.495,thickness,[0,topY-thickness/2-.0005,0],wood,wrapper);
    cap.name='Thickened_Round_Tabletop';
   }
   if(name==='Imported_Round_Desk')model.traverse(o=>{if(o instanceof T.Mesh){for(const m of(Array.isArray(o.material)?o.material:[o.material])){m.onBeforeCompile=(shader:Parameters<T.Material['onBeforeCompile']>[0])=>{shader.uniforms.deskWood={value:grain};shader.uniforms.deskTint={value:wood.color};shader.fragmentShader='uniform sampler2D deskWood; uniform vec3 deskTint;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n#ifdef USE_MAP\nif(diffuseColor.r>diffuseColor.b*1.12){diffuseColor.rgb=texture2D(deskWood,vMapUv).rgb*deskTint;}\n#endif');};m.needsUpdate=true}}});
   model.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=true;o.receiveShadow=true;meshes.push(o);for(const m of(Array.isArray(o.material)?o.material:[o.material])){materials.push(m);for(const v of Object.values(m))if(v instanceof T.Texture&&!textures.includes(v)){v.anisotropy=renderer.capabilities.getMaxAnisotropy();textures.push(v)}}}});
   furnitureReady();
  };
  const failed=(e:unknown)=>{console.error('家具加载失败：'+name,e);if(!disposed)callbacks.onSofaStatus?.('家具加载失败，请刷新重试')};
  if(fbx){
   // Replace all source materials; never fetch the FBX's original textures.
   const manager=new T.LoadingManager();
   const placeholder=new T.Texture();
   const ignoredTextures=new T.TextureLoader(manager);
   ignoredTextures.load=()=>placeholder as T.Texture<HTMLImageElement>;
   manager.addHandler(/\.(jpg|jpeg|png)$/i,ignoredTextures);
   new FBXLoader(manager).load(url,model=>{
    const ribs=canvasTexture(256,64,c=>{
     for(let x=0;x<256;x++){const v=Math.round(128+110*Math.cos(x/256*Math.PI*2*16));c.fillStyle=`rgb(${v},${v},${v})`;c.fillRect(x,0,1,64)}
    });ribs.colorSpace=T.NoColorSpace;ribs.wrapS=ribs.wrapT=T.RepeatWrapping;
    const glass=new T.MeshPhysicalMaterial({name:'Vertical_Reeded_Glass',color:0xe1eeeb,roughness:.22,metalness:0,transmission:.65,thickness:.025,ior:1.45,transparent:true,opacity:.78,side:T.DoubleSide,bumpMap:ribs,bumpScale:.018,depthWrite:false});
    materials.push(glass);
    const oldMaterials=new Set<T.Material>();
    model.traverse(o=>{if(o instanceof T.Mesh){
     const originals=Array.isArray(o.material)?o.material:[o.material];
     const hasGlass=originals.some(m=>m.name.includes('Translucent_Glass_Corrugated'));
     const replacements=originals.map(m=>{oldMaterials.add(m);return m.name==='Wood_Veneer_01'?wood:hasGlass?glass:wood});
     o.material=Array.isArray(o.material)?replacements:replacements[0];
     if(hasGlass){
      // Planar UVs keep the ribs vertical on both perpendicular glass inserts.
      const geo=o.geometry;geo.computeBoundingBox();const b=geo.boundingBox!;
      const axis=b.max.x-b.min.x>b.max.z-b.min.z?'x':'z';
      const p=geo.attributes.position,uv=new Float32Array(p.count*2);
      for(let i=0;i<p.count;i++){const h=axis==='x'?p.getX(i):p.getZ(i);uv[i*2]=(h-b.min[axis])/Math.max(.001,b.max[axis]-b.min[axis]);uv[i*2+1]=(p.getY(i)-b.min.y)/Math.max(.001,b.max.y-b.min.y)}
      geo.setAttribute('uv',new T.BufferAttribute(uv,2));
     }
    }});
    oldMaterials.forEach(m=>m.dispose());placeholder.dispose();
    loaded(model);
   },undefined,failed);
  }else new GLTFLoader().load(url,gltf=>loaded(gltf.scene),undefined,failed);
 }
 createRoom();createFurniture();createCity();createWindow();createLaptop();createFrames();loadSofa();
 loadFurniture(deskUrl,'Imported_Round_Desk',[-2.2,0,.55],0,1,'x','Blue_Round_Table');
 loadFurniture(chairUrl,'Imported_Window_Chair',[2.08,0,-.55],-Math.PI/4,.85,'y');
 loadFurniture(shelfUrl,'Imported_Corner_Shelf',[-2.97,0,-1.97],Math.PI/2,2.3,'y','Corner_Arch_Shelf',true);
 // Exterior skyline is restricted to the window strips and below the roofline.
 const fill=new T.DirectionalLight(0xe0e9ff,.55);fill.position.set(-3,4,5);scene.add(fill);
 const hemi=new T.HemisphereLight(0xc7d9ff,0x8b6343,.65);scene.add(hemi);const key=new T.DirectionalLight(0xffdda6,2.6);key.position.set(-1,7,4);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-9,right:9,top:9,bottom:-9,far:35});key.shadow.normalBias=.035;key.shadow.bias=-.00015;key.shadow.radius=4;scene.add(key);const windowLight=new T.PointLight(0x83afff,35,12,2);windowLight.position.set(2.6,2.1,-2.4);scene.add(windowLight);const inside=new T.PointLight(0xffbc78,25,12,2);inside.position.set(-.6,2.4,-.4);scene.add(inside);
 const floor=mesh(new T.PlaneGeometry(200,200),mat(0x252c3b),scene);floor.rotation.x=-Math.PI/2;floor.position.y=-.245;floor.castShadow=false;
 const presets={night:{bg:0x000000,hemi:.15,key:.35,color:0xffd5a0,point:.3,win:1.5},blue:{bg:0x172940,hemi:.48,key:.35,color:0x9fbfff,point:0,win:13},day:{bg:0xd9e3e8,hemi:1.65,key:2.8,color:0xfff1d7,point:0,win:4}};let mode:Mode='night';const setMode=(m:Mode)=>{mode=m;if(m==='blue')for(const name of ['Sofa_Floor_Lamp','Prop_Lamp']){const lamp=room.getObjectByName(name);if(lamp)lamp.userData.lightOn=false}if(m==='night')for(const name of ['Sofa_Floor_Lamp','Prop_Photo_Spotlight']){const lamp=room.getObjectByName(name);if(lamp)lamp.userData.lightOn=true}};scene.background=new T.Color(presets.night.bg);
 let tween:{time:number;pos:T.Vector3;tar:T.Vector3;to:T.Vector3;at:T.Vector3}|null=null,focused=false;
 const startRotation=new T.Quaternion(),endRotation=new T.Quaternion();
 let moveDuration=900,followTarget=false;
 function move(to:T.Vector3,at:T.Vector3,duration=900,up=new T.Vector3(0,1,0),trackTarget=false){
  followTarget=trackTarget;
  startRotation.copy(camera.quaternion);
  endRotation.setFromRotationMatrix(new T.Matrix4().lookAt(to,at,up));
  camera.up.copy(up);
  moveDuration=duration;controls.enabled=false;tween={time:performance.now(),pos:camera.position.clone(),tar:controls.target.clone(),to,at}}
 function resetView(){room.getObjectByName('Olive_Cabinet')?.children.forEach(o=>o.userData.closeDrawer?.());room.userData.currentFocus=null;room.userData.cancelBirthday?.();focused=false;controls.enableRotate=true;controls.minAzimuthAngle=-.24;controls.maxAzimuthAngle=.24;controls.minPolarAngle=roomMinPolarAngle;controls.maxPolarAngle=roomMaxPolarAngle;controls.minDistance=6;callbacks.onFocus(null);move(home.clone(),target.clone())}
 const ray=new T.Raycaster(),pointer=new T.Vector2();let start=[0,0],dragged=false;const active=new Set<number>();
 function pick(e:PointerEvent){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(room.children,true).find(h=>{let o:T.Object3D|null=h.object;while(o){if(!o.visible)return false;o=o.parent}const m=(h.object as T.Mesh).material as T.Material;return m&&!m.transparent});const root=hit?.object.userData.root as T.Object3D|undefined;if(root&&hit)root.userData.hitPoint=hit.point.clone();return root;}
 function focusItem(label:string,photoOverview=false){
  const root=pickables.map(o=>o.userData.root as T.Object3D).find(o=>(o.userData.item as Item).label===label);if(!root)return;
  const item=root.userData.item as Item;let at=item.target.clone(),to=item.position.clone(),nextLabel=label;
  if(root.userData.hangingPhoto){
   const photos=room.children.filter(o=>o.userData.hangingPhoto);
   const alreadyAtWall=!photoOverview&&(room.userData.currentFocus==='照片墙'||photos.some(photo=>photo.userData.item?.label===room.userData.currentFocus));
   const bounds=new T.Box3();
   for(const photo of alreadyAtWall?[root]:photos){photo.updateWorldMatrix(true,true);bounds.union(new T.Box3().setFromObject(photo))}
   at=bounds.getCenter(new T.Vector3());const size=bounds.getSize(new T.Vector3());
   const distance=Math.max(size.y,size.z/camera.aspect)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*1.35;
   to=at.clone().add(new T.Vector3(Math.max(.55,distance),.03,0));
   if(!alreadyAtWall)nextLabel='照片墙';
  }else if(root.userData.updatePhotoColor){
   const frames=room.children.filter(o=>o.userData.updatePhotoColor);
   const single=!photoOverview&&(room.userData.currentFocus==='沙发照片墙'||frames.some(o=>o.userData.item.label===room.userData.currentFocus));
   const bounds=new T.Box3();for(const frame of single?[root]:frames)bounds.expandByObject(frame);
   at=bounds.getCenter(new T.Vector3());const size=bounds.getSize(new T.Vector3());
   const distance=Math.max(size.y,size.x/camera.aspect)*1.15/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)));
   to=at.clone().add(new T.Vector3(0,.025*distance,distance));if(!single)nextLabel='沙发照片墙';
  }else if(root.name==='Silver_Suitcase'){
   root.updateWorldMatrix(true,true);at=root.localToWorld(new T.Vector3(0,.37,.15));
   const scale=root.getWorldScale(new T.Vector3());const distance=Math.max(.6*scale.y,.52*scale.x/camera.aspect)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*1.3;
   to=at.clone().addScaledVector(new T.Vector3(0,.07,1).normalize().applyQuaternion(root.getWorldQuaternion(new T.Quaternion())),distance);
  }
  room.userData.currentFocus=nextLabel;focused=true;controls.enableRotate=false;controls.minAzimuthAngle=-Infinity;controls.maxAzimuthAngle=Infinity;controls.minPolarAngle=.1;controls.maxPolarAngle=1.55;controls.minDistance=.2;callbacks.onFocus(nextLabel);move(to,at);
 }
 const down=(e:PointerEvent)=>{active.clear();active.add(e.pointerId);start=[e.clientX,e.clientY];dragged=false};const motion=(e:PointerEvent)=>{if(active.size && Math.hypot(e.clientX-start[0],e.clientY-start[1])>6)dragged=true;renderer.domElement.style.cursor=pick(e)?'pointer':'grab'};
 let lampToggleCount=0,lastLampToggle=0,lampsWarning=false;
 const up=(e:PointerEvent)=>{
  active.delete(e.pointerId);if(dragged||e.button!==0)return;
  const root=pick(e);
  if(root&&!room.userData.editMode){if(root.name==='Prop_Display_Cup')playRoomSound('cup');if(root.name==='Prop_Ceramic_Note')playRoomSound('paper')}
  if(root&&!room.userData.editMode){if(root.userData.isSwitchableLamp)playRoomSound('switch');else if(root.name.startsWith('Memory_Frame'))playRoomSound('pickup');else if(root.name==='Laptop')playRoomSound('key');else if(root.name==='Prop_Calendar')playRoomSound('paper');else if(root.name==='Prop_Cup'||root.name==='Prop_Display_Plate'||root.name==='Prop_Village_Cup')playRoomSound('cup')}
  if(root?.userData.isSwitchableLamp&&!room.userData.editMode){root.userData.onActivate();return}lampToggleCount=0;
  const rear=room.children.find(o=>o.userData.updatePhotoColor&&o.userData.item.label===room.userData.currentFocus);
  if(rear&&!root?.userData.updatePhotoColor){focusItem(rear.userData.item.label,true);return}
  if(room.userData.currentFocus==='沙发照片墙'&&!root?.userData.updatePhotoColor){resetView();return}
  const currentPhoto=room.children.find(o=>o.userData.hangingPhoto&&o.userData.item?.label===room.userData.currentFocus);
  // Another hanging photo opens directly; only clicks outside photos step back.
  if(currentPhoto&&root!==currentPhoto&&!root?.userData.hangingPhoto){focusItem(currentPhoto.userData.item.label,true);return}
  if(room.userData.currentFocus==='照片墙'&&!root?.userData.hangingPhoto){resetView();return}
  if(root?.userData.onActivate){root.userData.onActivate(root.userData.hitPoint);return}
  if(root?.userData.item)focusItem(root.userData.item.label);else if(focused)resetView();
 };
 renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',motion);renderer.domElement.addEventListener('pointerup',up);const keydown=(e:KeyboardEvent)=>{if(e.key==='Escape')resetView()};window.addEventListener('keydown',keydown);
 const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.fov=w/h<1?50:35;camera.updateProjectionMatrix();home.set(.35,3.8, w/h<1?13:9.4);if(!focused){camera.position.copy(home);controls.target.copy(target)}};const observer=new ResizeObserver(resize);observer.observe(host);resize();
 const disposeMemoryProps=createMemoryProps(room);
 const disposeIdeasBook=setupIdeasBook(room,host);
 const disposeProps=()=>{disposeIdeasBook();disposeMemoryProps()};
 for(const name of ['Sofa_Floor_Lamp','Prop_Lamp','Prop_Photo_Spotlight']){
  const lamp=room.getObjectByName(name)!;
  lamp.userData.isSwitchableLamp=true;lamp.userData.lightOn=true;
  lamp.userData.onActivate=()=>{if(room.userData.editMode)return;lamp.userData.lightOn=!lamp.userData.lightOn;const now=performance.now();lampToggleCount=now-lastLampToggle<4000?lampToggleCount+1:1;lastLampToggle=now;if(lampToggleCount>=10)lampsWarning=true;const detail=lampsWarning?'要坏了':lamp.name==='Prop_Lamp'?(lamp.userData.lightOn?'等登登~（猫的屁股热热的）':'关掉了'):(lamp.userData.lightOn?'开灯了':'关掉了');window.dispatchEvent(new CustomEvent('room-hint',{detail}))};
  lamp.traverse(o=>{if(o instanceof T.Mesh)o.userData.root=lamp});
 }
 const noteOverlay=document.createElement('div');noteOverlay.className='ceramic-note-overlay';noteOverlay.hidden=true;noteOverlay.setAttribute('role','dialog');noteOverlay.setAttribute('aria-label','手绘瓷纸条');noteOverlay.tabIndex=-1;host.appendChild(noteOverlay);
 noteOverlay.addEventListener('pointerdown',e=>e.stopPropagation());noteOverlay.addEventListener('pointerup',e=>e.stopPropagation());noteOverlay.onclick=e=>{e.stopPropagation();noteOverlay.hidden=true};noteOverlay.onkeydown=e=>{if(e.key==='Escape'||e.key==='Enter'){e.stopPropagation();noteOverlay.hidden=true}};
 room.userData.showCeramicNote=(text:string,url?:string)=>{noteOverlay.replaceChildren();const paper=document.createElement('img');paper.alt=text;paper.src=url||'';paper.className='ceramic-note-image';noteOverlay.appendChild(paper);noteOverlay.hidden=false;noteOverlay.focus();room.userData.easterAction?.('note')};
 room.userData.focusDrawer=(drawer:T.Object3D,x:number,y:number)=>{
  room.userData.cancelBirthday?.();drawer.parent!.updateWorldMatrix(true,false);
  const at=drawer.parent!.localToWorld(new T.Vector3(x,y,.78));
  focused=true;room.userData.currentFocus='第一层抽屉';callbacks.onFocus('第一层抽屉');controls.enableRotate=false;controls.minAzimuthAngle=-Infinity;controls.maxAzimuthAngle=Infinity;controls.minPolarAngle=.05;controls.maxPolarAngle=1.55;controls.minDistance=.15;
  move(at.clone().add(new T.Vector3(0,1.08,.38)),at,1100);
 };
 room.userData.focusProp=(prop:T.Object3D,label:string)=>{if(room.userData.editMode)return;room.userData.cancelBirthday?.();prop.updateWorldMatrix(true,true);const at=new T.Box3().setFromObject(prop).getCenter(new T.Vector3());const isNotebook=label==='小本子'||label==='黄色作业本';if(label==='黄色作业本')at.copy(prop.localToWorld(new T.Vector3(0,.006,-.073125)));if(label==='小本子')at.copy(prop.localToWorld(new T.Vector3(-.075,.006,0)));const direction=isNotebook?new T.Vector3(0,1,.08).applyQuaternion(prop.getWorldQuaternion(new T.Quaternion())):(prop.userData.focusDirection?.clone()??new T.Vector3(0,.30,1)).applyQuaternion(prop.getWorldQuaternion(new T.Quaternion()));focused=true;room.userData.currentFocus=label;callbacks.onFocus(label);controls.enableRotate=false;controls.minAzimuthAngle=-Infinity;controls.maxAzimuthAngle=Infinity;controls.minPolarAngle=.05;controls.maxPolarAngle=1.55;controls.minDistance=.1;move(at.clone().addScaledVector(direction.normalize(),isNotebook?Math.max((label==='黄色作业本'?.31:.224)*prop.getWorldScale(new T.Vector3()).z,.32*prop.getWorldScale(new T.Vector3()).x/camera.aspect)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*1.08:(prop.userData.focusDistance??1.05)),at,1200,isNotebook?new T.Vector3(0,0,-1).applyQuaternion(prop.getWorldQuaternion(new T.Quaternion())):undefined)};
 const editableLaptop=room.getObjectByName('Laptop')!;editableLaptop.userData.editable=true;editableLaptop.userData.label='桌上电脑';
 // Move side-wall assemblies without scaling furniture or changing the central layout.
 const leftNames=['Corner_Arch_Shelf','Blue_Round_Table','Silver_Suitcase','Prop_Vase','Prop_Calendar'];
 const rightNames=['Laptop','Prop_Cat','Prop_Lamp','Prop_Monstera'];
 for(const o of room.children){
  const dx=leftNames.includes(o.name)||(o.name.startsWith('Memory_Frame_')&&Math.abs(o.rotation.y)>1)?sideInset:rightNames.includes(o.name)?-sideInset:0;
  if(dx){o.position.x+=dx;o.userData.roomInsetOffset=dx;const item=o.userData.item;if(item){item.target.x+=dx;item.position.x+=dx}}
 }
 const windowGroup=room.getObjectByName('Corner_Window')!;
 for(const o of windowGroup.children){
  if(o.position.x>3)o.position.x-=sideInset;
  else if(o.position.x>2){o.position.x-=sideInset/2;if(o instanceof T.Mesh){o.geometry.computeBoundingBox();const width=o.geometry.boundingBox!.max.x-o.geometry.boundingBox!.min.x;if(width>1)o.scale.x=(width-sideInset)/width}}
 }
 const calendar=room.getObjectByName('Prop_Calendar')!;
 room.userData.onCalendar=()=>{
  if(room.userData.editMode)return;
  room.userData.cancelBirthday?.();room.userData.currentFocus='台历';focused=true;callbacks.onFocus('台历');
  controls.enableRotate=false;controls.minAzimuthAngle=-Infinity;controls.maxAzimuthAngle=Infinity;controls.minPolarAngle=.05;controls.maxPolarAngle=1.55;controls.minDistance=.1;
  calendar.updateWorldMatrix(true,true);
  const at=calendar.localToWorld(new T.Vector3(0,.13,.02));
  const distance=Math.max(.23*calendar.scale.x/camera.aspect,.30*calendar.scale.y)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*1.3;
  const direction=new T.Vector3(0,.34,1).normalize().applyQuaternion(calendar.getWorldQuaternion(new T.Quaternion()));
  move(at.clone().addScaledVector(direction,distance),at,1200);
 };
 const cat=room.getObjectByName('Prop_Cat')!;
 room.userData.onCat=()=>{
  if(room.userData.editMode)return;
  room.userData.cancelBirthday?.();room.userData.currentFocus='朝朝';focused=true;callbacks.onFocus('朝朝');
  controls.enableRotate=false;controls.minAzimuthAngle=-Infinity;controls.maxAzimuthAngle=Infinity;controls.minPolarAngle=.05;controls.maxPolarAngle=1.55;controls.minDistance=.2;
  cat.updateWorldMatrix(true,true);
  const at=cat.localToWorld(new T.Vector3(-.055,.13,.04));
  const distance=Math.max(.66*cat.scale.x/camera.aspect,.36*cat.scale.y)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*1.85;
  const direction=new T.Vector3(0,.28,1).normalize().applyQuaternion(cat.getWorldQuaternion(new T.Quaternion()));
  move(at.clone().addScaledVector(direction,distance),at,1500);
 };
 const journal=room.getObjectByName('Prop_Journal')!;
 const journalController=setupJournal(journal,room,()=>{room.userData.currentFocus='日记本';focused=true;callbacks.onFocus('日记本');controls.enableRotate=false;controls.minAzimuthAngle=-Infinity;controls.maxAzimuthAngle=Infinity;controls.minPolarAngle=.001;controls.maxPolarAngle=Math.PI;controls.minDistance=.12;journal.updateWorldMatrix(true,false);const q=journal.getWorldQuaternion(new T.Quaternion()),scale=journal.getWorldScale(new T.Vector3());const pageUp=new T.Vector3(0,0,-1).applyQuaternion(q);const at=journal.localToWorld(new T.Vector3(-.21,.09,0));const distance=Math.max(.56*scale.z,.86*scale.x/camera.aspect)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*1.05;move(at.clone().addScaledVector(new T.Vector3(0,1,0).applyQuaternion(q),distance),at,1200,pageUp,true)});
 const suitcase=room.getObjectByName('Silver_Suitcase')!;suitcase.updateWorldMatrix(true,true);
 const suitcaseAt=suitcase.localToWorld(new T.Vector3(0,.37,.15));
 register(suitcase,{label:'旅行行李箱',target:suitcaseAt,position:suitcaseAt.clone().add(new T.Vector3(0,.08,1.2).applyQuaternion(suitcase.quaternion))});
 const interactions=createSceneInteractions(host,room,camera,renderer.domElement);
 room.getObjectByName('Laptop')!.scale.multiplyScalar(1.2);
 let birthday:'idle'|'lit'|'dark'|'returning'|'relighting'='idle',birthdayTime=0,birthdayLetterShown=false;
 const cake=room.getObjectByName('Prop_Cake')!;
 room.userData.cancelBirthday=()=>{window.dispatchEvent(new CustomEvent('room-music',{detail:'ambient'}));renderer.domElement.style.filter='';birthdayLetterShown=false;birthday='idle';cake.userData.setLit(false);callbacks.onFocus(null)};
 room.userData.onCake=(isCandle:boolean)=>{
  playRoomSound(birthday==='lit'&&isCandle?'blow':'ignite');
  if(birthday==='lit'&&isCandle){room.userData.easterAction?.('candle');birthday='dark';birthdayTime=performance.now();cake.userData.setLit(false);callbacks.onFocus(null);tween=null;controls.enabled=false;return}
  if(birthday!=='idle')return;
  window.dispatchEvent(new CustomEvent('room-music',{detail:'birthday'}));birthdayLetterShown=false;birthday='lit';cake.userData.setLit(true);room.userData.currentFocus='生日蛋糕';callbacks.onFocus('生日蛋糕');
  const at=cake.localToWorld(new T.Vector3(0,.24,0));focused=true;controls.enableRotate=false;controls.minAzimuthAngle=-Infinity;controls.maxAzimuthAngle=Infinity;controls.minPolarAngle=.1;controls.maxPolarAngle=1.55;controls.minDistance=.4;move(at.clone().add(new T.Vector3(.12,.65,1.5)),at,2000);
 };
 const disposeEditor=createFrameEditor(host,room,camera,renderer.domElement,enabled=>{room.userData.editMode=enabled;resetView();tween=null;camera.position.copy(home);controls.target.copy(target);controls.update();controls.enabled=!enabled});
 // Enlarge the complete hanging-photo arrangement around its shared wall center.
 for(const o of room.children){if(o.name.startsWith('Photo_Cord_')||(o.name.startsWith('Memory_Frame_')&&Number(o.name.slice(13))>=9)){const item=o.userData.item;if(item){item.target.copy(o.position);item.position.copy(o.position).add(new T.Vector3(1.5,.12,0))}}}
 const disposeFrameEditor=()=>{sound.dispose();journalController.dispose();interactions.dispose();disposeEditor();disposeProps();noteOverlay.remove();delete room.userData.focusProp;delete room.userData.showCeramicNote;delete room.userData.onCake;delete room.userData.onCat;delete room.userData.onCalendar;delete room.userData.cancelBirthday};
 const rearFrames=room.children.filter(o=>o.userData.updatePhotoColor);
 const clock=new T.Clock();let raf=0,elapsed=0;function animate(){raf=requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);elapsed+=dt;for(const f of rearFrames)f.userData.updatePhotoColor();if(performance.now()>nextGameSlide&&!document.hidden)turnGame(1);const a=1-Math.exp(-dt*3),p=presets[mode];(scene.background as T.Color).lerp(new T.Color(p.bg),a);(floor.material as T.MeshStandardMaterial).color.lerp(new T.Color(p.bg),a);hemi.intensity=T.MathUtils.lerp(hemi.intensity,p.hemi,a);key.intensity=T.MathUtils.lerp(key.intensity,p.key,a);key.color.lerp(new T.Color(p.color),a);inside.intensity=T.MathUtils.lerp(inside.intensity,p.point,a);windowLight.intensity=T.MathUtils.lerp(windowLight.intensity,p.win,a);sceneryDay=T.MathUtils.lerp(sceneryDay,mode==='day'?1:0,a);if(elapsed-lastScenery>1/60){paintCity(elapsed+4,sceneryDay);lastScenery=elapsed;}
  key.position.lerp(mode==='day'?new T.Vector3(4,6,-4):new T.Vector3(-1,5,3),a);
  room.getObjectByName('Olive_Cabinet')?.children.forEach(o=>o.userData.animateDrawer?.(dt));
  room.userData.updateEasterStickers?.(elapsed);
  if(room.userData.finalePending && birthday==='idle' && !Array.from(document.querySelectorAll('.ideas-overlay,.ceramic-note-overlay,[data-reading-hint],.photo-detail-open')).some(el=>el.getClientRects().length>0)){room.userData.finalePending=false;resetView();room.userData.finaleStarted=true}
  if(room.userData.finaleStarted)room.userData.runFinale(elapsed);
  for(const name of ['Back_Window_Blind','Right_Window_Blind'])room.getObjectByName(name)?.userData.updateBlind?.(dt);
  journalController.update();interactions.update();cake.userData.animateFlames(elapsed);cat.userData.animateCat(elapsed);calendar.userData.animateCalendar();room.getObjectByName('Prop_Pocket_Notebook')?.userData.update?.();room.getObjectByName('Prop_Yellow_Notebook')?.userData.update?.();
  room.getObjectByName('Prop_Cup')?.userData.animateSteam?.();room.getObjectByName('Prop_Monstera')?.userData.animateLeaves?.();
  const now=performance.now();
  if(birthday==='dark'&&now-birthdayTime>250&&!birthdayLetterShown){birthday='returning';move(home.clone(),target.clone(),1800)}
  if(birthday==='returning'&&!tween){birthday='dark';birthdayLetterShown=true;room.userData.showLetter?.(()=>{if(birthday!=='dark')return;window.dispatchEvent(new CustomEvent('room-music',{detail:'ambient'}));birthday='relighting';birthdayTime=performance.now();focused=false;room.userData.currentFocus=null;controls.enableRotate=true;controls.minAzimuthAngle=-.24;controls.maxAzimuthAngle=.24;controls.minPolarAngle=roomMinPolarAngle;controls.maxPolarAngle=roomMaxPolarAngle;controls.minDistance=6;controls.enabled=true})}
  renderer.domElement.style.filter='';
  if(birthday==='lit'){key.intensity=0;hemi.intensity=0;inside.intensity=0;windowLight.intensity=0;fill.intensity=0}
  else{key.intensity=p.key;hemi.intensity=p.hemi;inside.intensity=p.point;windowLight.intensity=p.win;fill.intensity=mode==='night'?.15:.55}
  const practicalLevel=(birthday==='lit'||birthday==='dark'||birthday==='returning')?0:birthday==='relighting'?Math.min(1,(now-birthdayTime)/2200):1;
  for(const name of ['Prop_Lamp','Prop_Photo_Spotlight','Sofa_Floor_Lamp']){
   const lamp=room.getObjectByName(name);
   lamp?.userData.setRoomLight?.(practicalLevel*(mode==='day'?.35:1)*(lamp.userData.lightOn?1:0));
  }
  if(tween){const t=Math.min(1,(performance.now()-tween.time)/moveDuration),s=t*t*(3-2*t);controls.target.lerpVectors(tween.tar,tween.at,s);
   camera.quaternion.slerpQuaternions(startRotation,endRotation,s);
   if(followTarget){
    const startDistance=tween.pos.distanceTo(tween.tar),endDistance=tween.to.distanceTo(tween.at);
    const distance=startDistance*Math.pow(endDistance/startDistance,s);
    camera.position.set(0,0,distance).applyQuaternion(camera.quaternion).add(controls.target);
   }else camera.position.lerpVectors(tween.pos,tween.to,s);
   if(t===1){tween=null;controls.enabled=true}}else if(controls.enabled){
   // At the lowest room view, the camera is level with the wall caps.
   // Recalculate with zoom so the three wall tops never rise above eye level.
   const limitRoomAngle=()=>{
    const distance=camera.position.distanceTo(controls.target);
    controls.maxPolarAngle=Math.max(roomMinPolarAngle,Math.acos(T.MathUtils.clamp((2.72-controls.target.y)/distance,-1,1)));
   };
   if(!focused)limitRoomAngle();
   controls.update();
   if(!focused&&camera.position.y<2.72-.0001){limitRoomAngle();controls.update()}
  }
  const allLampsOff=['Prop_Lamp','Prop_Photo_Spotlight','Sofa_Floor_Lamp'].every(name=>room.getObjectByName(name)?.userData.lightOn===false);
  const blackout=(mode==='night'&&allLampsOff&&birthday==='idle')||birthday==='dark'||birthday==='returning';
  sound.update(elapsed,blackout,focused);
  cat.userData.setEyesGlow?.(blackout);
  if(blackout||birthday==='relighting'){
   // Keep the actual surfaces and faint window/ambient illumination visible.
   const exposure=renderer.toneMappingExposure;
   const dimExposure=mode==='day'?.10:mode==='blue'?.20:.32;
   const fade=birthday==='relighting'?T.MathUtils.smoothstep(now-birthdayTime,0,2200):0;
   renderer.toneMappingExposure=T.MathUtils.lerp(dimExposure,exposure,fade);
   renderer.render(scene,entranceView());
   renderer.toneMappingExposure=exposure;
   if(birthday==='relighting'&&now-birthdayTime>=2200)birthday='idle';
  }else renderer.render(scene,entranceView());
 }animate();
 function jumpToItem(label:string){
  if(room.userData.editMode)return;
  room.userData.cancelBirthday?.();
  if(label==='朝朝'){room.userData.onCat?.();return}
  if(label==='台历'){room.userData.onCalendar?.();return}
  if(label==='日记本'){room.userData.currentFocus=null;journal.userData.onActivate?.();return}
  const propName=label==='花束'?'Prop_Vase':label==='生日蛋糕'?'Prop_Cake':null;
  if(propName){const prop=room.getObjectByName(propName)!;prop.updateWorldMatrix(true,true);const bounds=new T.Box3().setFromObject(prop),at=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3());const distance=Math.max(size.y,size.x/camera.aspect)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*1.5;focused=true;room.userData.currentFocus=label;callbacks.onFocus(label);controls.enableRotate=false;controls.minAzimuthAngle=-Infinity;controls.maxAzimuthAngle=Infinity;controls.minPolarAngle=.05;controls.maxPolarAngle=1.55;controls.minDistance=.1;move(at.clone().add(new T.Vector3(0,.35,1).normalize().multiplyScalar(distance)),at,1200);return}
  focusItem(label);
 }
 return {resetView,setMode,focusItem:jumpToItem,setSofa,nextSlide(d:number){turnGame(d)},dispose(){entranceController?.dispose();disposeFrameEditor();disposed=true;cancelAnimationFrame(raf);observer.disconnect();window.removeEventListener('keydown',keydown);renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointermove',motion);renderer.domElement.removeEventListener('pointerup',up);controls.dispose();meshes.forEach(o=>o.geometry.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove()}};
}
