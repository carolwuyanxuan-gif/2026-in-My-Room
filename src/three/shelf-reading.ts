import * as T from 'three';
import {wrapBookText} from '../lib/book-text';
import fontUrl from '../assets/note-handwriting.ttf';
import {playRoomSound} from '../lib/prototype-sound';
export const shelfTitles=['陈飞虎水彩写生作品集','Python编程，从入门到实践','去有花的地方','羊道，深山夏牧场','献给阿尔吉侬的花束',''];
export const shelfColors=[0x999b9c,0xc6b67e,0xc3a4ad,0x879b87,0x303030,0x887565];
const texts=[`每周一从7点到9点半固定是西方艺术评析，70岁的陈飞虎老师穿着灰色西装内搭彩色衬衫，戴一顶小檐礼帽，始终保持着充沛饱满的情绪，给我们讲了一课又一课。他真正做到了给我打开艺术大门，带给我们全新的视角，全新的思考问题的方式。我觉得这是我研究生期间学到东西最多的一门课。

印象最深有两次，刚巧是第一节课和最后一节课。

第一次课他讲从文化历史角度看西方艺术动力曲线，说到生活态度是会影响艺术形式的，比如雅典早期因为民主、和平，因而雕塑作品都是含蓄平和，秀美温存的……

他下课前又说，我知道你们的学习和生活都很紧张。但走在路上的时候，希望你们可以用心感受自然、感受世界，要学着享受这种孤独的平和。其实他后面还说了很多，他好像还说，这样一天天一年年走下去，你会发现生活的艺术……我记不清了。但他讲完这些以后我心里很宁静，就像夏末缓缓穿过雨后的树林，像咳嗽不止时喝了冰糖雪梨汤，像大卫·霍克尼的画。

好像很久很久没有人跟我说过，要慢慢地走，要用心去感受了。

还有最后一节课他讲中西方艺术比较，更是惊喜不断。

讲到长卷时，他说：“说到清明上河图，今天我也带来了……”（从袋里缓缓掏出）

我们（吸凉气）：这是能带来的吗？（*带来的是摹本，相当值钱）

于是画卷被缓缓展开，占据了整个教室的长边，从我们每个人头上掠过去。

过一会儿说到中西技法结合，他说：“说到中西技法融合，今天我也带来了……”（从袋里缓缓掏出）

我们：啊又带来了吗？

于是他又展开画卷，叫我们领略了一番。

也是在这节课，他说：“马上要圣诞节了，我要送你们每人一样礼物。”

于是在这个寒冷的冬天的夜晚，每个人都领到了一本带着他to签的画集，就是这本《陈飞虎水彩写生作品集》。`,
`去年12月，我决定开始学习Python，叫弟弟给我推荐了入门书籍看。这本书在旧书网上价值4.5元，二手但全新，我心中窃喜，火速拿下。

看了几页以后，我明白为什么卖那么便宜了。

我觉得这书应该叫Python编程，从入门到放弃。

然后AI就以迅雷不及掩耳之势掌握了超强的写代码功能，满足了我的所有编程需求，我只需要下载anoconda即可（甚至到现在，ai都能帮我下好）

于是我就这么“学会”了Python，果然学得越慢就学得越快。

以及三手的《Python编程，从入门到实践》，2元，有没有人要。`,
`听完鲁豫在岩中花束里采访陈慧的那期，买了这本书。

或许因为是春天，这本书画着田野又是粉红色的，让我非常想拥有。

其实有点失望，觉得确实不是科班作家，文字功底让我读来难受。但谁对那样的生活不好奇呢？带着小狗跟着蜂农一路向北，扎营，取水，移虫，刮浆，和天南海北的人聊天。物质条件的匮乏抚平了精神上的繁杂。

我也想这样，如她说的，偶尔离开日常，就像游泳憋不住时，上来吸一口新鲜的空气，但你依然没有离开那条河流，你还要再扎下去。`,
`这本书我看的时候感觉内心平和，去年在图书馆对着蓝色的窗子我读完了一系列，今年买来，与田螺的《谁来决定吃什么》一起参加南方周末的换书活动。

结果想来想去竟然舍不得，最后也没换成。

但问题是它搁在我的架子上我也不会拿出来看，我光是看着它的书脊，想到它绿油油的封面，就很满足很开心，就感觉温暖与安全感。

难道我与这本书的关系是巴甫洛夫与狗？`,
`这本书是我在电子书上看的。

当阿尔吉侬已经聪明到所有人都退避三舍时，他依旧解决不了情感带给他的难题。愚笨带给他快乐，聪明却让他孤独地暴露在一览无余的虚伪与伪装里。他学会了一切唯独学不会爱。

在他即将要再次走入愚笨的黑暗时……

我把电子书落在了去印尼的飞机上。

（以此缅怀陪伴了我6年的电子书。

对不起宏宏哥哥我把你送的礼物搞丢了😭）`,
`放在这显得书架上的书多一点，掩饰我的贫…….

我发誓我曾经是个热爱阅读的人，怎么现在光看小红书去了？

（※专业书以及一些没看完的或者没意思的书就不放在书架上了）`];
export function setupShelfReading(group:T.Group,room:T.Group){
 let disposed=false,index=0,page=-1;const assets:Array<T.Texture|T.Material|T.BufferGeometry>=[];
 const font=new FontFace('ShelfHand',`url(${fontUrl})`);const ready=font.load().then(f=>{if(!disposed)document.fonts.add(f)}).catch(()=>{});
 const overlay=document.createElement('div');overlay.style.cssText='position:fixed;inset:0;z-index:180;background:#1119;display:none;align-items:center;justify-content:center';
 const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=700;canvas.style.cssText='width:min(94vw,128.57vh,1100px);max-width:94%;height:auto;cursor:pointer;filter:drop-shadow(0 16px 24px #0007)';overlay.append(canvas);document.body.append(overlay);const c=canvas.getContext('2d')!;
 let pages:Array<Array<{text:string,y:number}>>=[];
 function paginate(){pages=index===4?[]:[[]];let lines:Array<{text:string,y:number}>=[],y=74;c.font='28px ShelfHand, KaiTi, cursive';for(const paragraph of texts[index].split(/\n+/)){let line='';const push=()=>{if(y>618){pages.push(lines);lines=[];y=74}lines.push({text:line,y});y+=39;line=''};for(const wrapped of wrapBookText(paragraph,text=>c.measureText(text).width,410)){line=wrapped;push();}y+=8}if(lines.length)pages.push(lines)}
 function draw(){overlay.dataset.readingHint=index===4?'点右半屏下一页 · 点击空白返回':page<0?'点击封面，翻开这本书':'翻翻看吧';c.clearRect(0,0,1000,700);c.textAlign='left';c.textBaseline='alphabetic';if(index===4){c.fillStyle='#262626';c.fillRect(250,0,500,700);c.fillStyle='#d6d7ce';c.fillRect(278,30,444,630);c.fillStyle='#30312e';c.font='28px ShelfHand, KaiTi, cursive';if(page<0){c.font='bold 30px SimHei,sans-serif';c.fillText('献给阿尔吉侬的花束',300,310)}else pages[page]?.forEach(l=>c.fillText(l.text,294,l.y));return}if(page<0){c.fillStyle='#'+shelfColors[index].toString(16).padStart(6,'0');c.fillRect(500,0,500,700);if(index===4){c.fillStyle='#d6d7ce';c.fillRect(530,35,440,620)}c.fillStyle=index===5?'#eee':'#222';c.font='bold 32px SimHei, sans-serif';let y=260;for(const line of wrapBookText(shelfTitles[index],text=>c.measureText(text).width,380)){c.fillText(line,560,y);y+=48}return}c.fillStyle='#fff9ed';c.fillRect(0,0,1000,700);c.fillStyle='#ddd3bf';c.fillRect(498,0,4,700);c.font='28px ShelfHand, KaiTi, cursive';c.fillStyle='#403b35';for(let side=0;side<2;side++)pages[page*2+side]?.forEach(l=>c.fillText(l.text,side*500+44,l.y))}
 canvas.onclick=e=>{e.stopPropagation();const b=canvas.getBoundingClientRect();const x=(e.clientX-b.left)/b.width*1000,y=(e.clientY-b.top)/b.height*700;
  // Transparent canvas margins belong to the backdrop, not the reader.
  if((index===4&&(x<250||x>750||y<0||y>700))||(index!==4&&page<0&&x<500)){overlay.style.display='none';return}
  const delta=x>500?1:-1;page=Math.max(-1,Math.min((index===4?pages.length:Math.ceil(pages.length/2))-1,page+delta));if(index!==4)playRoomSound('paper');draw()};
 overlay.onclick=()=>{overlay.style.display='none'};overlay.onpointerdown=e=>e.stopPropagation();overlay.onpointerup=e=>e.stopPropagation();
 const key=(e:KeyboardEvent)=>{if(overlay.style.display==='none')return;e.stopImmediatePropagation();if(e.key==='Escape')overlay.style.display='none'};window.addEventListener('keydown',key,true);
 group.children.forEach((book,i)=>{
  const spine=document.createElement('canvas');spine.width=256;spine.height=1024;const ctx=spine.getContext('2d')!;ctx.fillStyle='#'+shelfColors[i].toString(16).padStart(6,'0');ctx.fillRect(0,0,256,1024);ctx.fillStyle=i===4?'#eee':'#161616';ctx.textAlign='center';ctx.font='bold 56px SimHei, sans-serif';let title=shelfTitles[i],y=130;if(i===1){ctx.font='bold 48px SimHei,sans-serif';ctx.fillText('Python',128,110);title='编程从入门到实践';y=210}const chars=Array.from(title.replace(/[，、]/g,''));const step=Math.min(66,780/Math.max(chars.length,1));ctx.font=`bold ${Math.min(56,step-2)}px SimHei,sans-serif`;chars.forEach((ch,n)=>ctx.fillText(ch,128,y+n*step));
  const bounds=new T.Box3().setFromObject(book),size=bounds.getSize(new T.Vector3());const tex=new T.CanvasTexture(spine);tex.colorSpace=T.SRGBColorSpace;const mat=new T.MeshStandardMaterial({map:tex,roughness:.9});const geo=new T.PlaneGeometry(size.x*.94,size.y*.96);const label=new T.Mesh(geo,mat);label.position.set(0,size.y/2,.108);book.add(label);assets.push(tex,mat,geo);
  book.userData.onActivate=async()=>{if(room.userData.editMode)return;if(room.userData.currentFocus!=='架子上的书'){room.userData.focusProp?.(group,'架子上的书');return}await ready;if(disposed)return;index=i;page=-1;paginate();draw();overlay.style.display='flex';playRoomSound('paper')};book.traverse(o=>o.userData.root=book);
 });
 return ()=>{disposed=true;overlay.remove();window.removeEventListener('keydown',key,true);assets.forEach(a=>a.dispose())};
}
