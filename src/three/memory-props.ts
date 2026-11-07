import {birthdayLetter} from './birthday-letter';

import {flashRoomHint} from '../lib/room-hints';
import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {playRoomSound} from '../lib/prototype-sound';
import {setupEasterStickers} from './easter-stickers';
import {setupCoursework} from './coursework';
import {setupYellowNotebook} from './yellow-notebook';
import {setupShelfReading,shelfColors} from './shelf-reading';
import {setupPosterScreen} from './poster-screen';
import plateUrl from '../assets/display-plate.jpg';
import cupUrl from '../assets/cup-wrap.png';
import {createCeramicNote} from './ceramic-note';

export function createMemoryProps(room:T.Group){
 const geometries:T.BufferGeometry[]=[],materials:T.Material[]=[],textures:T.Texture[]=[];
 const mat=(color:number,roughness=.5)=>{const m=new T.MeshStandardMaterial({color,roughness});materials.push(m);return m};
 const ivory=mat(0xfff4dc),pink=mat(0xe9a5b1),green=mat(0x59763d),brown=mat(0x766251),dark=mat(0x302923),gold=mat(0xcba454,.3),yellow=mat(0xf2bc08,.22),blue=mat(0x9abbd3);
 const mesh=(g:T.BufferGeometry,m:T.Material,p:T.Object3D,pos=[0,0,0])=>{geometries.push(g);const o=new T.Mesh(g,m);o.position.set(...pos as [number,number,number]);o.castShadow=true;o.receiveShadow=true;p.add(o);return o};
 const ball=(p:T.Object3D,pos:number[],s:number[],m:T.Material)=>{const o=mesh(new T.SphereGeometry(1,24,16),m,p,pos);o.scale.set(...s as [number,number,number]);return o};
 const cyl=(p:T.Object3D,r:number,h:number,y:number,m:T.Material)=>mesh(new T.CylinderGeometry(r,r,h,48),m,p,[0,y,0]);
 const tube=(p:T.Object3D,points:number[][],r:number,m:T.Material)=>mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(a=>new T.Vector3(...a as [number,number,number]))),32,r,8,false),m,p);
 const group=(name:string,label:string,pos:number[])=>{const g=new T.Group();g.name=name;g.userData.editable=true;g.userData.label=label;g.position.set(...pos as [number,number,number]);room.add(g);return g};
 const texture=(draw:(c:CanvasRenderingContext2D)=>void)=>{const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;draw(canvas.getContext('2d')!);const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;textures.push(t);return t};
 const surface=(map:T.Texture)=>{const m=new T.MeshStandardMaterial({map,roughness:.35,side:T.DoubleSide});materials.push(m);return m};

 const envelope=group('Prop_Envelope','信封',[.42,.414,.59]);envelope.rotation.y=-.22;
 const envelopeMap=texture(c=>{c.fillStyle='#eee2cb';c.fillRect(0,0,512,512);c.fillStyle='#e0ceb0';c.beginPath();c.moveTo(0,0);c.lineTo(256,300);c.lineTo(512,0);c.closePath();c.fill();c.strokeStyle='#8f7658';c.lineWidth=9;c.beginPath();c.moveTo(0,0);c.lineTo(256,290);c.lineTo(512,0);c.moveTo(0,512);c.lineTo(180,275);c.moveTo(512,512);c.lineTo(332,275);c.stroke()});
 mesh(new T.BoxGeometry(.23,.005,.15),ivory,envelope);
 const envelopeTop=mesh(new T.PlaneGeometry(.23,.15),surface(envelopeMap),envelope,[0,.0026,0]);envelopeTop.rotation.x=-Math.PI/2;
 const letter=birthdayLetter();let unlocked=false;
 room.userData.showLetter=(done?:()=>void)=>{unlocked=true;playRoomSound('paper');letter.show(done)};
 envelope.userData.onActivate=()=>{if(unlocked&&!room.userData.editMode)room.userData.showLetter()};envelope.traverse(o=>{if(o instanceof T.Mesh)o.userData.root=envelope});
 const vase=group('Prop_Vase','插花花瓶',[-2.34,.81,.5]);
 const floral=texture(c=>{c.fillStyle='#f3ead6';c.fillRect(0,0,512,512);for(let k=0;k<9;k++){const x=(k*137)%480+16,y=(k*193)%440+35;c.strokeStyle='#6b8352';c.lineWidth=3;c.beginPath();c.moveTo(x,y+65);c.quadraticCurveTo(x-24,y+20,x,y);c.stroke();for(let j=0;j<5;j++){c.fillStyle=j%2?'#c48a92':'#dfaab0';c.beginPath();c.ellipse(x+Math.cos(j*1.26)*12,y+Math.sin(j*1.26)*12,13,10,j,0,7);c.fill()}c.fillStyle='#7b905b';c.beginPath();c.ellipse(x-13,y+40,14,5,-.5,0,7);c.fill()}});
 mesh(new T.LatheGeometry([[.09,0],[.095,.02],[.095,.28],[.08,.33],[.06,.35],[.06,.38],[.08,.39]].map(p=>new T.Vector2(...p as [number,number])),48),surface(floral),vase);
 for(let i=0;i<9;i++){const a=i*2.4,x=Math.cos(a)*.15,z=Math.sin(a)*.12,h=.62+(i%3)*.075;tube(vase,[[0,.25,0],[x*.5,.5,z*.5],[x,h,z]],.005,green);for(let j=0;j<4;j++){const y=h-j*.065;const flower=new T.Group();flower.position.set(x,y,z);vase.add(flower);for(let p=0;p<5;p++){const t=p*Math.PI*2/5;ball(flower,[Math.cos(t)*.025,Math.sin(t)*.02,0],[.025,.021,.012],i%3===0?mat(0xd9c5e6):ivory)}ball(flower,[0,0,.009],[.009,.009,.01],green)}ball(vase,[x*.6,.46,z*.6],[.025,.08,.008],green).rotation.z=a}
 // All bouquets share a pivot at the vase mouth; the vase itself never animates.
 const bouquets:T.Group[]=[];
 const original=new T.Group();original.name='原有花束';original.position.y=.38;
 const oldFlowers=vase.children.slice(1);vase.add(original);
 oldFlowers.forEach(o=>{original.add(o);o.position.y-=.38});bouquets.push(original);
 const creamFlower=mat(0xfffdf0),purple=mat(0xb897cb),palePurple=mat(0xd9bddf),flowerCenter=mat(0xc4bb49);
 function bouquet(name:string){const g=new T.Group();g.name=name;g.position.y=.38;g.visible=false;vase.add(g);bouquets.push(g);return g}
 function stem(g:T.Group,x:number,y:number,z:number){tube(g,[[0,-.12,0],[x*.45,y*.45,z*.45],[x,y,z]],.004,green);const leaf=ball(g,[x*.5,y*.45,z*.5],[.022,.055,.006],green);leaf.rotation.z=x>0?-.5:.5}
 const bells=bouquet('白色风铃草');
 tube(bells,[[0,-.12,0],[.04,.12,0],[.17,.34,.01],[.28,.59,.02]],.005,green);
 for(let j=0;j<7;j++){
   const h=.10+j*.075,x=.02+j*.038,side=j%2?1:-1;
   tube(bells,[[x,h,0],[x+side*.035,h+.025,.01],[x+side*.05,h+.035,.02]],.003,green);
   const leaf=ball(bells,[x-side*.02,h,.005],[.016,.043,.005],green);leaf.rotation.z=side*.6;
   const flower=new T.Group();flower.position.set(x+side*.05,h+.035,.02);flower.rotation.z=-.25+side*.25;bells.add(flower);
   const bell=mesh(new T.LatheGeometry([[.007,0],[.018,.012],[.021,.045],[.033,.06]].map(p=>new T.Vector2(...p as [number,number])),24),creamFlower,flower);
   (bell.material as T.MeshStandardMaterial).side=T.DoubleSide;
   for(let k=0;k<5;k++){const t=k*Math.PI*2/5;ball(flower,[Math.cos(t)*.027,.06,Math.sin(t)*.027],[.017,.007,.017],creamFlower)}
   ball(flower,[0,.022,0],[.008,.006,.008],flowerCenter);
 }
 const mixed=bouquet('白色雏菊与紫色球菊');
 for(let i=0;i<9;i++){
  const a=i*2.4,x=Math.cos(a)*.15,z=Math.sin(a)*.10,h=i<5?.14+(i%3)*.085:.42+(i%2)*.075;stem(mixed,x,h,z);
  const head=new T.Group();head.position.set(x,h,z);head.rotation.x=.35;head.rotation.z=x;mixed.add(head);
  if(i<5){for(let k=0;k<20;k++){const t=k*Math.PI*2/20;const petal=ball(head,[Math.cos(t)*.045,0,Math.sin(t)*.045],[.041,.008,.012],creamFlower);petal.rotation.y=-t;petal.rotation.z=.18*Math.sin(t)}ball(head,[0,.006,0],[.02,.012,.02],flowerCenter)}
  else{for(let k=0;k<65;k++){const y=1-2*(k+.5)/65,r=Math.sqrt(1-y*y),t=k*2.39996;const p=ball(head,[Math.cos(t)*r*.047,y*.04,Math.sin(t)*r*.047],[.012,.012,.012],k%3?purple:palePurple);p.scale.y*=1.3}}
 }
 for(let i=0;i<3;i++){const x=-.17-i*.025;stem(mixed,x,.48+i*.055,-.035);for(let j=0;j<9;j++){const y=.13+j*.04;const end=x-.025*(j%2?1:-1);tube(mixed,[[x,y,0],[end,y+.025,.015]],.0015,green);ball(mixed,[end,y+.025,.015],[.006,.009,.006],flowerCenter)}}

 // Upright gladiolus spikes, with ruffled ivory trumpets and blush throats.
 const gladiolus=bouquet('白色剑兰');
 const petalWhite=mat(0xf5f2e6,.86),throatPink=mat(0xe7b3ad,.9),budGreen=mat(0x829767,.9);
 petalWhite.side=T.DoubleSide;throatPink.side=T.DoubleSide;
 for(let n=0;n<5;n++){
  const x=(n-2)*.065,z=(n%2)*.055-.025,h=.67+(n%3)*.065;
  tube(gladiolus,[[x*.2,-.12,z*.2],[x*.7,.25,z],[x,h,z]],.0055,green);
  const leafShape=new T.Shape();leafShape.moveTo(0,0);leafShape.quadraticCurveTo(-.026,.2,-.055,.46);leafShape.quadraticCurveTo(.023,.25,.013,0);
  const blade=mesh(new T.ShapeGeometry(leafShape,12),budGreen,gladiolus,[x*.4,-.08,z]);blade.rotation.y=n*1.5;blade.material.side=T.DoubleSide;
  for(let j=0;j<5;j++){
   const y=.16+j*.092,side=j%2?1:-1;
   const bloom=new T.Group();bloom.position.set(x+side*.024,y,z+.025);bloom.rotation.set(-.25,side*.38,side*.2);gladiolus.add(bloom);
   for(let k=0;k<6;k++){
    const g=new T.PlaneGeometry(1,1,8,10),a=g.attributes.position;
    for(let v=0;v<a.count;v++){const u=a.getX(v)*2,t=a.getY(v)+.5;const width=Math.sin(t*Math.PI*.82)*.033;const ripple=Math.sin(u*15+k)*.0035*Math.pow(t,3);a.setXYZ(v,u*width,.012+t*.066,.012+t*t*.038+ripple)}
    g.computeVertexNormals();const petal=mesh(g,petalWhite,bloom);petal.rotation.z=k*Math.PI/3;
   }
   const center=ball(bloom,[0,.005,.015],[.016,.021,.009],throatPink);
   for(let q=0;q<3;q++)tube(bloom,[[q*.004-.004,0,.018],[q*.004-.004,.025,.035]],.0012,ivory);
  }
  for(let j=0;j<3;j++){const bud=ball(gladiolus,[x,.64+j*.047+(h-.72),z],[.013-j*.002,.038-j*.006,.012-j*.002],budGreen);bud.rotation.z=-.18}
 }
 // Batch the petals so the added bouquet does not add a draw call per petal.
 gladiolus.updateMatrixWorld(true);const petalParts:T.BufferGeometry[]=[];const inverse=new T.Matrix4().copy(gladiolus.matrixWorld).invert();const oldPetals:T.Mesh[]=[];
 gladiolus.traverse(o=>{if(o instanceof T.Mesh&&o.material===petalWhite){petalParts.push(o.geometry.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld)));oldPetals.push(o)}});
 mesh(mergeGeometries(petalParts)!,petalWhite,gladiolus);oldPetals.forEach(o=>o.removeFromParent());petalParts.forEach(g=>g.dispose());
 const gladiolusContent=new T.Group();for(const child of [...gladiolus.children])gladiolusContent.add(child);gladiolus.add(gladiolusContent);gladiolusContent.scale.setScalar(.8);
 let current=0,transition=0,switched=false,flowerRaf=0;
 function changeFlowers(){if(transition||room.userData.editMode)return;transition=performance.now();switched=false;flowerRaf=requestAnimationFrame(animateFlowers)}
 function animateFlowers(now:number){
  const t=(now-transition)/1000;
  if(t<.24){const p=t/.24;bouquets[current].scale.set(1+.18*Math.sin(p*Math.PI),Math.max(.001,1-p*p),1+.18*Math.sin(p*Math.PI))}
  else{
   if(!switched){bouquets[current].visible=false;bouquets[current].scale.setScalar(1);current=(current+1)%bouquets.length;bouquets[current].visible=true;flashRoomHint(['好娇贵的紫罗兰','风铃草斜插一支也很美','小菊花一活就是一个月','cyj寄来的剑兰'][current]);switched=true}
   const p=Math.min(1,(t-.24)/.72),s=p===1?1:1-Math.exp(-7*p)*Math.cos(12*p);
   bouquets[current].scale.set(1-.12*Math.sin(p*Math.PI),Math.max(.001,s),1-.12*Math.sin(p*Math.PI));
   if(p===1){bouquets[current].scale.setScalar(1);transition=0;if(current===0)room.userData.easterAction?.('flowers');return}
  }
  flowerRaf=requestAnimationFrame(animateFlowers);
 }
 vase.userData.onActivate=changeFlowers;vase.traverse(o=>{if(o instanceof T.Mesh)o.userData.root=vase});
 vase.userData.onActivate=changeFlowers;vase.traverse(o=>{if(o instanceof T.Mesh)o.userData.root=vase});
 bouquets.forEach(g=>{g.userData.onActivate=changeFlowers;g.traverse(o=>{if(o instanceof T.Mesh)o.userData.root=g})});
 const cal=group('Prop_Calendar','11月7日台历',[-1.98,.81,.65]);
 for(const sign of [-1,1]){const b=mesh(new T.BoxGeometry(.15,.21,.008),gold,cal,[0,.1,sign*.033]);b.rotation.x=-sign*.32}
 const calendarDates=[7,8].map(day=>texture(c=>{c.fillStyle='#fffdf5';c.fillRect(0,0,512,512);c.textAlign='center';c.fillStyle='#785d39';c.font='40px sans-serif';c.fillText('NOVEMBER',256,115);c.font='bold 160px sans-serif';c.fillText(String(day),256,295);c.font='30px sans-serif';c.fillText(`11 / 0${day}`,256,355);if(day===7){c.fillStyle='#dd9ca9';c.fillRect(210,409,92,42);c.fillStyle='#d9b65c';c.fillRect(251,382,8,26);c.beginPath();c.ellipse(255,376,5,9,0,0,7);c.fill()}}));
 const calendarPaper=new T.MeshStandardMaterial({map:calendarDates[0],side:T.DoubleSide,roughness:.92,metalness:0});materials.push(calendarPaper);
 mesh(new T.PlaneGeometry(.145,.195),calendarPaper,cal,[0,.103,.039]).rotation.x=-.32;
 const pageHinge=new T.Group();pageHinge.position.set(0,.103+Math.cos(.32)*.0975,.039-Math.sin(.32)*.0975+.001);pageHinge.rotation.x=-.32;cal.add(pageHinge);
 const turningPaper=calendarPaper.clone();materials.push(turningPaper);
 mesh(new T.PlaneGeometry(.145,.195),turningPaper,pageHinge,[0,-.0975,.001]);pageHinge.visible=false;
 for(let i=0;i<6;i++){const ring=mesh(new T.TorusGeometry(.012,.002,8,20),gold,cal,[-.06+i*.024,.21,0]);ring.rotation.y=Math.PI/2}
 const calendarBody=new T.Group();cal.children.slice().forEach(o=>calendarBody.add(o));calendarBody.scale.setScalar(1.25);cal.add(calendarBody);
 let calendarDay=0,calendarTurnStart:number|null=null;
 cal.userData.onActivate=()=>{
  if(room.userData.editMode)return;
  if(room.userData.currentFocus!=='台历'){room.userData.onCalendar?.();flashRoomHint(calendarDay===0?'又是一年立冬了......':'这是我24岁的第一天。');return}
  if(calendarTurnStart!==null)return;
  calendarTurnStart=performance.now();turningPaper.map=calendarDates[0];pageHinge.visible=true;
  pageHinge.rotation.x=-.32-(calendarDay===0?0:Math.PI);
  if(calendarDay===0)calendarPaper.map=calendarDates[1];
 };
 cal.traverse(o=>{if(o instanceof T.Mesh)o.userData.root=cal});
 cal.userData.animateCalendar=()=>{
  if(calendarTurnStart===null)return;
  const p=Math.min(1,(performance.now()-calendarTurnStart)/850),ease=p*p*(3-2*p);
  pageHinge.rotation.x=-.32-Math.PI*(calendarDay===0?ease:1-ease);
  if(p===1){calendarDay=1-calendarDay;flashRoomHint(calendarDay===0?'又是一年立冬了......':'这是我24岁的第一天。');calendarPaper.map=calendarDates[calendarDay];pageHinge.visible=false;calendarTurnStart=null}
 };
 const cat=group('Prop_Cat','窗台狸花猫',[2.12,.785,-1.7]);
 // Surface pigment follows the actual ellipsoid, with no raised stripe meshes.
 const fur=mat(0xffffff,.95);fur.vertexColors=true;
 function tabby(pos:number[],size:number[],parent:T.Object3D,face=false){
  const g=new T.SphereGeometry(1,96,64),p=g.attributes.position,colors=[];
  const base=new T.Color(0x897764),stripe=new T.Color(0x40382f);
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
   const wave=face?Math.cos(x*23+y*5):Math.cos(x*29+Math.sin(y*5+z*3)*1.3);
   const mask=face?T.MathUtils.smoothstep(y,.12,.45):T.MathUtils.smoothstep(y,-.55,-.05);
   const ink=T.MathUtils.smoothstep(wave,.65,.9)*mask;
   const c=base.clone().lerp(stripe,ink*.85);colors.push(c.r,c.g,c.b);
  }
  g.setAttribute('color',new T.Float32BufferAttribute(colors,3));const o=mesh(g,fur,parent,pos);o.scale.set(...size as [number,number,number]);return o;
 }
 tabby([0,.115,0],[.24,.12,.12],cat);
 const headOffset=new T.Vector3(-.075,.025,.025);
 for(const x of[-.25,-.095])ball(cat,[x,.028,.115],[.043,.025,.032],ivory).position.add(headOffset);
 const head=new T.Group();cat.add(head);
 ball(head,[-.19,.14,.035],[.10,.09,.085],brown);
 for(const x of[-.24,-.14])mesh(new T.ConeGeometry(.04,.075,3),brown,head,[x,.235,.026]);
 const openEyes=new T.Group(),closedEyes=new T.Group();head.add(openEyes,closedEyes);closedEyes.visible=false;
 const eyeColor=mat(0xbcb65b);
 eyeColor.userData.blackoutEyes=true;
 cat.userData.setEyesGlow=(enabled:boolean)=>{eyeColor.emissive.setHex(enabled?0xc9d878:0x000000);eyeColor.emissiveIntensity=enabled?1.1:0};
 for(const x of[-.225,-.16]){ball(openEyes,[x,.16,.108],[.024,.016,.012],eyeColor);ball(openEyes,[x,.16,.119],[.004,.014,.004],dark);tube(closedEyes,[[x-.02,.16,.115],[x,.153,.124],[x+.02,.16,.115]],.0025,dark)}
 for(const x of[-.217,-.17])ball(head,[x,.123,.109],[.029,.021,.018],ivory);
 tube(head,[[-.23,.18,.09],[-.215,.21,.11],[-.19,.186,.116],[-.175,.21,.11],[-.15,.18,.09]],.005,dark);
 for(const side of[-1,1])for(let i=0;i<3;i++)tube(head,[[-.19+side*.02,.12,.126],[-.19+side*.10,.12+(i-1)*.014,.15]],.0008,ivory);
 // A short neck bridges the outward head and chest instead of burying the face in the body.
 ball(cat,[-.205,.13,.025],[.079,.062,.062],brown);
 const collar=mesh(new T.TorusGeometry(.062,.007,8,32),dark,cat,[-.205,.13,.025]);collar.rotation.y=Math.PI/2;
 const tagShape=new T.Shape();tagShape.moveTo(-.028,.005);tagShape.lineTo(-.027,.029);tagShape.lineTo(-.012,.019);tagShape.quadraticCurveTo(0,.025,.012,.019);tagShape.lineTo(.027,.029);tagShape.lineTo(.028,.005);tagShape.bezierCurveTo(.036,-.028,-.036,-.028,-.028,.005);
 const tagGeometry=new T.ExtrudeGeometry(tagShape,{depth:.003,bevelEnabled:true,bevelSize:.001,bevelThickness:.001,bevelSegments:3,curveSegments:24});
 const tagUV=tagGeometry.attributes.uv,tagPos=tagGeometry.attributes.position;
 for(let i=0;i<tagUV.count;i++)tagUV.setXY(i,(tagPos.getX(i)+.034)/.068,(tagPos.getY(i)+.028)/.06);
 const nameTag=texture(c=>{c.fillStyle='#cba454';c.fillRect(0,0,512,512);c.fillStyle='#69502d';c.font='bold 145px "Microsoft YaHei", sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('朝朝',256,290)});
 const tagMaterial=surface(nameTag);tagMaterial.roughness=.48;tagMaterial.metalness=.35;
 mesh(tagGeometry,tagMaterial,cat,[-.205,.079,.105]);
 ball(head,[-.19,.123,.12],[.012,.008,.006],pink);
 const neck=new T.Vector3(-.15,.11,.01);head.children.forEach(o=>o.position.sub(neck));
 const headRest=neck.clone().add(headOffset);head.position.copy(headRest);
 const tail=new T.Group();tail.position.set(.2,.08,0);cat.add(tail);
 // One continuous Bezier arc avoids sharp changes between control-point segments.
 const tailCurve=new T.CubicBezierCurve3(new T.Vector3(0,0,0),new T.Vector3(.23,-.045,.14),new T.Vector3(.015,-.04,.25),new T.Vector3(-.16,-.04,.15));
 const tailGeometry=new T.TubeGeometry(tailCurve,128,.028,16,false),tailColors=[];
 const tailUV=tailGeometry.attributes.uv,furBase=new T.Color(0x897764),furStripe=new T.Color(0x40382f);
 for(let i=0;i<tailUV.count;i++){
  const u=tailUV.getX(i),v=tailUV.getY(i);
  const band=T.MathUtils.smoothstep(Math.cos(u*Math.PI*14+.25*Math.sin(v*Math.PI*2)),.55,.9);
  const ink=Math.max(band*.85,T.MathUtils.smoothstep(u,.91,.99));
  const color=furBase.clone().lerp(furStripe,ink);tailColors.push(color.r,color.g,color.b);
 }
 tailGeometry.setAttribute('color',new T.Float32BufferAttribute(tailColors,3));mesh(tailGeometry,fur,tail);
 const tailTip=ball(tail,[-.16,-.04,.15],[.028,.028,.028],mat(0x40382f,.95));
 const tailRestPositions=Float32Array.from(tailGeometry.attributes.position.array);
 let catHint=0;let affection=0,lastCatTime:number|undefined,rubStart:number|null=null;
 cat.userData.onActivate=()=>{
  if(room.userData.editMode)return;
  if(room.userData.currentFocus!=='朝朝'){room.userData.onCat?.();setTimeout(()=>flashRoomHint(['（蹭蹭你）','喵！（猫条！）喵！（猫条！）','喵~'][catHint++%3]),0);return}flashRoomHint(['（蹭蹭你）','喵！（猫条！）喵！（猫条！）','喵~'][catHint++%3]);
  if(rubStart===null&&affection<.01){rubStart=performance.now();playRoomSound('cat');room.userData.easterAction?.('cat')}
 };
 cat.traverse(o=>{if(o instanceof T.Mesh)o.userData.root=cat});
 cat.userData.animateCat=(t:number)=>{
  const dt=lastCatTime===undefined?0:Math.min(.1,t-lastCatTime);lastCatTime=t;
  const rubTime=rubStart===null?0:(performance.now()-rubStart)/1000;
  const active=rubStart!==null&&rubTime<4&&room.userData.currentFocus==='朝朝'&&!room.userData.editMode;
  if(!active)rubStart=null;
  affection=T.MathUtils.damp(affection,active?1:0,3,dt);
  const phase=rubStart===null?4:rubTime,sway=Math.sin(phase*1.65);
  head.rotation.set(affection*(.07+.07*Math.cos(phase*1.65)),affection*.12*sway,affection*.16*sway);
  head.position.copy(headRest);head.position.z+=affection*(.009+.008*Math.cos(phase*1.65));
  const eyeClosure=T.MathUtils.clamp(affection/.9,0,1);
  openEyes.scale.y=Math.max(.001,1-eyeClosure);openEyes.position.y=-neck.y+.16*(1-openEyes.scale.y);
  openEyes.visible=eyeClosure<1;closedEyes.visible=eyeClosure>=1;
  tail.rotation.y=.07*Math.sin(t*.9)+affection*.13*Math.sin(phase*1.65-.6);tail.rotation.z=.012*Math.sin(t*.7)+affection*.035*Math.sin(phase*1.65);
  // Bend the last half continuously, with the largest lift at the rounded tip.
  const tipLift=(.04+affection*.012)*(1+Math.sin(t*2.1));
  const tailPositions=tailGeometry.attributes.position;
  for(let i=0;i<tailPositions.count;i++)tailPositions.setY(i,tailRestPositions[i*3+1]+tipLift*T.MathUtils.smoothstep(tailUV.getX(i),.45,1));
  tailPositions.needsUpdate=true;tailGeometry.computeVertexNormals();tailGeometry.computeBoundingSphere();
  tailTip.position.y=-.04+tipLift;
 };
 const cake=group('Prop_Cake','24岁生日蛋糕',[-.35,.405,.8]);
 const cocoa=mat(0x8b5a43,.85),layer=mat(0xb69178,.88),chocolate=mat(0x68402e,.85);
 const powder=texture(c=>{c.fillStyle='#75402b';c.fillRect(0,0,512,512);for(let i=0;i<14000;i++){const x=(i*73.31)%512,y=(i*137.77)%512;c.fillStyle=i%2?'#63331f':'#8a4f32';c.fillRect(x,y,1.5,1.5)}});cocoa.map=powder;
 mesh(new T.BoxGeometry(.73,.018,.73),ivory,cake,[0,.009,0]);cyl(cake,.29,.25,.15,cocoa);
 const rings:T.BufferGeometry[]=[],stars:T.BufferGeometry[]=[];
 for(let i=0;i<7;i++){
  const base=.03+i*.034;
  rings.push(new T.CylinderGeometry(.291,.291,.024,64).translate(0,base+.012,0));
  rings.push(new T.CylinderGeometry(.292,.292,.010,64).translate(0,base+.029,0));
 }
 const starShape=new T.Shape();for(let k=0;k<10;k++){const t=k*Math.PI/5-Math.PI/2,r=k%2?.011:.024;if(k)starShape.lineTo(Math.cos(t)*r,Math.sin(t)*r);else starShape.moveTo(Math.cos(t)*r,Math.sin(t)*r)}starShape.closePath();
 const starBase=new T.ExtrudeGeometry(starShape,{depth:.005,bevelEnabled:true,bevelSize:.001,bevelThickness:.001,bevelSegments:1}).rotateX(-Math.PI/2);
 for(let i=0;i<23;i++){const a=i*2.39996,r=.255*Math.sqrt((i+.5)/23);stars.push(starBase.clone().translate(Math.cos(a)*r,.278,Math.sin(a)*r))}
 for(let i=0;i<rings.length;i++)mesh(rings[i],i%2?chocolate:layer,cake);
 mesh(mergeGeometries(stars)!,yellow,cake);
 rings.forEach(g=>g.dispose());stars.forEach(g=>g.dispose());starBase.dispose();
 // Extruded tube strokes make true 3D numeral candles, not flat labels.
 const candles=new T.Group();cake.add(candles);
 const beforeCandles=new Set(cake.children);
 const wax=mat(0xeaa653);
 tube(cake,[[-.12,.47,0],[-.11,.52,0],[-.05,.52,0],[-.025,.48,0],[-.075,.425,0],[-.12,.38,0],[-.025,.38,0]],.015,wax);
 tube(cake,[[.10,.53,0],[.045,.43,0],[.15,.43,0]],.015,wax);tube(cake,[[.12,.53,0],[.12,.37,0]],.015,wax);
 for(const x of[-.075,.12]){mesh(new T.CylinderGeometry(.004,.004,.08,8),ivory,cake,[x,.33,0]);tube(cake,[[x,.525,0],[x,.55,0]],.002,dark)}
 cake.children.filter(o=>!beforeCandles.has(o)).forEach(o=>candles.add(o));
 candles.position.y=-.045;
 const flames=new T.Group();candles.add(flames);flames.visible=false;
 const fire=new T.MeshBasicMaterial({color:0xffc65b});materials.push(fire);
 // Keep the light count stable: hiding lights changes every lit material's shader variant.
 const candleLights:T.PointLight[]=[];
 for(const x of[-.075,.12]){ball(flames,[x,.578,0],[.012,.032,.012],fire);const light=new T.PointLight(0xffaf53,0,3,2);light.position.set(x,.60,.04);room.add(light);candleLights.push(light)}
 const candleLightPosition=new T.Vector3();
 const syncCandleLights=()=>{candles.updateWorldMatrix(true,false);room.updateWorldMatrix(true,false);candleLights.forEach((light,i)=>{candleLightPosition.set(i===0?-.075:.12,.60,.04);candles.localToWorld(candleLightPosition);room.worldToLocal(candleLightPosition);light.position.copy(candleLightPosition)})};
 cake.userData.onActivate=()=>room.userData.onCake?.(false);
 cake.traverse(o=>{if(o instanceof T.Mesh)o.userData.root=cake});
 candles.userData.onActivate=()=>room.userData.onCake?.(true);
 candles.traverse(o=>{if(o instanceof T.Mesh)o.userData.root=candles});
 // A non-rendering hit volume covers the wicks, wax and space between both candles.
 const candleHitMaterial=new T.MeshBasicMaterial({colorWrite:false,depthWrite:false});materials.push(candleHitMaterial);
 const candleHit=mesh(new T.BoxGeometry(.36,.34,.18),candleHitMaterial,candles,[.015,.455,0]);candleHit.castShadow=false;candleHit.receiveShadow=false;candleHit.visible=false;candleHit.userData.root=candles;
 flames.userData.onActivate=()=>room.userData.onCake?.(true);
 flames.traverse(o=>{if(o instanceof T.Mesh)o.userData.root=flames});
 cake.userData.setLit=(lit:boolean)=>{syncCandleLights();flames.visible=lit;candleHit.visible=lit;candleLights.forEach(light=>light.intensity=lit?1.1:0)};
 cake.userData.animateFlames=(t:number)=>{syncCandleLights();if(!flames.visible)return;flames.children.forEach((o,index)=>{const i=index*2;if(o instanceof T.Mesh){o.rotation.z=.12*Math.sin(t*4.1+i);o.rotation.x=.08*Math.sin(t*3.3+i);o.scale.y=.032*(1+.08*Math.sin(t*6+i));o.position.x=(index===0?-.075:.12)+.002*Math.sin(t*4+i)}});candleLights.forEach((light,index)=>light.intensity=1.1+.06*Math.sin(t*5+index*2+1))};
 const cup=group('Prop_Cup','陶瓷杯与杯垫',[.53,.405,.86]);
 const coaster=surface(texture(c=>{c.fillStyle='#44291d';c.fillRect(0,0,512,512);c.fillStyle='#806047';for(let x=0;x<512;x+=32)c.fillRect(x,0,12,512)}));cyl(cup,.13,.01,.006,coaster);
 mesh(new T.LatheGeometry([[.063,.014],[.064,.025],[.077,.19],[.071,.195],[.066,.18],[.056,.03]].map(p=>new T.Vector2(...p as [number,number])),48),ivory,cup);
 const handle=mesh(new T.TorusGeometry(.055,.012,12,32),ivory,cup,[.083,.105,0]);handle.scale.y=1.25;
 const water=mat(0x8daca4,.13);water.metalness=.12;
 mesh(new T.CircleGeometry(.065,48),water,cup,[0,.174,0]).rotation.x=-Math.PI/2;
 const steamMap=texture(c=>{c.clearRect(0,0,512,512);const gradient=c.createRadialGradient(256,256,0,256,256,250);gradient.addColorStop(0,'rgba(255,255,255,.65)');gradient.addColorStop(.45,'rgba(255,255,255,.22)');gradient.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=gradient;c.fillRect(0,0,512,512)});
 const steam=new T.Group();cup.add(steam);steam.visible=true;
 for(let i=0;i<12;i++){const material=new T.SpriteMaterial({map:steamMap,transparent:true,opacity:0,depthWrite:false,color:0xe8e9e4});materials.push(material);const puff=new T.Sprite(material);puff.raycast=()=>{};steam.add(puff)}
 let steamStart:number|null=performance.now();
 cup.userData.onActivate=()=>{flashRoomHint('还在冒热气')}; // Steam is continuous; touching the cup does not restart it.
 cup.userData.animateSteam=()=>{steam.visible=!room.userData.editMode;if(!steam.visible)return;const elapsed=(performance.now()-(steamStart||0))/1000;steam.children.forEach((o,i)=>{const p=(elapsed*.35+i/12)%1;o.position.set(Math.sin(p*5+i*2.4)*(.014+p*.025),.19+p*.27,Math.cos(i*2.4+p*3)*.018);o.scale.setScalar(.032+p*.07);(o as T.Sprite).material.opacity=Math.sin(p*Math.PI)*.20})};
 mesh(new T.BoxGeometry(.043,.075,.006),blue,cup,[0,.107,.07]);
 for(const x of[-.024,0,.024])mesh(new T.BoxGeometry(.005,.083,.006),ivory,cup,[x,.107,.076]);for(const y of[.067,.107,.147])mesh(new T.BoxGeometry(.05,.005,.006),ivory,cup,[0,y,.076]);
 cup.traverse(o=>{if(o instanceof T.Mesh)o.userData.root=cup});
 const lamp=group('Prop_Lamp','黄色蘑菇台灯',[1.7,.785,-1.67]);
 ball(lamp,[0,.025,0],[.10,.05,.10],yellow);cyl(lamp,.012,.25,.16,yellow);
 mesh(new T.SphereGeometry(.17,40,24,0,Math.PI*2,0,Math.PI/2),yellow,lamp,[0,.32,0]);
 const bulbMaterial=mat(0xffecc5,.3);bulbMaterial.emissive.set(0xffc477);
 const globe=ball(lamp,[0,.31,0],[.09,.065,.09],bulbMaterial);globe.castShadow=false;
 ball(lamp,[0,.496,0],[.014,.014,.014],gold);
 ball(lamp,[0,.285,0],[.065,.035,.065],bulbMaterial);
 const lampLight=new T.PointLight(0xffcf8f,1.4,2.4,2);lampLight.position.set(0,.265,.035);lamp.add(lampLight);
 const spotGroup=group('Prop_Photo_Spotlight','照片墙射灯',[-2.64,2.43,-.18]);
 mesh(new T.BoxGeometry(.025,.11,.09),gold,spotGroup,[-.105,0,0]);
 tube(spotGroup,[[-.09,0,0],[-.07,.09,0],[.04,.10,0],[.09,.045,0]],.009,gold);
 const spotTarget=new T.Object3D();spotTarget.position.set(-.11,-.85,0);spotGroup.add(spotTarget);
 const spot=new T.SpotLight(0xffdfae,5*2/3,3,Math.PI/3,.65,2);spot.position.set(.09,0,0);spot.target=spotTarget;spotGroup.add(spot);
 const housing=mesh(new T.CylinderGeometry(.055,.045,.12,24),gold,spotGroup,[.09,0,0]);housing.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),spotTarget.position.clone().sub(spot.position).normalize());
 lamp.userData.setRoomLight=(level:number)=>{lampLight.intensity=1.4*level;bulbMaterial.emissiveIntensity=1.15*level};
 spotGroup.userData.setRoomLight=(level:number)=>{spot.intensity=(5*2/3)*level};
 const plate=group('Prop_Display_Plate','第三层展示盘',[-2.38,1.24,-1.52]);plate.rotation.y=Math.PI/4;
 const ceramic=mat(0xf5f3e9,.24);
 const dish=mesh(new T.CylinderGeometry(.16,.15,.012,64),ceramic,plate,[0,.17,0]);dish.rotation.x=Math.PI/2;
 const raisedRim=mesh(new T.LatheGeometry([[.124,.007],[.14,.012],[.153,.035],[.157,.039],[.165,.039],[.169,.032],[.162,-.004],[.124,-.004],[.124,.007]].map(p=>new T.Vector2(p[0],p[1])),64),ceramic,plate,[0,.17,0]);raisedRim.rotation.x=Math.PI/2;
 const plateMap=new T.TextureLoader().load(plateUrl);plateMap.colorSpace=T.SRGBColorSpace;textures.push(plateMap);
 // Sample only the painted centre of the supplied plate, excluding the surrounding fabric.
 const artGeometry=new T.CircleGeometry(.126,64),uv=artGeometry.attributes.uv;
 for(let i=0;i<uv.count;i++)uv.setXY(i,.515+(uv.getX(i)-.5)*.63,.588+(uv.getY(i)-.5)*.34);
 mesh(artGeometry,surface(plateMap),plate,[0,.17,.007]);
 for(const x of[-.075,.075])tube(plate,[[x,.025,.065],[x,.035,.02],[x,.13,-.025],[x,.24,-.03]],.005,gold);
 tube(plate,[[-.075,.03,-.055],[0,.035,-.09],[.075,.03,-.055]],.005,gold);
 const villageMap=texture(c=>{c.fillStyle='#d8d7c5';c.fillRect(0,0,512,512);c.strokeStyle='#ada996';c.lineWidth=2;for(let x=0;x<512;x+=85){c.beginPath();c.moveTo(x,0);c.lineTo(x+5,512);c.stroke()}for(let y=30;y<512;y+=105){c.beginPath();c.moveTo(0,y);c.lineTo(512,y+4);c.stroke()}for(let i=0;i<3;i++){const x=25+i*175;c.fillStyle='#eee4d0';c.fillRect(x,290,120,130);c.fillStyle=i%2?'#777e6b':'#a47c76';c.beginPath();c.moveTo(x-12,290);c.lineTo(x+55,180);c.lineTo(x+132,290);c.fill();c.fillStyle='#a77b72';c.fillRect(x+22,325,16,25);c.fillStyle='#4e6555';c.fillRect(x+74,365,21,55);c.beginPath();c.ellipse(x+145,290,20,60,0,0,7);c.fill()}c.strokeStyle='#7f7861';for(let x=0;x<512;x+=13){c.beginPath();c.moveTo(x,463);c.lineTo(x+10,482);c.stroke()}});
 plate.updateWorldMatrix(true,false);
 const cupPos=plate.localToWorld(new T.Vector3(.235,.004,.035));
 const villageCup=group('Prop_Display_Cup','手绘直壁矮杯',cupPos.toArray());villageCup.rotation.y=plate.rotation.y;
 mesh(new T.LatheGeometry([[0,0],[.048,0],[.048,.012],[.068,.024],[.070,.125],[.069,.13],[.063,.13],[.063,.028],[0,.028]].map(p=>new T.Vector2(p[0],p[1])),64),surface(villageMap),villageCup);
 const cupPhoto=new T.TextureLoader().load(cupUrl);cupPhoto.colorSpace=T.SRGBColorSpace;textures.push(cupPhoto);
 const cupFront=new T.CylinderGeometry(.0703,.0683,.105,96,1,true,Math.PI,Math.PI*2);
 mesh(cupFront,surface(cupPhoto),villageCup,[0,.076,0]);
 const noteText='昨天上午一直在上课，没能再见到你，你送的手绘瓷很好，我很喜欢，很有纪念意义，再祝一切顺安✌✌✌。';
 const noteAsset=createCeramicNote();
 const notePos=plate.localToWorld(new T.Vector3(.10,.002,.12));
 const noteGroup=group('Prop_Ceramic_Note','手写撕边纸条',notePos.toArray());noteGroup.rotation.y=plate.rotation.y;
 const noteGeometry=new T.PlaneGeometry(.275,.086,64,16),np=noteGeometry.attributes.position;
 for(let i=0;i<np.count;i++)np.setZ(i,.0007*Math.sin(np.getX(i)*180+np.getY(i)*40));noteGeometry.computeVertexNormals();
 const noteMaterial=surface(noteAsset.map);noteMaterial.alphaTest=.45;noteMaterial.depthWrite=true;
 const note=mesh(noteGeometry,noteMaterial,noteGroup);note.rotation.x=-Math.PI/2;
 plate.userData.onActivate=()=>room.userData.focusProp?.(plate,'手绘瓷');plate.traverse(o=>{if(o instanceof T.Mesh)o.userData.root=plate});
 villageCup.userData.onActivate=plate.userData.onActivate;villageCup.traverse(o=>{if(o instanceof T.Mesh)o.userData.root=villageCup});
 note.userData.root=noteGroup;noteGroup.userData.onActivate=()=>{if(room.userData.currentFocus==='手绘瓷')room.userData.showCeramicNote?.(noteText,noteAsset.canvas.toDataURL());else room.userData.focusProp?.(plate,'手绘瓷')};
 const shelfBooks=group('Prop_Shelf_Books','架子上的六本书',[-2.60,.72,-1.76]);
 let bookOffset=0;
 for(let i=0;i<6;i++){
  const h=[.23,.29,.25,.26,.20,.27][i]*1.25,w=[.0625,.165,.055,.145,.036,.13][i];
  const book=new T.Group();book.name='Shelf_Book_'+i;book.position.x=bookOffset+w/2;bookOffset+=w+.009;shelfBooks.add(book);
  const coverMat=mat(shelfColors[i]);
  mesh(new T.BoxGeometry(w-.008,h-.012,.195),ivory,book,[0,h/2,0]);
  for(const x of[-w/2,w/2])mesh(new T.BoxGeometry(.004,h,.21),coverMat,book,[x,h/2,0]);
  mesh(new T.BoxGeometry(w,h,.008),coverMat,book,[0,h/2,.103]);
  for(const y of[.045,h-.045])mesh(new T.BoxGeometry(w*.72,.005,.001),gold,book,[0,y,.1075]);
 }
 const disposeShelfReading=setupShelfReading(shelfBooks,room);
 const disposePosterScreen=setupPosterScreen(room);
 const pocket=group('Prop_Pocket_Notebook','电脑旁的小本子',[2.51,.787,-.02]);
 const disposeCoursework=setupCoursework(pocket,room);
 const yellowNotebook=group('Prop_Yellow_Notebook','黄色横版作业本',[2.23,.787,-.02]);
 const disposeYellowNotebook=setupYellowNotebook(yellowNotebook,room);
 // Preserve saved placement/scales while doubling the vertical book structure.
 for(const notebook of[pocket,yellowNotebook]){
  const thicknessGroup=new T.Group();thicknessGroup.name='Double_Thickness';
  for(const child of[...notebook.children])thicknessGroup.add(child);
  thicknessGroup.scale.y=2;notebook.add(thicknessGroup);
 }
 const book=group('Prop_Journal','绿色硬皮日记本',[.84,.405,.61]);
 const cover=mat(0x78804b,.8);
 for(const y of[.007,.089])mesh(new T.BoxGeometry(.43,.014,.56),cover,book,[0,y,0]);
 mesh(new T.BoxGeometry(.015,.085,.56),cover,book,[-.209,.046,0]);
 for(let i=0;i<16;i++){const page=mesh(new T.BoxGeometry(.407,.0037,.534),ivory,book,[.004,.018+i*.0041,0]);page.name='Diary_Page_'+String(i+1).padStart(2,'0')}
 const plant=group('Prop_Monstera','龟背竹盆栽',[2.52,0,.34]);
 const leafPivots:T.Group[]=[];let leafSwayStart:number|null=null;
 const swayLeaves=()=>{if(!room.userData.editMode){leafSwayStart=performance.now();flashRoomHint('沙沙沙');playRoomSound('leaves')}};
 plant.userData.animateLeaves=()=>{if(leafSwayStart===null)return;const t=(performance.now()-leafSwayStart)/1000;if(t>=3||room.userData.editMode){leafPivots.forEach(p=>p.rotation.set(0,0,0));leafSwayStart=null;return}const envelope=Math.sin(Math.PI*t/3);leafPivots.forEach((p,i)=>{p.rotation.z=.20*envelope*Math.sin(t*4+i*.35);p.rotation.x=.12*envelope*Math.sin(t*3.4+i*.4)})};
 mesh(new T.CylinderGeometry(.16,.12,.25,40),mat(0xc09672),plant,[0,.125,0]);cyl(plant,.148,.015,.252,mat(0x493021));
 for(let i=0;i<7;i++){
  const a=i*2.4,x=Math.cos(a)*.23,z=Math.sin(a)*.19,h=.48+(i%3)*.17;tube(plant,[[0,.23,0],[x*.35,h*.8,z*.35],[x,h,z]],.008,green);
  const s=new T.Shape();s.moveTo(0,-.12);s.bezierCurveTo(-.20,-.03,-.16,.16,-.06,.16);s.quadraticCurveTo(-.015,.16,0,.10);s.quadraticCurveTo(.015,.16,.06,.16);s.bezierCurveTo(.16,.16,.20,-.03,0,-.12);
  for(const side of[-1,1])for(let j=0;j<3;j++){const hole=new T.Path();hole.absellipse(side*(.043+j*.012),.07-j*.045,.008,.025,0,Math.PI*2,false,side*.5);s.holes.push(hole)}
  const leafMat=mat(i%2?0x315c35:0x477440);leafMat.side=T.DoubleSide;
  const pivot=new T.Group();pivot.position.set(x,h,z);plant.add(pivot);leafPivots.push(pivot);pivot.userData.onActivate=swayLeaves;
  const leaf=mesh(new T.ShapeGeometry(s,18),leafMat,pivot);leaf.rotation.set(-.45,a*.3,Math.sin(a)*.3);leaf.userData.root=pivot;
 }
 const disposeStickers=setupEasterStickers(room);
 /* Archived travel-sticker design; replaced by interactive Easter-egg badges.
 const suitcase=room.getObjectByName('Silver_Suitcase');
 if(suitcase){
  const gullMap=texture(c=>{c.clearRect(0,0,512,512);c.fillStyle='#e5eef0';c.strokeStyle='#546d7a';c.lineWidth=5;c.beginPath();c.moveTo(25,100);c.quadraticCurveTo(170,100,246,220);c.quadraticCurveTo(340,100,488,90);c.lineTo(360,255);c.lineTo(312,300);c.lineTo(365,365);c.lineTo(258,337);c.lineTo(170,360);c.lineTo(200,296);c.closePath();c.fill();c.stroke();c.fillStyle='#344d5b';c.textAlign='center';c.font='bold 58px KaiTi, sans-serif';c.fillText('青岛',255,285)});
  // Appended after the original seven stickers below to preserve their saved IDs.
  const names=['南京','景德镇','苏州','浙江','INDONESIA','广州','郴州'];
  const outlines=[[[25,210],[25,125],[0,125],[75,80],[150,20],[225,80],[300,125],[275,125],[275,210]],[[90,20],[210,20],[190,70],[240,130],[245,200],[55,200],[60,130],[110,70]],[[0,180],[0,110],[35,110],[35,85],[265,85],[265,110],[300,110],[300,180],[230,180],[215,140],[185,115],[115,115],[85,140],[70,180]],[[40,15],[260,15],[260,205],[40,205]],[[0,125],[110,80],[130,10],[170,10],[190,80],[300,125],[300,145],[185,125],[180,180],[220,205],[80,205],[120,180],[115,125],[0,145]],[[40,25],[260,25],[275,170],[235,185],[245,210],[220,210],[200,190],[100,190],[80,210],[55,210],[65,185],[25,170]],[[40,15],[60,40],[80,5],[95,45],[120,20],[115,80],[145,100],[220,90],[245,40],[295,60],[270,85],[295,115],[250,135],[235,185],[160,215],[80,210],[40,180],[20,130],[25,85],[5,70],[35,60]]];
  names.forEach((name,i)=>{const map=texture(c=>{c.clearRect(0,0,512,512);c.save();c.translate(20,50);c.scale(1.55,1.55);c.beginPath();outlines[i].forEach(([x,y],j)=>j?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=['#cddcc9','#f1d7b8','#b8d7db','#e8c6b8','#d4d8eb','#d3dfc8','#f8dc50'][i];c.fill();c.strokeStyle='#44352a';c.lineWidth=4;c.stroke();c.fillStyle='#44352a';c.textAlign='center';c.font=`bold ${i===4?25:40}px sans-serif`;c.fillText(name,150,155);c.restore()});const m=surface(map);m.transparent=true;m.depthWrite=false;const sticker=mesh(new T.PlaneGeometry(.145,.13),m,suitcase,[-.135+(i%3)*.135,.55-Math.floor(i/3)*.155,.15]);sticker.rotation.z=(i%2?1:-1)*.12});
  const gullMaterial=surface(gullMap);gullMaterial.transparent=true;gullMaterial.depthWrite=false;mesh(new T.PlaneGeometry(.145,.13),gullMaterial,suitcase,[.08,.30,.155]);
 }
 */
 return ()=>{candleLights.forEach(light=>{light.removeFromParent();light.dispose()});delete room.userData.showLetter;letter.dispose();disposePosterScreen();disposeShelfReading();disposeStickers();disposeCoursework();disposeYellowNotebook();noteAsset.dispose();cancelAnimationFrame(flowerRaf);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose())};
}
