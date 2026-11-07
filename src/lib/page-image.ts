// Classic scripts also work under file://, unlike fetched textures and modules.
const pending=new Map<string,Promise<string>>();
export function pageImage(url:string):Promise<string>{
 if(!url.startsWith('page-script:'))return Promise.resolve(url);
 if(!pending.has(url))pending.set(url,new Promise((resolve,reject)=>{
  const path=url.slice(12),script=document.createElement('script');script.src=path;
  script.onload=()=>{resolve((window as any).__roomPageImages[path]);script.remove()};
  script.onerror=()=>{pending.delete(url);script.remove();reject(new Error('Page image unavailable'))};document.head.append(script);
 }));
 return pending.get(url)!;
}
