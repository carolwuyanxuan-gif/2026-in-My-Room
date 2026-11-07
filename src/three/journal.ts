import p1 from '../assets/journal-current/1.png';
import p2 from '../assets/journal-current/2.png';
import p3 from '../assets/journal-current/3.png';
import p4 from '../assets/journal-current/4.png';
import p5 from '../assets/journal-current/5.png';
import p6 from '../assets/journal-current/6.png';
import p7 from '../assets/journal-current/7.png';
import p8 from '../assets/journal-current/8.png';
import p9 from '../assets/journal-current/9.png';
import p10 from '../assets/journal-current/10.png';
import p11 from '../assets/journal-current/11.png';
import p12 from '../assets/journal-current/12.png';
import p13 from '../assets/journal-current/13.png';
import p14 from '../assets/journal-current/14.png';
import p15 from '../assets/journal-current/15.png';
import p16 from '../assets/journal-current/16.png';
import p17 from '../assets/journal-current/17.png';
import p18 from '../assets/journal-current/18.png';
import p19 from '../assets/journal-current/19.png';
import p20 from '../assets/journal-current/20.png';
import p21 from '../assets/journal-current/21.png';
import p22 from '../assets/journal-current/22.png';
import p23 from '../assets/journal-current/23.png';
import p24 from '../assets/journal-current/24.png';
import p25 from '../assets/journal-current/25.png';
import p26 from '../assets/journal-current/26.png';
import p27 from '../assets/journal-current/27.png';
import p28 from '../assets/journal-current/28.png';
import p29 from '../assets/journal-current/29.png';
import p30 from '../assets/journal-current/30.png';
import p31 from '../assets/journal-current/31.png';
import * as T from 'three';
import {pageImage} from '../lib/page-image';
import {playRoomSound} from '../lib/prototype-sound';
import handwritingUrl from '../assets/note-handwriting.ttf';

export function setupJournal(book:T.Object3D,room:T.Group,focus:()=>void){
 // Reset only the journal's old editor transform once; preserve every other object.
 try{if(!localStorage.getItem('journal-position-v2')){const key='annual-room.frames.six-layout.v1',layout=JSON.parse(localStorage.getItem(key)||'{}');delete layout.Prop_Journal;localStorage.setItem(key,JSON.stringify(layout));localStorage.setItem('journal-position-v2','1')}}catch{}
 book.clear();const geos:T.BufferGeometry[]=[],mats:T.Material[]=[],textures:T.Texture[]=[];let disposed=false;
 const cover=new T.MeshStandardMaterial({color:0x285038,roughness:.7}),paper=new T.MeshStandardMaterial({color:0xfffaf0});mats.push(cover,paper);
 const add=(g:T.BufferGeometry,m:T.Material,p:T.Object3D,x=0,y=0,z=0)=>{geos.push(g);const o=new T.Mesh(g,m);o.position.set(x,y,z);o.userData.root=book;o.castShadow=true;o.receiveShadow=true;p.add(o);return o};
 add(new T.BoxGeometry(.43,.014,.56),cover,book,0,.007);
 add(new T.BoxGeometry(.015,.085,.56),cover,book,-.21,.046);
 const lid=new T.Group();lid.position.set(-.21,.089,0);book.add(lid);add(new T.BoxGeometry(.43,.014,.56),cover,lid,.21);
 // Gold lettering belongs to the lid, so it turns with the cover and remains unlit in darkness.
 const titleCanvas=document.createElement('canvas');titleCanvas.width=1024;titleCanvas.height=384;
 const titleTexture=new T.CanvasTexture(titleCanvas);titleTexture.colorSpace=T.SRGBColorSpace;titleTexture.anisotropy=8;textures.push(titleTexture);
 const titleMaterial=new T.MeshStandardMaterial({map:titleTexture,color:0xdcb65d,metalness:.45,roughness:.42,transparent:true,depthWrite:false});mats.push(titleMaterial);
 const title=add(new T.PlaneGeometry(.28,.105),titleMaterial,lid,.21,.0074,-.07);title.rotation.x=-Math.PI/2;title.castShadow=false;
 const drawTitle=()=>{if(disposed)return;const ctx=titleCanvas.getContext('2d')!;ctx.clearRect(0,0,1024,384);ctx.fillStyle='#ffffff';ctx.font='260px DailyHand, KaiTi, cursive';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('daily',512,192);titleTexture.needsUpdate=true};
 drawTitle();new FontFace('DailyHand',`url(${handwritingUrl})`).load().then(font=>{if(disposed)return;document.fonts.add(font);drawTitle()}).catch(()=>{});
 const pageFaces:{face:T.Mesh,ambient:T.Material,original:T.Material}[]=[];
 let reading=false;
 const loads:Array<()=>void>=[];
 const sheets:T.Group[]=[];const urls=[p1,p2,p3,p4,p5,p6,p7,p8,p9,p10,p11,p12,p13,p14,p15,p16,p17,p18,p19,p20,p21,p22,p24,p25,p23,p26,p27,p28,p29,p30,p31];
 for(let i=0;i<16;i++){
  const pivot=new T.Group();pivot.position.set(-.2,.079-i*.0037,0);book.add(pivot);sheets.push(pivot);
  add(new T.BoxGeometry(.40,.003,.534),paper,pivot,.2);
  for(let side=0;side<2;side++){
   const index=i*2+side;if(index>=urls.length)continue;
   const c=document.createElement('canvas');c.width=2048;c.height=2730;const ctx=c.getContext('2d')!;ctx.fillStyle='#ffffff';ctx.fillRect(0,0,c.width,c.height);ctx.imageSmoothingQuality='high';
   const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=8;textures.push(tex);const m=new T.MeshBasicMaterial({map:tex,toneMapped:false});mats.push(m);
   const face=add(new T.PlaneGeometry(.394,.527),m,pivot,.2,side?-.002:.002);face.rotation.x=side?Math.PI/2:-Math.PI/2;if(side)face.rotation.z=Math.PI;
   const ambient=new T.MeshStandardMaterial({map:tex,roughness:1});
   mats.push(ambient);face.material=ambient;pageFaces.push({face,ambient,original:m});
   let loaded=false;loads[index]=()=>{if(loaded)return;loaded=true;const image=new Image();image.onload=()=>{if(disposed)return;const factor=Math.min((c.width-36)/image.width,(c.height-36)/image.height);const w=image.width*factor,h=image.height*factor;ctx.drawImage(image,(c.width-w)/2,(c.height-h)/2,w,h);tex.needsUpdate=true};void pageImage(urls[index]).then(src=>{if(!disposed)image.src=src}).catch(()=>{loaded=false});};
  }
 }
 let opened=false,page=0,tween:{object:T.Object3D,from:number,to:number,start:number}|null=null;
 const turn=(object:T.Object3D,to:number)=>{playRoomSound('paper');tween={object,from:object.rotation.z,to,start:performance.now()}};
 book.userData.onActivate=(point?:T.Vector3)=>{
  for(let i=Math.max(0,page*2-1);i<=page*2+3;i++)loads[i]?.();
  if(room.userData.currentFocus!=='日记本'){focus();return}
  if(tween)return;
  if(!opened){opened=true;turn(lid,Math.PI);return}
  const local=point?book.worldToLocal(point.clone()):new T.Vector3(0,0,0);
  if(local.x<-.2){if(page>0){page--;turn(sheets[page],0)}else{opened=false;turn(lid,0)}}
  else if(page<sheets.length){turn(sheets[page],Math.PI);page++}
 };
 return {update(){
  const focused=room.userData.currentFocus==='日记本';
  if(reading!==focused){reading=focused;for(const page of pageFaces)page.face.material=reading?page.original:page.ambient;}
  if(tween){const t=Math.min(1,(performance.now()-tween.start)/650);tween.object.rotation.z=T.MathUtils.lerp(tween.from,tween.to,t*t*(3-2*t));if(t===1)tween=null}
  // The open cover rests below the left stack. Turned leaves stack in reverse order.
  lid.position.y=T.MathUtils.lerp(.089,.007,lid.rotation.z/Math.PI);
  sheets.forEach((sheet,i)=>{sheet.position.y=T.MathUtils.lerp(.079-i*.0037,.022+i*.0037,sheet.rotation.z/Math.PI)});
 },dispose(){disposed=true;geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());delete book.userData.onActivate}};
}
