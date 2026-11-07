const paragraphs = [
 '谢谢你我的朋友，谢谢你能参与进我的生命，能够和我一起吹蜡烛，感谢这种缘分。',
 '其实随着年龄增长，过生日似乎成为了司空见惯的事情。这一年体感上也过得很快，毕竟它只占我人生的1/23。但我还是希望能留下一些记忆，留下一些美好，毕竟每一天每一个月每一年都是那么弥足珍贵。',
 '24岁是我小时候以为我会成为都市丽人的时候（天真了），是我妈妈结婚的年龄，是一个距离18岁和30岁同样遥远的年纪。',
 '或许我依旧会有茫然不知所措的时候，依旧有莽撞冲动的时候。但我知道此刻我比以往任何一个时刻都更加了解自己，接纳自己。',
 '祝我生日快乐，24岁会是更好的一年。',
 '——吴立冬'
];
export function birthdayLetter(){
 const dialog=document.createElement('div');dialog.className='birthday-mail';dialog.hidden=true;dialog.tabIndex=-1;dialog.setAttribute('role','dialog');dialog.setAttribute('aria-label','生日来信');
 dialog.innerHTML='<div class="mail-stage"><div class="mail-back"></div><article class="mail-page"><div class="mail-lines"></div></article><div class="mail-pocket"></div><div class="mail-flap"></div></div>';document.body.append(dialog);
 const stage=dialog.firstElementChild as HTMLElement;
 const [back,page,pocket,flap]=Array.from(stage.children) as HTMLElement[];
 const lines=page.firstElementChild as HTMLElement;
 let animations:Animation[]=[],frame=0,closing=false,after:(()=>void)|undefined;
 function close(){if(closing||dialog.hidden)return;closing=true;cancelAnimationFrame(frame);lines.style.opacity='0';for(const a of animations)a.reverse();Promise.all(animations.map(a=>a.finished)).then(()=>{dialog.hidden=true;animations.forEach(a=>a.cancel());after?.()}).catch(()=>{});}
 dialog.onclick=e=>{if(!page.contains(e.target as Node))close()};dialog.onkeydown=e=>{if(e.key==='Escape'){e.stopPropagation();close()}};
 function show(done?:()=>void){if(!dialog.hidden)return;after=done;closing=false;dialog.hidden=false;dialog.focus();lines.style.opacity='1';lines.replaceChildren();page.scrollTop=0;
 const nodes=paragraphs.map((_,index)=>{const p=document.createElement('p');if(index===paragraphs.length-1)p.className='mail-signature';lines.append(p);return p});
 const timeline=6600;
 // Speed up the two travel segments while preserving the middle choreography.
 const travelTime=(position:number)=>timeline*(Math.min(position,.24)*.65 + Math.max(0,Math.min(position,.73)-.24) + Math.max(0,position-.73)*.65);
 const duration=travelTime(1);
 const animate=(el:HTMLElement,keys:Keyframe[])=>el.animate(keys.map(key=>({...key,offset:travelTime(Number(key.offset))/duration})),{duration,fill:'both',easing:'linear'});
 const shell=[{offset:0,transform:'translateY(85vh)'},{offset:.24,transform:'translateY(0)'},{offset:.73,transform:'translateY(0)'},{offset:1,transform:'translateY(85vh)'}];
 const folded='scale(.42,'+(back.offsetHeight*.80/page.offsetHeight)+')';
 const lifted='translateY(-'+back.offsetHeight+'px) '+folded;
 const flapFrame=(offset:number,y:string,angle:number,zIndex:number)=>({offset,transform:'translateY('+y+') rotateX('+angle+'deg)',zIndex});
 animations=[animate(back,shell),animate(pocket,shell),animate(flap,[
  flapFrame(0,'85vh',0,4),flapFrame(.24,'0',0,4),flapFrame(.31,'0',0,4),
  flapFrame(.38,'0',90,4),flapFrame(.381,'0',90,1),flapFrame(.45,'0',180,1),
  flapFrame(.73,'0',180,1),flapFrame(1,'85vh',180,1)
 ]),animate(page,[
  {offset:0,transform:'translateY(85vh) '+folded,opacity:0},
  {offset:.38,transform:folded,opacity:0},{offset:.381,transform:folded,opacity:1},
  {offset:.51,transform:folded},{offset:.68,transform:lifted},{offset:.73,transform:lifted},
  {offset:.88,transform:lifted},{offset:1,transform:'translateY(0) scale(1)'}
 ])];
 animations[3].finished.then(()=>{
  if(closing)return;
  let paragraph=0,index=0,next=0;
  function type(now:number){
   if(now>=next){
    const char=paragraphs[paragraph][index++];nodes[paragraph].append(char);
    next=now+('。！？'.includes(char)?500:'，、；：'.includes(char)?205:43);
    if(index===paragraphs[paragraph].length){paragraph++;index=0;next+=160}
   }
   if(paragraph<nodes.length)frame=requestAnimationFrame(type);
  }
  frame=requestAnimationFrame(type);
 }).catch(()=>{});
 }
 return {show,dispose(){cancelAnimationFrame(frame);animations.forEach(a=>a.cancel());dialog.remove()}};
}
