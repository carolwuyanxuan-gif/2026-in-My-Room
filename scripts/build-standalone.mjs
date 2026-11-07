import {build} from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
await fs.mkdir('standalone/assets',{recursive:true});
const images={name:'optimized-images',setup(b){b.onLoad({filter:/\.(png|jpg)$/},async args=>{
 const relative=path.relative(path.resolve('src/assets'),args.path);
 let bytes;try{bytes=await fs.readFile(path.join('.optimized-assets',relative+'.jpg'))}catch{throw Error('Run scripts/optimize-images.ps1 first: '+relative)}
 const data='data:image/jpeg;base64,'+bytes.toString('base64');
 if(/coursework|journal/.test(relative)){
  const name='assets/page-'+createHash('sha256').update(bytes).digest('hex').slice(0,16)+'.js';
  await fs.writeFile('standalone/'+name,'window.__roomPageImages=window.__roomPageImages||{};window.__roomPageImages['+JSON.stringify(name)+']='+JSON.stringify(data)+';');
  return {contents:'export default '+JSON.stringify('page-script:'+name),loader:'js'};
 }
 return {contents:'export default '+JSON.stringify(data),loader:'js'};
})}};
const result=await build({entryPoints:['src/main.tsx'],bundle:true,write:false,format:'iife',minify:true,jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},plugins:[images],loader:{'.css':'empty','.glb':'dataurl','.fbx':'dataurl','.ttf':'dataurl'},legalComments:'none'});
const font=await fs.readFile('src/assets/note-handwriting.ttf');
const fontData='data:font/ttf;base64,'+font.toString('base64');
const entranceCss=(await fs.readFile('src/styles/entrance.css','utf8')).replace(/@font-face\{[^}]*\}/,'');
const css=await fs.readFile('src/styles/prototype.css','utf8')+'\n'+await fs.readFile('src/components/FlipCard.css','utf8')+'\n'+entranceCss;
const bundled=result.outputFiles[0].text.replace(/"data:[^";]*;base64,([A-Za-z0-9+/=]+)"/g,(match,base64)=>base64===font.toString('base64')?'window.__roomHandFont':match);
await fs.writeFile('standalone/room.js','window.__roomHandFont='+JSON.stringify(fontData)+';new FontFace("EntranceHand","url("+window.__roomHandFont+")").load().then(f=>document.fonts.add(f)).catch(()=>{});'+bundled);
await fs.writeFile('standalone/room.css',css);
await fs.writeFile('standalone/index.html','<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>这一年住在这里</title><link rel="stylesheet" href="./room.css"></head><body><div id="root"></div><script src="./room.js"></script></body></html>');
console.log('Standalone ready: standalone/index.html');
