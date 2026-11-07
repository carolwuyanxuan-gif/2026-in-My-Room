import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import girlFigure from '../assets/figurine-0.glb';
import catFigure from '../assets/figurine-1.glb';
import * as T from 'three';
import p1 from '../assets/poster-1.png';
import p2 from '../assets/poster-2.jpg';
import p3 from '../assets/poster-3.jpg';
import p4 from '../assets/poster-4.jpg';
import p5 from '../assets/poster-5.jpg';
export function setupPosterScreen(room:T.Group){
 const group=new T.Group();group.name='Prop_Poster_Screen';group.position.set(-2.40,1.76,-1.62);group.rotation.y=Math.PI/4;room.add(group);
 group.userData.editable=true;group.userData.label='电影海报电子屏';
 const body=new T.Group();body.rotation.x=-.13;group.add(body);
 const casing=new T.MeshStandardMaterial({color:0x303331,roughness:.55,metalness:.25});const geo=new T.BoxGeometry(.29,.43,.027);const frame=new T.Mesh(geo,casing);frame.position.y=.215;frame.castShadow=true;body.add(frame);
 group.userData.focusDirection=new T.Vector3(-.28,.24,1).normalize();
 const canvas=document.createElement('canvas');canvas.width=640;canvas.height=960;const ctx=canvas.getContext('2d')!;const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
 const material=new T.MeshBasicMaterial({map:texture,toneMapped:false,color:0xbcbcbc});const faceGeo=new T.PlaneGeometry(.266,.399);const screen=new T.Mesh(faceGeo,material);screen.position.set(0,.215,.0145);body.add(screen);
 let disposed=false,current=0,powered=false;const images:HTMLImageElement[]=[];
 const figures:T.Group[]=[];
 const releaseFigure=(model:T.Group)=>{model.traverse(node=>{if(node instanceof T.Mesh){node.geometry.dispose();for(const mat of [node.material].flat()){for(const value of Object.values(mat))if(value instanceof T.Texture)value.dispose();mat.dispose()}}})};
 for(const [url,name,label,x,height] of [[girlFigure,'Shelf_Girl_Figure','女孩手办',-.135,.17],[catFigure,'Shelf_Cat_Figure','小猫手办',.14,.12]] as const){
  const figure=new T.Group();figure.name=name;figure.position.set(x,0,.095);group.add(figure);
  figure.userData.editable=true;figure.userData.label=label;figure.userData.focusDistance=.88;
  figure.userData.focusDirection=new T.Vector3(-.42,.12,1).normalize();
  figure.userData.onActivate=()=>{room.userData.focusProp?.(figure,label);window.dispatchEvent(new CustomEvent('room-hint',{detail:name==='Shelf_Girl_Figure'?'我是恶女，别来沾边':'把夜猫子都变成猫'}))};
  new GLTFLoader().load(url,gltf=>{
   const model=gltf.scene;if(disposed){releaseFigure(model);return}
   const bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3());
   model.scale.setScalar(Math.min(height/size.y,.14/size.x,.14/size.z));bounds.setFromObject(model);
   const center=bounds.getCenter(new T.Vector3());model.position.set(-center.x,-bounds.min.y,-center.z);
   model.traverse(node=>{node.userData.root=figure});figure.add(model);figures.push(model);
  });
 }
 material.color.setHex(0x000000);
 group.userData.setScreenOn=(on:boolean)=>{powered=on;material.color.setHex(on?0xbcbcbc:0x000000);if(on){current=0;draw()}};
 function draw(){ctx.fillStyle='#000';ctx.fillRect(0,0,640,960);const img=images[current];if(img?.naturalWidth){const ratio=Math.min(640/img.naturalWidth,960/img.naturalHeight),w=img.naturalWidth*ratio,h=img.naturalHeight*ratio;ctx.drawImage(img,(640-w)/2,(960-h)/2,w,h)}texture.needsUpdate=true}
 [p1,p2,p3,p4,p5].forEach((src,i)=>{const img=new Image();images[i]=img;img.onload=()=>{if(!disposed&&current===i)draw()};img.src=src});draw();
 let nextSlideAt=performance.now()+6000;const timer=setInterval(()=>{if(document.hidden||!powered||performance.now()<nextSlideAt)return;nextSlideAt=performance.now()+6000;current=(current+1)%images.length;draw()},500);
 group.userData.onActivate=(point?:T.Vector3)=>{if(room.userData.editMode)return;if(room.userData.currentFocus!=='电影海报'){room.userData.focusProp?.(group,'电影海报');return}if(point){current=(current+(body.worldToLocal(point.clone()).x<0?-1:1)+images.length)%images.length;nextSlideAt=performance.now()+6000;draw()}};group.traverse(o=>o.userData.root=group);
 return ()=>{disposed=true;figures.forEach(releaseFigure);clearInterval(timer);images.forEach(i=>i.onload=null);group.removeFromParent();geo.dispose();faceGeo.dispose();casing.dispose();material.dispose();texture.dispose()};
}
