import * as T from 'three';
import {playRoomSound} from '../lib/prototype-sound';
const message=['感谢你能看到这里，我常常觉得自己的内心有一个很大的花园，我常常在里面自娱自乐，或者是一头扎进孤独里无法挣脱。谢谢你我的朋友，是你叩响了门铃。','阳光撒进花园的时候，欢迎你再来做客。'];
export function suitcaseFinale(room:T.Group, suitcase:T.Object3D){
 const hinge=suitcase.getObjectByName('CaseHinge')!;
 const balloon=new T.Group();balloon.visible=false;room.add(balloon);
 const red=new T.MeshStandardMaterial({color:0xe92d32,roughness:.28});
 const bulb=new T.Mesh(new T.SphereGeometry(.19,32,24),red);bulb.scale.y=1.26;balloon.add(bulb);
 const knot=new T.Mesh(new T.ConeGeometry(.022,.04,12),red);knot.position.y=-.244;balloon.add(knot);
 const line=new T.Mesh(new T.CylinderGeometry(.003,.003,.57,8),new T.MeshStandardMaterial({color:0xd4bd96}));line.position.y=-.535;balloon.add(line);
 const canvas=document.createElement('canvas');canvas.width=720;canvas.height=460;const c=canvas.getContext('2d')!;c.fillStyle='#fff2d8';c.fillRect(0,0,720,460);c.strokeStyle='#af7962';c.strokeRect(15,15,690,430);c.fillStyle='#564739';c.font='26px serif';let y=68;for(const paragraph of message){let row='';for(const char of paragraph){if(c.measureText(row+char).width>630){c.fillText(row,43,y);row='';y+=42}row+=char}c.fillText(row,43,y);y+=60}
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 const card=new T.Mesh(new T.PlaneGeometry(.24,.153),new T.MeshStandardMaterial({map:texture,side:T.DoubleSide}));card.position.set(-.015,-.82,0);card.rotation.z=-.07;balloon.add(card);
 const dialog=document.createElement('dialog');dialog.style.cssText='max-width:min(80vw,480px);max-height:76dvh;background:#fff2d8;color:#564739;padding:1.5em;border:2px solid #af7962;font:20px/1.7 RoomHintHand,serif';for(const text of message){const p=document.createElement('p');p.textContent=text;dialog.append(p)}document.body.append(dialog);dialog.onclick=()=>dialog.close();balloon.userData.onActivate=()=>{if(!dialog.open)dialog.showModal()};balloon.traverse(o=>o.userData.root=balloon);
 let start=-1;const origin=new T.Vector3();
 return {update(time:number){if(start<0){start=time;playRoomSound('switch');suitcase.updateWorldMatrix(true,true);for(const child of [...suitcase.children])if(child.userData.sticker)hinge.attach(child);origin.copy(room.worldToLocal(suitcase.localToWorld(new T.Vector3(0,.4,.1))))}
 const t=time-start;hinge.rotation.y=-Math.PI/180*35*T.MathUtils.smoothstep(t,0,3.2);const rise=T.MathUtils.smoothstep(t,3,13.3);balloon.visible=rise>0;balloon.scale.setScalar(T.MathUtils.smoothstep(t,3,5));balloon.position.copy(origin);balloon.position.x+=rise*.75;balloon.position.y+=rise*(2.22-origin.y)+.025*rise*Math.sin(t*1.4);},dispose(){dialog.remove();balloon.removeFromParent();for(const obj of [bulb,knot,line,card])obj.geometry.dispose();red.dispose();line.material.dispose();card.material.dispose();texture.dispose()}};
}
