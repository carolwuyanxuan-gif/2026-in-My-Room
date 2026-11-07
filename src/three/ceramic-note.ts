import * as T from 'three';
import fontUrl from '../assets/note-handwriting.ttf';
export function createCeramicNote(){
 const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=500;
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;
 const text='昨天上午一直在上课，没能再见到你，你送的手绘瓷很好，我很喜欢，很有纪念意义，再祝一切顺安✌✌✌。';
 function draw(){const c=canvas.getContext('2d')!;c.clearRect(0,0,1600,500);c.save();c.beginPath();
  for(let i=0;i<=80;i++){const x=i*20,y=12+(i%3)*5;i?c.lineTo(x,y):c.moveTo(x,y)}
  for(let i=0;i<=24;i++)c.lineTo(1580+(i%3)*5,20+i*19);
  for(let i=80;i>=0;i--)c.lineTo(i*20,484-(i%4)*4);
  for(let i=24;i>=0;i--)c.lineTo(10+(i%3)*5,20+i*19);c.closePath();c.clip();
  c.fillStyle='#f5e9cd';c.fillRect(0,0,1600,500);
  for(let i=0;i<9;i++){const x=60+i*190;const g=c.createLinearGradient(x-18,0,x+28,500);g.addColorStop(0,'#0000');g.addColorStop(.48,'#8b74591b');g.addColorStop(.51,'#fffdf077');g.addColorStop(1,'#0000');c.fillStyle=g;c.fillRect(x-30,0,90,500)}
  c.strokeStyle='#6e604d';c.lineWidth=3;c.beginPath();c.moveTo(65,65);c.lineTo(1535,60);c.lineTo(1540,417);c.lineTo(220,421);c.lineTo(164,452);c.lineTo(176,419);c.lineTo(61,424);c.closePath();c.stroke();
  c.fillStyle='#514638';c.font='47px XianSheng-GaiZenMeChengNi, KaiTi, cursive';c.textBaseline='middle';
  for(let i=0;i<text.length;i+=28)c.fillText(text.slice(i,i+28),105,145+Math.floor(i/28)*95);
  c.restore();map.needsUpdate=true;
 }
 draw();const font=new FontFace('XianSheng-GaiZenMeChengNi',`url(${fontUrl})`);let disposed=false;
 font.load().then(f=>{if(!disposed){document.fonts.add(f);draw()}}).catch(e=>console.warn('纸条字体加载失败',e));
 return {map,canvas,text,dispose(){disposed=true;document.fonts.delete(font);map.dispose()}};
}
