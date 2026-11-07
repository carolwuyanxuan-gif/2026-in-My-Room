import * as T from 'three';
import {pageImage} from '../lib/page-image';
import {playRoomSound} from '../lib/prototype-sound';
import p0 from '../assets/coursework2/1120-组会-野生设计_01.png';
import p1 from '../assets/coursework2/1120-组会-野生设计_02.png';
import p2 from '../assets/coursework2/1120-组会-野生设计_03.png';
import p3 from '../assets/coursework2/1120-组会-野生设计_04.png';
import p4 from '../assets/coursework2/1120-组会-野生设计_05.png';
import p5 from '../assets/coursework2/1120-组会-野生设计_06.png';
import p6 from '../assets/coursework2/1120-组会-野生设计_07.png';
import p7 from '../assets/coursework2/1120-组会-野生设计_08.png';
import p8 from '../assets/coursework2/1120-组会-野生设计_09.png';
import p9 from '../assets/coursework2/1120-组会-野生设计_10.png';
import p10 from '../assets/coursework2/1120-组会-野生设计_11.png';
import p11 from '../assets/coursework2/1120-组会-野生设计_12.png';
import p12 from '../assets/coursework2/1120-组会-野生设计_13.png';
import p13 from '../assets/coursework2/1120-组会-野生设计_14.png';
import p14 from '../assets/coursework2/1120-组会-野生设计_15.png';
import p15 from '../assets/coursework2/1120-组会-野生设计_16.png';
import p16 from '../assets/coursework2/1120-组会-野生设计_17.png';
import p17 from '../assets/coursework2/1120-组会-野生设计_18.png';
import p18 from '../assets/coursework2/1120-组会-野生设计_19.png';
import p19 from '../assets/coursework2/1120-组会-野生设计_20.png';
import p20 from '../assets/coursework2/1120-组会-野生设计_21.png';
import p21 from '../assets/coursework2/1120-组会-野生设计_22.png';
const urls=[p0,p1,p2,p3,p4,p5,p6,p7,p8,p9,p10,p11,p12,p13,p14,p15,p16,p17,p18,p19,p20,p21];
export function setupYellowNotebook(book:T.Group,room:T.Group){
 const w=.26,h=w*9/16,geos:T.BufferGeometry[]=[],mats:T.Material[]=[],textures:T.Texture[]=[];
 let disposed=false,opened=false,page=0,tween:{o:T.Object3D,from:number,to:number,time:number}|null=null;
 const cover=new T.MeshStandardMaterial({color:0xe8ba39,roughness:.85}),paper=new T.MeshStandardMaterial({color:0xfffdf6});mats.push(cover,paper);
 const add=(g:T.BufferGeometry,m:T.Material,parent:T.Object3D,y=0,z=0)=>{geos.push(g);const o=new T.Mesh(g,m);o.position.set(0,y,z);o.userData.root=book;parent.add(o);return o};
 add(new T.BoxGeometry(w+.008,.002,h+.008),cover,book);
 const lid=new T.Group();lid.position.set(0,.008,-h/2);book.add(lid);add(new T.BoxGeometry(w+.008,.0015,h+.008),cover,lid,0,h/2);
 const sheets=urls.map((url,i)=>{
  const pivot=new T.Group();pivot.position.set(0,.006-i*.00018,-h/2);book.add(pivot);
  add(new T.BoxGeometry(w,.00016,h),paper,pivot,0,h/2);
  const canvas=document.createElement('canvas');canvas.width=2560;canvas.height=1440;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#fff';ctx.fillRect(0,0,2560,1440);
  const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=8;textures.push(tex);
  const mat=new T.MeshStandardMaterial({map:tex,color:0xffffff,roughness:1,metalness:0,emissive:0x000000});mats.push(mat);
  const face=add(new T.PlaneGeometry(w,h),mat,pivot,.0001,h/2);face.rotation.x=-Math.PI/2;
  let loaded=false;const load=()=>{if(loaded)return;loaded=true;const image=new Image();image.onload=()=>{if(disposed)return;const s=Math.min(2560/image.width,1440/image.height);ctx.drawImage(image,(2560-image.width*s)/2,(1440-image.height*s)/2,image.width*s,image.height*s);tex.needsUpdate=true};void pageImage(url).then(src=>{if(!disposed)image.src=src}).catch(()=>{loaded=false})};
  return {pivot,load};
 });

 const turn=(o:T.Object3D,to:number)=>{playRoomSound('paper');tween={o,from:o.rotation.x,to,time:performance.now()}};
 book.userData.onActivate=(point?:T.Vector3)=>{
  if(room.userData.editMode)return;
  sheets[page]?.load();sheets[page+1]?.load();
  if(room.userData.currentFocus!=='黄色作业本'){room.userData.focusProp?.(book,'黄色作业本');return}
  if(tween)return;
  if(!opened){opened=true;turn(lid,-Math.PI);return}
  const local=point?book.worldToLocal(point.clone()):new T.Vector3();
  if(local.z<-h/2){if(page>0)turn(sheets[--page].pivot,0);else{opened=false;turn(lid,0)}}
  else if(page<sheets.length-1){turn(sheets[page++].pivot,-Math.PI);sheets[page].load();sheets[page+1]?.load()}
 };
 book.userData.update=()=>{
  if(tween){const t=Math.min(1,(performance.now()-tween.time)/650);tween.o.rotation.x=T.MathUtils.lerp(tween.from,tween.to,t*t*(3-2*t));if(t===1)tween=null}
  // Keep the active sheet above both stacks and leave clearance for its faces.
  const top=.010,step=.0003,lidProgress=lid.rotation.x/-Math.PI;
  lid.position.y=T.MathUtils.lerp(top+.0012,top-.001-page*step,lidProgress)+Math.sin(lidProgress*Math.PI)*.002;
  sheets.forEach(({pivot},i)=>{
   const progress=pivot.rotation.x/-Math.PI;
   const below=top-.0001-Math.max(0,i-page)*step;
   const above=top-.0001-Math.max(0,page-1-i)*step;
   pivot.position.y=T.MathUtils.lerp(below,above,progress)+Math.sin(progress*Math.PI)*.002;
  });
 };
 return ()=>{disposed=true;geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose())};
}

