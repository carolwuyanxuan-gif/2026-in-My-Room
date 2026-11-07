import * as T from 'three';
import {playRoomSound} from '../lib/prototype-sound';
export function createRoomEntrance(scene:T.Scene,room:T.Group,camera:T.PerspectiveCamera,renderer:T.WebGLRenderer,viewTarget:T.Vector3){
 const lamps=['Sofa_Floor_Lamp','Prop_Lamp','Prop_Photo_Spotlight'].map(n=>room.getObjectByName(n)).filter(Boolean) as T.Object3D[];
 lamps.forEach(l=>l.userData.lightOn=false);
 const city=scene.getObjectByName('City_HighFloor_View');const cityMaterials=new Map<T.Material,{color?:T.Color,emissive?:T.Color}>();city?.traverse(o=>{if(o instanceof T.Mesh)for(const m of(Array.isArray(o.material)?o.material:[o.material]))if(!cityMaterials.has(m))cityMaterials.set(m,{color:m.color?.clone(),emissive:m.emissive?.clone()})});
 const outside=(level:number)=>{cityMaterials.forEach((original,material)=>{const m=material as T.MeshStandardMaterial;if(original.color)m.color.copy(original.color).multiplyScalar(level);if(original.emissive)m.emissive.copy(original.emissive).multiplyScalar(level)})};outside(.2);
 const normalExposure=renderer.toneMappingExposure;room.userData.entranceLightProgress=0;
 let approached=true,litAt=Infinity,finished=false;
 const ring=document.createElement('button');ring.className='entrance-lamp-ring';ring.setAttribute('aria-label','打开落地灯');ring.hidden=true;renderer.domElement.parentElement!.append(ring);
 const frameNumber=(o:T.Object3D)=>Number(o.name.replace('Memory_Frame_',''));
 const zones=[
  room.children.filter(o=>o.name.startsWith('Photo_Cord_')||(o.name.startsWith('Memory_Frame_')&&frameNumber(o)>=9)).map(o=>o.name),
  ['Prop_Display_Plate','Prop_Display_Cup','Prop_Ceramic_Note','Prop_Poster_Screen','Prop_Shelf_Books'],
  ['Silver_Suitcase'],
  ['Imported_Round_Desk','Prop_Vase','Prop_Calendar'],
  ['Prop_Cake','Prop_Envelope','Prop_Cup','Prop_Journal'],
  room.children.filter(o=>o.name.startsWith('Memory_Frame_')&&frameNumber(o)<9).map(o=>o.name),
  ['Prop_Monstera'],
  ['Laptop','Prop_Pocket_Notebook','Prop_Yellow_Notebook','Prop_Lamp','Prop_Cat']
 ];
 const names=zones.flat();
 const props=names.map(n=>room.getObjectByName(n)).filter(Boolean).map(o=>({object:o!,scale:o!.scale.clone(),visible:o!.visible,started:false,done:false}));
 // Keep lights registered while their visible props wait for their entrance.
 const anchoredLights:{light:T.Light,parent:T.Object3D,position:T.Vector3}[]=[];
 props.forEach(p=>p.object.traverse(o=>{if(o instanceof T.Light&&o.parent)anchoredLights.push({light:o,parent:o.parent,position:o.position.clone()})}));
 anchoredLights.forEach(a=>room.attach(a.light));
 const syncLights=()=>{room.updateWorldMatrix(true,false);anchoredLights.forEach(a=>{a.parent.updateWorldMatrix(true,false);a.light.position.copy(a.position);a.parent.localToWorld(a.light.position);room.worldToLocal(a.light.position)})};
 props.forEach(p=>{p.object.visible=false;p.object.userData.setScreenOn?.(false)});
 const batches=new Map<string,number>();const sounded=new Set<number>();
 const slots=props.map(p=>{const name=p.object.name;const key=name.startsWith('Photo_Cord_')?(name.includes('2.03')?'Memory_Frame_9':'Memory_Frame_13'):name==='Prop_Ceramic_Note'?'Prop_Display_Plate':name;if(!batches.has(key))batches.set(key,batches.size);return batches.get(key)!});
 // Retain quick arrivals within a zone, with a pause after its final bounce.
 const starts=new Map<number,number>();let nextStart=0;
 for(const zone of zones){const zoneSlots=[...new Set(props.map((p,i)=>zone.includes(p.object.name)?slots[i]:-1).filter(i=>i>=0))];zoneSlots.forEach((slot,i)=>starts.set(slot,nextStart+i*468.75));if(zoneSlots.length)nextStart+=(zoneSlots.length-1)*468.75+800;}
 const endCamera=camera.position.clone(),cameraOffset=endCamera.clone().sub(viewTarget),upAxis=new T.Vector3(0,1,0);
 const entranceDuration=3100+Math.max(...starts.values())+500;
 const turnCamera=(progress:number)=>{const eased=progress*progress*(3-2*progress);camera.position.copy(cameraOffset).applyAxisAngle(upAxis,T.MathUtils.degToRad(12)*(1-eased)).add(viewTarget);camera.lookAt(viewTarget)};
 const approach=()=>{approached=true};window.addEventListener('room-lamp-ready',approach);
 ring.onclick=e=>{e.stopPropagation();if(litAt!==Infinity)return;litAt=performance.now();ring.hidden=true;lamps[0].userData.lightOn=true;if(lamps[2])lamps[2].userData.lightOn=true;window.dispatchEvent(new Event('room-enter'));window.dispatchEvent(new CustomEvent('room-sound',{detail:'switch'}));window.dispatchEvent(new Event('room-entrance-lit'))};
 ring.onpointerdown=e=>e.stopPropagation();ring.onpointerup=e=>e.stopPropagation();
 return {update(){if(finished)return;syncLights();
  if(litAt===Infinity){turnCamera(0);lamps.forEach(l=>l.userData.lightOn=false);if(approached&&lamps[0]){const lamp=lamps[0];lamp.updateWorldMatrix(true,false);const point=lamp.localToWorld(new T.Vector3(0,1.65,0)).project(camera);const rect=renderer.domElement.getBoundingClientRect(),host=renderer.domElement.parentElement!.getBoundingClientRect();ring.style.left=(rect.left-host.left+(point.x+1)*rect.width/2)+'px';ring.style.top=(rect.top-host.top+(1-point.y)*rect.height/2)+'px';ring.hidden=false}return}
  const elapsed=performance.now()-litAt;turnCamera(T.MathUtils.clamp(elapsed/entranceDuration,0,1));room.userData.entranceLightProgress=T.MathUtils.smoothstep(elapsed,0,3000);renderer.toneMappingExposure=T.MathUtils.lerp(.32,normalExposure,room.userData.entranceLightProgress);outside(.2+.8*T.MathUtils.smoothstep(elapsed,0,3000));if(elapsed<3000&&lamps[0]?.userData.lightOn)lamps[0].userData.setRoomLight?.(T.MathUtils.smoothstep(elapsed,0,3000));
  props.forEach((p,i)=>{const slot=slots[i],local=elapsed-3100-starts.get(slot)!;if(local<0||p.done)return;if(!p.started){p.scale.copy(p.object.scale);p.started=true;p.object.visible=p.visible;p.object.userData.setScreenOn?.(true);if(!sounded.has(slot)){sounded.add(slot);playRoomSound('pop')}}const t=T.MathUtils.clamp(local/450,0,1);const s=t===1?1:1-Math.pow(2,-8*t)*Math.cos(t*Math.PI*3.5);p.object.scale.copy(p.scale).multiplyScalar(Math.max(.001,s));p.object.scale.y*=1+.09*Math.sin(t*Math.PI*2)*(1-t);if(t===1)p.done=true});
  if(props.every(p=>p.done)){camera.position.copy(endCamera);camera.lookAt(viewTarget);delete room.userData.entranceLightProgress;outside(1);anchoredLights.forEach(a=>{a.parent.add(a.light);a.light.position.copy(a.position)});finished=true;window.dispatchEvent(new Event('room-entrance-done'))}
 },dispose(){anchoredLights.forEach(a=>{a.parent.add(a.light);a.light.position.copy(a.position)});window.removeEventListener('room-lamp-ready',approach);ring.remove();props.forEach(p=>{p.object.scale.copy(p.scale);p.object.visible=p.visible})}};
}
