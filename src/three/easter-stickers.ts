import {suitcaseFinale} from './suitcase-finale';
import sheet1 from '../assets/sticker-sheet-1.png';
import sheet2 from '../assets/sticker-sheet-2.png';
import sheet3 from '../assets/sticker-sheet-3.png';
import * as T from 'three';
import {playRoomSound} from '../lib/prototype-sound';

export function setupEasterStickers(room:T.Group){
 const suitcase=room.getObjectByName('Silver_Suitcase')!;
 const finale=suitcaseFinale(room,suitcase);room.userData.runFinale=finale.update;
 const keys=['cat','note','flowers','candle','book','film'];
 const viewedPhotos=new Set<string>();room.userData.easterPhotoViewed=(id:string)=>{viewedPhotos.add(id);const photos=room.children.filter(o=>o.userData.hangingPhoto);if(photos.length&&photos.every(o=>viewedPhotos.has(o.name)))room.userData.easterAction('film')};
 const unlocked=new Set<string>();let pets=0;
 const materials:T.Material[]=[],textures:T.Texture[]=[],geometries:T.BufferGeometry[]=[];
 const badges:T.Group[]=[];const images:HTMLImageElement[]=[];let disposed=false;
 // Paths follow each supplied die-cut edge; retain the original artwork and white border.
 const artwork=[
 {src:sheet2,path:'M641 147 Q643 124 671 130 L716 169 L765 169 L810 132 Q835 120 840 150 L854 223 Q885 223 884 246 L878 262 Q891 283 879 304 L840 315 L859 449 Q874 490 841 495 L599 495 Q583 493 568 475 L546 447 L542 396 Q543 380 558 366 L584 341 Q597 330 619 338 L637 341 L649 319 L622 309 Q597 318 597 292 L600 267 Q589 241 607 229 L623 226 Z'},
 {src:sheet3,path:'M1191 560 Q1208 544 1227 556 L1235 565 Q1250 544 1266 552 Q1287 556 1279 579 L1260 602 L1272 622 L1254 649 L1295 649 Q1318 647 1317 687 L1335 687 Q1356 689 1374 710 L1368 814 Q1366 832 1346 846 L1298 850 L1294 891 Q1293 914 1272 914 L1160 914 Q1140 912 1138 889 L1117 676 Q1114 651 1140 649 L1168 649 L1188 620 L1177 605 Q1166 588 1191 560 Z'},
 {src:sheet2,path:'M231 216 L236 186 L270 151 Q280 143 294 144 L333 144 Q346 144 357 156 L380 178 L390 214 L427 214 Q440 214 451 225 L477 248 L489 301 Q493 316 483 333 L458 362 L423 373 L447 399 L445 435 Q444 448 430 460 L399 483 Q390 490 376 486 L335 484 L309 463 L283 483 L226 489 Q212 487 202 472 L181 443 L169 404 L174 377 L151 364 Q139 359 133 341 L126 316 L136 276 Q140 261 154 248 L182 222 Q192 213 208 216 Z'},
 {src:sheet1,path:'M601 708 L691 650 L700 632 L729 606 Q741 585 760 591 L797 571 Q812 557 829 572 L859 611 L869 633 L943 700 Q950 708 949 724 L949 887 Q947 909 924 909 L616 909 Q595 908 594 887 L594 729 Q594 714 601 708 Z'},
 {src:sheet2,path:'M172 675 Q170 656 190 651 Q270 632 342 674 Q416 632 494 650 Q515 655 513 675 L530 685 Q542 694 542 715 L542 878 Q542 896 522 898 L381 898 Q372 914 351 911 L321 911 Q305 909 300 898 L163 898 Q141 896 141 873 L141 712 Q142 687 172 675 Z'},
 {src:sheet2,path:'M996 236 L1418 236 Q1443 236 1444 260 L1444 402 Q1444 428 1419 428 L995 428 Q970 428 970 403 L970 262 Q970 236 996 236 Z'}
 ];
 keys.forEach((key,i)=>{
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d')!;
  const sourcePath=new Path2D(artwork[i].path);
  // Fit source-coordinate contours without stretching their proportions.
  const bounds=[[540,124,354,374],[1110,544,270,376],[120,138,378,358],[588,555,368,360],[135,630,414,288],[964,230,488,204]][i];
  const [x,y,w,h]=bounds,k=224/Math.max(w,h),dx=(256-w*k)/2-x*k,dy=(256-h*k)/2-y*k;
  const outline=new Path2D();outline.addPath(sourcePath,new DOMMatrix([k,0,0,k,dx,dy]));
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;textures.push(map);
  const img=new Image();images.push(img);img.onload=()=>{if(disposed)return;c.save();c.clip(outline);c.setTransform(k,0,0,k,dx,dy);c.drawImage(img,0,0,1536,1024);c.restore();map.needsUpdate=true};img.src=artwork[i].src;
  const m=new T.MeshStandardMaterial({map,transparent:true,roughness:.8,emissive:0xffdb8c,emissiveMap:map,emissiveIntensity:0});materials.push(m);
  const badge=new T.Group();badge.name='Easter_Sticker_'+key;badge.userData.editable=true;badge.userData.sticker=true;badge.userData.label=['小猫贴纸','陶瓷杯贴纸','花朵贴纸','蛋糕贴纸','书本贴纸','胶片贴纸'][i];badge.position.set(i%2? .115:-.115,.56-Math.floor(i/2)*.19,.159);badge.rotation.z=i%2?-.08:.08;suitcase.add(badge);badges.push(badge);
  const geo=new T.PlaneGeometry(.19*2/3,.19*2/3);geometries.push(geo);badge.add(new T.Mesh(geo,m));
  const shine=document.createElement('canvas');shine.width=shine.height=256;const sc=shine.getContext('2d')!;sc.strokeStyle='#fff1ab';sc.lineWidth=4;sc.lineJoin='round';sc.shadowColor='#ffbd3d';sc.shadowBlur=20;sc.stroke(outline);sc.stroke(outline);
  const shineMap=new T.CanvasTexture(shine);shineMap.colorSpace=T.SRGBColorSpace;textures.push(shineMap);
  const glow=new T.MeshBasicMaterial({map:shineMap,transparent:true,opacity:0,depthWrite:false,toneMapped:false});materials.push(glow);
  const ring=new T.Mesh(geo,glow);ring.position.z=.002;badge.add(ring);
  const starGeo=new T.PlaneGeometry(.028*2/3,.028*2/3);geometries.push(starGeo);
  const starCanvas=document.createElement('canvas');starCanvas.width=starCanvas.height=64;const s=starCanvas.getContext('2d')!;s.fillStyle='#fff9d7';s.shadowColor='#ffc44d';s.shadowBlur=8;s.beginPath();s.moveTo(32,2);s.lineTo(38,25);s.lineTo(62,32);s.lineTo(38,39);s.lineTo(32,62);s.lineTo(25,39);s.lineTo(2,32);s.lineTo(25,25);s.closePath();s.fill();const starMap=new T.CanvasTexture(starCanvas);textures.push(starMap);
  const starMat=new T.MeshBasicMaterial({map:starMap,transparent:true,depthWrite:false,toneMapped:false});materials.push(starMat);
  const stars=[[-.055,.055],[.055,.025],[.02,-.055]].map(([x,y])=>{const star=new T.Mesh(starGeo,starMat);star.position.set(x*2/3,y*2/3,.004);badge.add(star);return star});
  badge.userData.update=(time:number)=>{const done=unlocked.has(key);m.emissiveIntensity=done?.28:0;glow.opacity=done?.55+.45*Math.sin(time*3+i)**2:0;stars.forEach((star,j)=>{star.visible=done;star.scale.setScalar(.45+.85*Math.sin(time*3+i+j*1.9)**4);star.rotation.z=time*.35+j})};
  badge.traverse(o=>o.userData.root=suitcase);
 });
 room.userData.easterAction=(key:string)=>{if(key==='cat'&&++pets<2)return;if(!keys.includes(key)||unlocked.has(key))return;unlocked.add(key);playRoomSound('reward');if(unlocked.size===keys.length)room.userData.finalePending=true};
 room.userData.updateEasterStickers=(time:number)=>badges.forEach(b=>b.userData.update(time));
 return ()=>{disposed=true;finale.dispose();images.forEach(img=>img.onload=null);badges.forEach(b=>b.removeFromParent());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());geometries.forEach(g=>g.dispose());delete room.userData.easterPhotoViewed;delete room.userData.easterAction;delete room.userData.updateEasterStickers};
}
