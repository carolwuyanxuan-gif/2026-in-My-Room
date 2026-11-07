import {useEffect,useState} from 'react';
import hintFontUrl from '../assets/NaikaiFont-Regular-2.ttf';
const hintFont=new FontFace('RoomHintHand',`url(${hintFontUrl})`);
void hintFont.load().then(font=>document.fonts.add(font)).catch(()=>{});
export function flashRoomHint(text:string){window.dispatchEvent(new CustomEvent('room-hint',{detail:text}))}
export function useRoomHint(focus:string|null){
 const [hint,setHint]=useState('');
 useEffect(()=>{let transient='',until=0;const start=Date.now();const event=(e:Event)=>{transient=(e as CustomEvent<string>).detail;until=Date.now()+3200;update()};
 function update(){const modal=Array.from(document.querySelectorAll<HTMLElement>('[data-reading-hint]')).find(el=>!el.hidden&&getComputedStyle(el).display!=='none');if(modal){setHint(modal.dataset.readingHint||'');return}if(Date.now()<until){setHint(transient);return}
 const mobile=matchMedia('(pointer:coarse)').matches;
 const labels:Record<string,string>={
 '记忆 01':'我和zyf的作品：白头鹎与立体主义。',
 '记忆 02':'树在另一个时空里，投下一抹影子。',
 '记忆 03':'苏醒中的风铃草。',
 '记忆 04':'外公拍的彩虹。',
 '记忆 05':'从井里汶去万隆的路上。',
 '记忆 06':'兔的ccd自拍照。',
 '记忆 07':'离开井里汶。',
'生日蛋糕':'来和我一起吹蜡烛吧','沙发照片墙':'靠近查看单张照片','照片墙':'靠近查看单张照片','架子上的书':'翻开看看吧','手绘瓷':'杯子已经送给老师啦','第一层抽屉':'这你都发现了!','旅行行李箱':'今年陪着我去了好多地方的行李箱','日记本':'翻翻看吧','小本子':'一些有意思的作业','黄色作业本':'一些有意思的作业','笔记本电脑':'爱玩一些小游戏','朝朝':'喵~'};
 setHint(!focus?(Math.floor((Date.now()-start)/7000)%2?'可以点击物品看看':mobile?'可以转动看看 · 双指缩放':'可以转动看看 · 滚轮缩放'):labels[focus]||(focus.startsWith('记忆 ')&&Number(focus.slice(3))>=9?'点击翻转照片 · 点击空白返回':'点击空白，回到房间'));
 }update();const timer=setInterval(update,350);window.addEventListener('room-hint',event);return()=>{clearInterval(timer);window.removeEventListener('room-hint',event)}},[focus]);return hint;
}
