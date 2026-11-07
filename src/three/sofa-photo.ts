import * as T from 'three';
import photoUrl from '../assets/sofa-memory.jpg';
import {playRoomSound} from '../lib/prototype-sound';
export function setupSofaPhoto(room:T.Group){
 const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=638;
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 const image=new Image();image.onload=()=>{const c=canvas.getContext('2d')!;c.save();c.translate(0,638);c.rotate(-Math.PI/2);c.drawImage(image,0,0,638,2048);c.restore();texture.needsUpdate=true};image.src=photoUrl;
 const group=new T.Group();group.name='Prop_Sofa_Photo';group.position.set(0,.49,-1.66);group.rotation.set(-.12,0,-.10);group.userData.editable=true;group.userData.label='沙发缝里的照片';room.add(group);
 const geo=new T.BoxGeometry(.15,.045,.003);const material=new T.MeshStandardMaterial({map:texture,roughness:.85});group.add(new T.Mesh(geo,material));
 const hitGeo=new T.BoxGeometry(.23,.10,.08),hitMat=new T.MeshBasicMaterial({colorWrite:false,depthWrite:false});group.add(new T.Mesh(hitGeo,hitMat));
 const overlay=document.createElement('div');overlay.hidden=true;overlay.dataset.readingHint='5年前我们都还不是社畜';overlay.style.cssText='position:fixed;inset:0;z-index:180;background:#0008;place-items:center;cursor:pointer;';
 const display=document.createElement('canvas');display.width=2048;display.height=638;display.style.cssText='width:min(82vw,1100px,160vh);height:auto;transform:rotate(-10deg);box-shadow:0 16px 50px #0008;';overlay.append(display);document.body.append(overlay);
 const close=()=>{overlay.hidden=true;overlay.style.display='none'};overlay.addEventListener('click',close);const key=(e:KeyboardEvent)=>{if(e.key==='Escape')close()};window.addEventListener('keydown',key);
 group.userData.onActivate=()=>{if(room.userData.editMode)return;display.getContext('2d')!.drawImage(canvas,0,0);overlay.hidden=false;overlay.style.display='grid';display.animate([{transform:'translateY(100px) rotate(-10deg) scale(.65)',opacity:0},{transform:'translateY(-9px) rotate(-10deg) scale(1.025)',opacity:1},{transform:'translateY(0) rotate(-10deg) scale(1)',opacity:1}],{duration:500,easing:'ease-out'});room.userData.easterAction?.('film');playRoomSound('paper')};group.traverse(o=>o.userData.root=group);
 return()=>{close();overlay.remove();window.removeEventListener('keydown',key);image.onload=null;group.removeFromParent();geo.dispose();hitGeo.dispose();hitMat.dispose();material.dispose();texture.dispose()};
}
