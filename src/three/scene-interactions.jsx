import * as T from 'three';
import {createRoot} from 'react-dom/client';
import {useEffect,useRef,useState} from 'react';
import {CSS3DObject,CSS3DRenderer} from 'three/addons/renderers/CSS3DRenderer.js';
import FlipCard from '../components/FlipCard';
import {wallPhotoBacks} from './wall-photo-backs';
import {wallPhotos} from './wall-photos';
import seventhBackExtra from '../assets/wall-photo-back-7-cheers.jpg';
import firstBackExtra from '../assets/wall-photo-back-1-extra.jpg';
import fifthBackExtra from '../assets/wall-photo-back-5-extra.jpg';

const photoCaptions=[
 '0202 在靖港凌冲村，中医馆小分队向小卖部前进',
 '0213 在景德镇陶艺店里，老板一家携狗猫一家向我们告别',
 '0525 在青岛理工校门口，但不说再见',
 '0807 在长沙工作室，忘崽小猫朝朝',
 '0721 在新疆（风味菜馆），504合影',
 '0802 在郴州党校，我们和最有眼光的老师',
 '0722 在万隆理工，第四小组最后的合影'
];

const photoStories=[
 '仨人每天在一个房间里叽叽咕咕的不知道说了多少话。也不知道是什么让我们产生了深刻的联结，能够互相关心，能够共情彼此的境遇。遇见你们，让我变得更加勇敢，更加专注，更加想要去探索去表达。\n希望下一次相见的时候，我们都熬过一个个苦恼的时刻。\n那是轻舟已过万重山的时候。',
 '打牌到大半夜，从uno打到扑克牌接龙，太可怕的从来不知道接龙这么无聊的游戏还能玩得如此惊心动魄，妙趣横生，当晚诞生了好几辆推土机，当然肯定不是我，因为我都是第一个死的。\n不过后面几天，大家没日没夜通宵达旦地在老厂画陶瓷，回来以后再也打不动牌了。我高考要是能有这么努力就好了......',
 '青岛怎么是一个这么好的地方呢，让我收获了那么多知识，带给我现阶段学习生活了非常大的底气；让我收获了那么多不同的同学朋友，能交流天南地北的见闻。以后我也一定会再回来的！\n还有，第一次在青岛以外的城市见到你们，连长沙的雨都能恰好撤离，下次我要把电动车充满电，带你们去吃更好吃的饭店，不留一点遗憾',
 '0429 朝朝第一次来到我们工作室，开启了我和这群小猫特别是她的孽缘，接下来的每一天，我都被她牵动心弦：从发现她怀孕，生崽，到消失，又回来，这只身世成谜的小猫轻松把我拿捏了......感谢后湖所有照顾小猫的人，当然也以同样的力度鄙视不给猫做绝育就散养的人(￢-￢☆)',
 '特别温暖的室友们。再狼狈地归来，都能在寝室脱下层层疲倦，被治愈成原样。\n我想到好多时刻，想到我们一起骑车去吃饭，去KTV，去后湖；乘着地铁去新校区；想到总有人默默在大家桌上放上好吃的；想到大家分享自己在工作室实验室里全然不同的生活；想到小心放低声的音调......看到每个人我都能想起很多时刻很多事情，让我开心让我感动，让我感觉获得了平凡的幸福。',
 '随口一句“要不我们去夜爬苏仙岭吧”，造就三个笨蛋从天亮爬到天黑，爬的面红耳赤大汗淋漓气喘吁吁，大腿和小腿兼痛。还好吃到了最美味的泡萝卜，看到了最美丽的城市夜景。\n想到我们同门三人总是经历各种磨难，工作室里活计颇多课程那边也急得不行，但最后总是能转危为安，获得一个好的结果，这完全脱不开大家的互相包容理解和支持。\n不得不说老师挑人的眼光还是相当可以，能挑出我们仨虽然互补却共同具有吃苦耐劳美德的人......',
 '从一开始的“被迫”出国，到最后留下了深刻的回忆。感谢我的伙伴们，在街道上前前后后地前往餐厅，在桌上一次次干杯，费尽心思地去银行取出我们的学费。感谢遇到的异国的朋友们，即使地理人文语言的差距是那么大，但善良和友爱还是让我们能欢声笑语。\n我也会想起世界的另一个地方，潮汐会漫过小岛，把街道调和得潮湿黏腻。那里阳光那么炽热，天空蓝得那么纯粹，给往事万物笼上一层明媚的色彩。芭蕉林矗立在广阔的水田边，舒展着扇叶投下边界清晰的阴影。我无从猜测他们的生活是什么样子，语言和时间，像一道屏障隔在我与当地人之间，我有好多话想说，好多话想问，但我看着他们的眼睛，只能词不达意，无语凝噎。'
];

function PhotoBack({url,text,width,height}){
 const extraUrl=url===wallPhotoBacks[0]?firstBackExtra:url===wallPhotoBacks[4]?fifthBackExtra:url===wallPhotoBacks[6]?seventhBackExtra:null;
 const textRef=useRef(null);
 const landscape=width>height;
 useEffect(()=>{
  let cancelled=false;
  const fit=()=>{const el=textRef.current;if(cancelled||!el||!el.clientHeight)return;let size=13;el.style.fontSize=`${size}px`;while(size>5&&(el.scrollHeight>el.clientHeight||el.scrollWidth>el.clientWidth)){size-=.25;el.style.fontSize=`${size}px`}};
  const observer=new ResizeObserver(fit);observer.observe(textRef.current);
  document.fonts.ready.then(fit);document.fonts.addEventListener('loadingdone',fit);fit();
  return()=>{cancelled=true;observer.disconnect();document.fonts.removeEventListener('loadingdone',fit)};
 },[text,width,height]);
 return <div style={{width:'100%',height:'100%',boxSizing:'border-box',padding:14,background:'#fff',display:'grid',gap:12,gridTemplateColumns:landscape?'42% minmax(0,1fr)':'minmax(0,1fr)',gridTemplateRows:landscape?'minmax(0,1fr)':'40% minmax(0,1fr)'}}>
  {extraUrl?<div style={{minWidth:0,minHeight:0,display:'grid',gridTemplateRows:'minmax(0,1fr) minmax(0,1fr)',gap:8}}>
   <img src={url} alt="背面原有照片" draggable={false} style={{width:'100%',height:'100%',minHeight:0,objectFit:'contain',objectPosition:'center bottom',display:'block'}}/>
   <img src={extraUrl} alt="背面补充照片" draggable={false} style={{width:'100%',height:'100%',minHeight:0,objectFit:'contain',objectPosition:'center top',display:'block'}}/>
  </div>:<img src={url} alt="新上传的照片 · 背面" draggable={false} style={{width:'100%',height:'100%',minWidth:0,minHeight:0,objectFit:'contain',objectPosition:landscape?'left center':'center top',display:'block'}}/>}
  <div ref={textRef} style={{minWidth:0,minHeight:0,whiteSpace:'pre-wrap',overflowWrap:'anywhere',fontFamily:'XianSheng-GaiZenMeChengNi, KaiTi, cursive',fontSize:13,lineHeight:1.5,color:'#514638'}}>{text}</div>
 </div>;
}

function PhotoCard({id,url,width,height,onViewed}){
 const photoIndex=Number(id.replace('Memory_Frame_',''))-9;
 const frontUrl=wallPhotos[photoIndex].url;
 const backUrl=wallPhotoBacks[photoIndex];
 const face=(src,alt,background,caption)=> <div style={{position:'relative',width:'100%',height:'100%',padding:'20px 16px 36px',boxSizing:'border-box',background,border:'1px solid #d8d2c7'}}><img src={src} alt={alt} draggable={false} style={{width:'100%',height:'100%',objectFit:'contain',display:'block',background}}/>{caption&&<span style={{position:'absolute',right:16,bottom:5,left:16,height:27,display:'flex',alignItems:'center',justifyContent:'flex-end',textAlign:'right',fontFamily:'XianSheng-GaiZenMeChengNi, KaiTi, cursive',fontSize:10,lineHeight:'13px',color:'#514638'}}>{caption}</span>}</div>;
 return <FlipCard width={width} height={height} radius={1} background="#ffffff" color="#493e32" axis="y" defaultFlipped={false} onFlipChange={back=>{if(back)onViewed?.(id)}} flipOnClick draggable dragDistance={0} tilt tiltMax={6} perspective={1100} stiffness={170} damping={20} shadow front={face(frontUrl,'原来的照片 · 正面','#f5f1e9',photoCaptions[photoIndex])} back={<PhotoBack url={backUrl} text={photoStories[photoIndex]} width={width} height={height}/>}/>;
}
export function createSceneInteractions(host,room,camera,canvas){
 const css=new CSS3DRenderer();css.domElement.className='artwork-layer';host.appendChild(css.domElement);const scene=new T.Scene();
 const entries=room.children.filter(o=>o.userData.hangingPhoto).map(frame=>{
  const paper=frame.children.find(o=>o.isMesh&&o.material?.color?.getHex()===0xf5f1e9&&o.geometry.parameters.width);
  if(!paper)return null;
  // Keep each card's bounds tied to its individual photo and white border.
  const width=frame.userData.hangingPhoto?frame.userData.photoWidth:paper.geometry.parameters.width;
  const height=frame.userData.hangingPhoto?frame.userData.photoHeight:paper.geometry.parameters.height;
  const element=document.createElement('div');
  // Explicit bounds prevent the absolutely positioned flip faces collapsing
  // their CSS3D parent's shrink-to-fit width (the card has max-width:100%).
  Object.assign(element.style,{pointerEvents:'auto',width:`${width*1000}px`,height:`${height*1000}px`});
  const root=createRoot(element);
  if(frame.userData.hangingPhoto)root.render(<PhotoCard onViewed={id=>room.userData.easterPhotoViewed?.(id)} id={frame.name} url={frame.userData.photoUrl} width={width*1000} height={height*1000}/>);
  const photoFace=frame.children.find(o=>o.userData.photoFace);
  if(photoFace){Object.defineProperty(paper,'visible',{get(){return this.userData.paperVisible!==false},set(v){this.userData.paperVisible=v;photoFace.visible=v},configurable:true})}
  const object=new CSS3DObject(element);object.visible=false;
  if(frame.userData.hangingPhoto){
   let wasVisible=false,visit=0;
   Object.defineProperty(object,'visible',{get(){return wasVisible},set(visible){
    if(visible&&!wasVisible)root.render(<PhotoCard onViewed={id=>room.userData.easterPhotoViewed?.(id)} key={++visit} id={frame.name} width={width*1000} height={height*1000}/>);
    wasVisible=visible;
   },configurable:true});
  }
  scene.add(object);return {frame,paper,object,root};
 }).filter(Boolean);
 const suitcase=room.getObjectByName('Silver_Suitcase');
 const stickers=suitcase.children.filter(o=>o.isMesh&&o.geometry.type==='PlaneGeometry');
 const key='suitcase-stickers-v1';
 let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')}catch{}
 stickers.forEach((o,i)=>{o.name='Travel_Sticker_'+i;const x=[-.13,.08,-.03,.13,-.13,.06,-.08,.09][i],y=[.56,.51,.37,.22,.19,.60,.45,.32][i];o.position.set(x,y,.153+i*.0002);o.rotation.z=[-.21,.19,-.13,.24,.12,-.17,.1,-.1][i];const s=saved[o.name];if(s&&Number.isFinite(s.x)&&Number.isFinite(s.y)){o.position.x=T.MathUtils.clamp(s.x,-.16,.16);o.position.y=T.MathUtils.clamp(s.y,.17,.57)}});
 const ray=new T.Raycaster(),pointer=new T.Vector2();let dragging=null;
 function rayFrom(e){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(pointer,camera)}
 function down(e){if(room.userData.editMode||room.userData.currentFocus!=='旅行行李箱'||e.button!==0)return;rayFrom(e);const hit=ray.intersectObjects(stickers)[0];if(!hit)return;const normal=new T.Vector3(0,0,1).transformDirection(suitcase.matrixWorld);const plane=new T.Plane().setFromNormalAndCoplanarPoint(normal,hit.point);dragging={o:hit.object,plane,offset:hit.object.position.clone().sub(suitcase.worldToLocal(hit.point.clone()))};canvas.setPointerCapture(e.pointerId);e.stopImmediatePropagation()}
 function motion(e){if(!dragging)return;e.stopImmediatePropagation();rayFrom(e);const p=ray.ray.intersectPlane(dragging.plane,new T.Vector3());if(!p)return;suitcase.worldToLocal(p).add(dragging.offset);const o=dragging.o;const half=.5*(Math.abs(Math.cos(o.rotation.z))*.145+Math.abs(Math.sin(o.rotation.z))*.13);o.position.x=T.MathUtils.clamp(p.x,-.235+half,.235-half);o.position.y=T.MathUtils.clamp(p.y,.085+half,.655-half)}
 function up(e){if(!dragging)return;e.stopImmediatePropagation();dragging=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);try{localStorage.setItem(key,JSON.stringify(Object.fromEntries(stickers.map(o=>[o.name,{x:o.position.x,y:o.position.y}]))))}catch{/* Drag remains usable without storage. */}}
 canvas.addEventListener('pointerdown',down,true);canvas.addEventListener('pointermove',motion,true);canvas.addEventListener('pointerup',up,true);canvas.addEventListener('pointercancel',up,true);
 return {update(){css.setSize(host.clientWidth,host.clientHeight);for(const e of entries){const visible=!room.userData.editMode&&room.userData.currentFocus===e.frame.userData.item.label;e.object.visible=visible;e.paper.visible=!visible;if(visible){e.frame.updateWorldMatrix(true,false);e.object.position.copy(e.frame.localToWorld(new T.Vector3(0,0,.03)));e.frame.getWorldQuaternion(e.object.quaternion);e.frame.getWorldScale(e.object.scale);e.object.scale.multiplyScalar(.001)}}css.render(scene,camera)},dispose(){for(const e of entries){e.paper.visible=true;e.root.unmount()}css.domElement.remove();canvas.removeEventListener('pointerdown',down,true);canvas.removeEventListener('pointermove',motion,true);canvas.removeEventListener('pointerup',up,true);canvas.removeEventListener('pointercancel',up,true)}};
}
