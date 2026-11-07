import { useEffect, useRef, useState } from 'react';
import { createRoomPrototype, type Mode, type RoomPrototypeEngine } from './three/room-prototype';
import './styles/entrance.css';
import {useRoomHint} from './lib/room-hints';

export function RoomPrototype() {
  const host = useRef<HTMLDivElement>(null);
  const engine = useRef<RoomPrototypeEngine | null>(null);
  const [ready, setReady] = useState(false);
  const [entrance,setEntrance]=useState<'waiting'|'entering'|'lamp'|'done'>('waiting');
  useEffect(()=>{const lit=()=>setEntrance('entering');const done=()=>setEntrance('done');window.addEventListener('room-entrance-lit',lit);window.addEventListener('room-entrance-done',done);return()=>{window.removeEventListener('room-entrance-lit',lit);window.removeEventListener('room-entrance-done',done)}},[]);
  const [focus, setFocus] = useState<string | null>(null);
  const hint=useRoomHint(focus);
  const [mode,setMode]=useState<Mode>('night');
  const [menu,setMenu]=useState<'objects'|null>(null);
  const toolbar=useRef<HTMLDivElement>(null);
  useEffect(()=>{const dismiss=(e:PointerEvent)=>{if(!toolbar.current?.contains(e.target as Node))setMenu(null)};const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')setMenu(null)};document.addEventListener('pointerdown',dismiss);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',dismiss);document.removeEventListener('keydown',escape)}},[]);

  const [error,setError]=useState('');
  const [sofaStatus,setSofaStatus]=useState('');
  useEffect(() => {
    if (!host.current) return;
    let mounted:ReturnType<typeof createRoomPrototype>;
    try { mounted = createRoomPrototype(host.current, { onReady: () => setReady(true), onFocus: setFocus, onSofaStatus:setSofaStatus }); }
    catch { setError('无法创建三维画面，请使用支持 WebGL 的浏览器，并开启硬件加速。'); return; }
    engine.current = mounted;
    return () => { mounted.dispose(); engine.current = null; };
  }, []);
  return <main className={`prototype-shell mode-${mode} entrance-${entrance} ${ready?'entrance-ready':'entrance-loading'} ${focus?'is-focused':''}`}>
    <div className="rotate-phone"><span aria-hidden="true">↻</span><div>把手机横过来，进来坐坐吧</div><button onClick={async()=>{try{await document.documentElement.requestFullscreen?.();await (screen.orientation as ScreenOrientation & {lock?:(orientation:string)=>Promise<void>}).lock?.('landscape')}catch{/* Keep the manual rotation prompt when unsupported. */}}}>横屏进入</button></div>
    <div ref={host} className="room-canvas" aria-label="可旋转的年度房间 · 布局 V2" />
    {entrance!=='done'&&<div className="room-entrance">
      <div className="entrance-copy">{['这一年，有很多小事发生','有些被我画下来，有些被我写下来。','它们都被我放进了这个房间里','进来转转吧'].map((line,i)=><p key={line} style={{'--line':i} as React.CSSProperties}>{line}</p>)}</div>
      <span className="entrance-hint">{error||(!ready?'房间正在搭好…':'点击一下，打开灯吧')}</span>
    </div>}
    <div className="compact-toolbar" ref={toolbar}>
      <button className="toolbar-icon" aria-label={`当前${{night:'夜景',blue:'蓝调',day:'白天'}[mode]}，点击切换天气`} title={`当前${{night:'夜景',blue:'蓝调',day:'白天'}[mode]} · 点击切换`} onClick={()=>{const next:Mode=mode==='night'?'blue':mode==='blue'?'day':'night';setMode(next);engine.current?.setMode(next);setMenu(null)}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{mode==='night'?<path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z"/>:mode==='blue'?<><path d="M3 17h18M5 21h14M5 13a7 7 0 0 1 14 0M12 1v3M2 6l2 2M22 6l-2 2"/></>:<><circle cx="12" cy="12" r="4"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3M4 4l2 2M18 18l2 2M20 4l-2 2M6 18l-2 2"/></>}</svg></button>
      <button className="toolbar-icon" aria-label="可互动物品" title="可互动物品" aria-expanded={menu==='objects'} aria-controls="object-options" onClick={()=>setMenu(menu==='objects'?null:'objects')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><path d="M17.5 14v7M14 17.5h7"/></svg></button>
      {menu==='objects'&&<nav id="object-options" className="toolbar-menu" aria-label="可互动物品">{['朝朝','台历','花束','生日蛋糕','日记本','旅行行李箱','笔记本电脑',...Array.from({length:7},(_,i)=>`记忆 ${String(i+1).padStart(2,'0')}`),...Array.from({length:7},(_,i)=>`记忆 ${String(i+9).padStart(2,'0')}`),'回到全景'].map(label=><button key={label} onClick={()=>{if(label==='回到全景')engine.current?.resetView();else engine.current?.focusItem(label);setMenu(null)}}>{label.startsWith('记忆 ')?`${Number(label.slice(3))>=9?'相纸':'挂画'} · ${label}`:label}</button>)}</nav>}
    </div>
    <div className="room-help" aria-live="polite">{error || (!ready ? '房间正在搭好…' : hint)}</div>
    {!sofaStatus.includes('已加载')&&<div className="sofa-switch"><span role="status">{sofaStatus}</span></div>}

  </main>;
}
