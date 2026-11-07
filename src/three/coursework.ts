import * as T from 'three';
import {pageImage} from '../lib/page-image';
import {playRoomSound} from '../lib/prototype-sound';
import p1 from '../assets/coursework/调研报告_01.png';
import p2 from '../assets/coursework/调研报告_02.png';
import p3 from '../assets/coursework/调研报告_03.png';
import p4 from '../assets/coursework/调研报告_04.png';
import p5 from '../assets/coursework/调研报告_05.png';
import p6 from '../assets/coursework/调研报告_06.png';
import p8 from '../assets/coursework/调研报告_08.png';

/** Each landscape A3 image spans two portrait A4 faces at the spine. */
export function setupCoursework(book:T.Group,room:T.Group){
 const w=.15,h=w*Math.SQRT2,geos:T.BufferGeometry[]=[],mats:T.Material[]=[],textures:T.Texture[]=[];
 let disposed=false;
 const cover=new T.MeshStandardMaterial({color:0x512b2b,roughness:.96});
 const paper=new T.MeshStandardMaterial({color:0xffffff});mats.push(cover,paper);
 const add=(geo:T.BufferGeometry,material:T.Material,parent:T.Object3D,x:number,y:number)=>{geos.push(geo);const mesh=new T.Mesh(geo,material);mesh.position.set(x,y,0);mesh.userData.root=book;parent.add(mesh);return mesh};
 add(new T.BoxGeometry(w+.008,.003,h+.008),cover,book,0,0);
 const lid=new T.Group();lid.position.set(-w/2,.0073,0);book.add(lid);
 add(new T.BoxGeometry(w+.008,.002,h+.008),cover,lid,w/2,0);
 const loads:Array<()=>void>=[];
 const halves=[p1,p2,p3,p4,p5,p6,p8].map(url=>{
  const canvas=document.createElement('canvas');canvas.width=4096;canvas.height=2896;
  const ctx=canvas.getContext('2d')!;ctx.fillStyle='#fff';ctx.fillRect(0,0,4096,2896);
  const base=new T.CanvasTexture(canvas);base.colorSpace=T.SRGBColorSpace;base.anisotropy=16;textures.push(base);
  const pair=[0,.5].map(x=>{const t=base.clone();t.repeat.set(.5,1);t.offset.set(x,0);textures.push(t);const m=new T.MeshStandardMaterial({map:t,color:0xffffff,roughness:1,metalness:0,emissive:0x000000});mats.push(m);return m});
  let loaded=false;loads.push(()=>{if(loaded)return;loaded=true;const img=new Image();img.onload=()=>{if(disposed)return;const scale=Math.min(4096/img.width,2896/img.height);ctx.drawImage(img,(4096-img.width*scale)/2,(2896-img.height*scale)/2,img.width*scale,img.height*scale);base.needsUpdate=true;pair.forEach(m=>m.map!.needsUpdate=true)};void pageImage(url).then(src=>{if(!disposed)img.src=src}).catch(()=>{loaded=false});});
  return pair;
 });
 const face=(parent:T.Object3D,material:T.Material,back=false)=>{const offset=parent===lid?.0011:.00012;const mesh=add(new T.PlaneGeometry(w,h),material,parent,w/2,back?-offset:offset);mesh.rotation.x=back?Math.PI/2:-Math.PI/2;if(back)mesh.rotation.z=Math.PI};
 face(lid,halves[0][0],true);
 const sheets=halves.map((pair,i)=>{const pivot=new T.Group();pivot.position.set(-w/2,.006-i*.0002,0);book.add(pivot);add(new T.BoxGeometry(w,.00018,h),paper,pivot,w/2,0);face(pivot,pair[1]);if(i+1<halves.length)face(pivot,halves[i+1][0],true);return pivot});
 let opened=false,page=0,tween:{object:T.Object3D,from:number,to:number,start:number}|null=null;
 const turn=(object:T.Object3D,to:number)=>{playRoomSound('paper');tween={object,from:object.rotation.z,to,start:performance.now()}};
 book.userData.onActivate=(point?:T.Vector3)=>{
  if(room.userData.editMode)return;
  loads[page]?.();loads[page+1]?.();
  if(room.userData.currentFocus!=='小本子'){room.userData.focusProp?.(book,'小本子');return}
  if(tween)return;
  if(!opened){opened=true;turn(lid,Math.PI);return}
  const local=point?book.worldToLocal(point.clone()):new T.Vector3();
  if(local.x<-w/2){if(page>0){turn(sheets[--page],0)}else{opened=false;turn(lid,0)}}
  else if(page<sheets.length-1){turn(sheets[page++],Math.PI);loads[page+1]?.()}
 };
 book.userData.update=()=>{
  if(tween){const t=Math.min(1,(performance.now()-tween.start)/700);tween.object.rotation.z=T.MathUtils.lerp(tween.from,tween.to,t*t*(3-2*t));if(t===1)tween=null}
  // Both visible faces meet at exactly the same height at the spine.
  const top=.00612,step=.00032;
  const lidProgress=lid.rotation.z/Math.PI;
  lid.position.y=T.MathUtils.lerp(.0073,top-.0011-page*step,lidProgress)+Math.sin(lidProgress*Math.PI)*.002;
  sheets.forEach((s,i)=>{
   const right=top-.00012-Math.max(0,i-page)*step;
   const left=top-.00012-Math.max(0,page-1-i)*step;
   const progress=s.rotation.z/Math.PI;
   s.position.y=T.MathUtils.lerp(right,left,progress)+Math.sin(progress*Math.PI)*.002;
  });
 };
 return ()=>{disposed=true;geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());delete book.userData.update;delete book.userData.onActivate};
}
