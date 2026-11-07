import * as T from 'three';
import {wrapBookText} from '../lib/book-text';
import {ideasText} from './ideas-content';
import {playRoomSound} from '../lib/prototype-sound';
import fontUrl from '../assets/note-handwriting.ttf';
import drawingUrl from '../assets/ideas-childhood-trees.jpg';

export function setupIdeasBook(room:T.Group,host:HTMLElement){
 const drawer=room.getObjectByName('Olive_Cabinet')?.children.find(o=>o.name.startsWith('Top_Drawer_'));
 if(!drawer)return ()=>{};
 const entries=ideasText.split(/^[ \t]*\*[ \t]*/m).map(s=>s.trim().replace(/\\-/g,'－')).filter(Boolean);
 const book=new T.Group();book.name='Drawer_Ideas_Book';book.position.set(.3645,.534,.32);drawer.add(book);
 const cover=new T.MeshStandardMaterial({color:0x386ca3,roughness:.85}),paper=new T.MeshStandardMaterial({color:0xfff9ed,roughness:1});
 const geometries:T.BufferGeometry[]=[],materials:T.Material[]=[cover,paper];
 function box(w:number,h:number,d:number,y:number,m:T.Material){const g=new T.BoxGeometry(w,h,d);geometries.push(g);const mesh=new T.Mesh(g,m);mesh.position.y=y;book.add(mesh)}
 box(.25,.003,.32,0,cover);box(.239,.014,.307,.008,paper);box(.25,.003,.32,.017,cover);
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=640;const c=canvas.getContext('2d')!;c.fillStyle='#386ca3';c.fillRect(0,0,512,640);c.fillStyle='white';c.textAlign='center';c.font='74px Georgia';c.fillText('ideas',256,255);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 const titleMat=new T.MeshStandardMaterial({map:texture,roughness:.85});materials.push(titleMat);const g=new T.PlaneGeometry(.25,.32);geometries.push(g);const face=new T.Mesh(g,titleMat);face.rotation.x=-Math.PI/2;face.position.y=.0186;book.add(face);
 const overlay=document.createElement('div');overlay.hidden=true;overlay.className='ideas-overlay';
 const style=document.createElement('style');style.textContent=`.ideas-overlay{position:absolute;inset:0;z-index:80;background:#1119;display:flex;align-items:center;justify-content:center;overflow:hidden}.ideas-overlay[hidden]{display:none}.ideas-fixed-book{display:block;width:min(94vw,128.57vh,1100px);height:auto;max-width:94%;box-shadow:0 16px 60px #0007;cursor:pointer;touch-action:manipulation}.ideas-fixed-book.turning{animation:ideasTurn .3s ease}@keyframes ideasTurn{50%{transform:perspective(1600px) rotateY(-6deg);opacity:.7}}`;
 const reader=document.createElement('canvas');reader.width=1000;reader.height=700;reader.className='ideas-fixed-book';reader.setAttribute('role','dialog');reader.setAttribute('aria-label','ideas，点击右页向后翻，左页向前翻，点击书外合上');
 overlay.append(reader);host.append(style,overlay);
 const ctx=reader.getContext('2d')!;
 let page=-1,disposed=false;
 type PageItem={text?:string;y:number;height?:number};
 const spreads:PageItem[][][]=[];
 const drawing=new Image();
 const drawingReady=new Promise<void>(resolve=>{drawing.onload=()=>resolve();drawing.onerror=()=>resolve();drawing.src=drawingUrl});
 // Fixed larger type; fill each page before continuing, with each entry on a new page.
 function paginate(){
  spreads.length=0;ctx.font='32px IdeasBookHand, KaiTi, cursive';
  // The inside front cover stays blank; the first entry starts on the right.
  const pages:PageItem[][]=[[]];
  for(const entry of entries){
   let items:PageItem[]=[],y=74;
   const newPage=()=>{pages.push(items);items=[];y=74};
   const paragraphs=entry.replace(/\r/g,'').split(/\n+/).map(p=>p.trim()).filter(Boolean);
   if(paragraphs.length&&!paragraphs[0].startsWith('·'))paragraphs[0]='· '+paragraphs[0];
   for(const paragraph of paragraphs){
    const lines=wrapBookText(paragraph,text=>ctx.measureText(text).width,410);
    for(const text of lines){if(y>618)newPage();items.push({text,y});y+=44}
    y+=8;
   }
   if(entry.includes('小时候画画很抽象')&&drawing.naturalWidth){
    const height=410*drawing.naturalHeight/drawing.naturalWidth;
    if(y+height>630)newPage();
    items.push({y,height});
   }
   if(items.length)pages.push(items);
  }
  for(let i=0;i<pages.length;i+=2)spreads.push([pages[i],pages[i+1]??[]]);
 }
 function render(){
  overlay.dataset.readingHint=page<0?'点击封面，翻开这本书':'翻翻看吧';
  ctx.clearRect(0,0,1000,700);ctx.fillStyle='#386ca3';
  reader.style.boxShadow='none';reader.style.filter='drop-shadow(0 16px 24px #0007)';
  if(page<0){ctx.fillRect(500,0,500,700);ctx.fillStyle='white';ctx.textAlign='center';ctx.font='76px Georgia';ctx.fillText('ideas',750,320);return}
  ctx.fillRect(0,0,1000,700);
  ctx.fillStyle='#fff9ed';ctx.fillRect(10,10,980,680);
  const shadow=ctx.createLinearGradient(480,0,520,0);shadow.addColorStop(0,'#fff9ed');shadow.addColorStop(.5,'#b8ac96');shadow.addColorStop(1,'#fff9ed');ctx.fillStyle=shadow;ctx.fillRect(480,10,40,680);
  ctx.fillStyle='#403b35';ctx.font='32px IdeasBookHand, KaiTi, cursive';ctx.textAlign='left';ctx.textBaseline='alphabetic';
  spreads[page]?.forEach((items,side)=>items.forEach(item=>{
   if(item.text!==undefined)ctx.fillText(item.text,side*500+44,item.y);
   else if(item.height)ctx.drawImage(drawing,side*500+44,item.y,410,item.height);
  }));
  ctx.font='16px Georgia';ctx.fillStyle='#998b77';ctx.textAlign='center';
  if(page>0)ctx.fillText(String(page*2),250,664);
  ctx.fillText(String(page*2+1),750,664);
 }
 const font=new FontFace('IdeasBookHand',`url(${fontUrl})`);
 const ready=Promise.all([font.load().then(loaded=>{if(!disposed)document.fonts.add(loaded)}).catch(()=>{}),drawingReady]).then(()=>{if(!disposed){paginate();render()}});
 function turn(delta:number){const next=Math.max(-1,Math.min(spreads.length-1,page+delta));if(next===page)return;page=next;playRoomSound('paper');render();reader.classList.remove('turning');void reader.offsetWidth;reader.classList.add('turning')}
 function shut(){overlay.hidden=true;playRoomSound('paper')}
 reader.onclick=e=>{e.stopPropagation();const bounds=reader.getBoundingClientRect();const right=e.clientX>=bounds.left+bounds.width/2;if(page<0&&!right){shut();return}turn(right?1:-1)};
 overlay.onpointerdown=e=>e.stopPropagation();overlay.onpointerup=e=>e.stopPropagation();overlay.onclick=e=>{if(e.target===overlay)shut()};
 const key=(e:KeyboardEvent)=>{if(overlay.hidden)return;if(['Escape','ArrowLeft','ArrowRight'].includes(e.key)){e.stopImmediatePropagation();e.preventDefault();if(e.key==='Escape')shut();else turn(e.key==='ArrowLeft'?-1:1)}};window.addEventListener('keydown',key,true);
 book.userData.onActivate=async()=>{if(room.userData.editMode)return;await ready;if(disposed)return;overlay.hidden=false;room.userData.easterAction?.('book');page=-1;render();playRoomSound('paper')};book.traverse(o=>o.userData.root=book);
 return ()=>{disposed=true;window.removeEventListener('keydown',key,true);overlay.remove();style.remove();book.removeFromParent();texture.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose())};
}
