// Local, gesture-unlocked synthesis: no external requests or audio downloads.
export type RoomSound='paper'|'pickup'|'switch'|'cat'|'cup'|'leaves'|'ignite'|'blow'|'key'|'reward'|'pop';
export function playRoomSound(kind:RoomSound){window.dispatchEvent(new CustomEvent('room-sound',{detail:kind}))}
export function createPrototypeSound(host:HTMLElement){
 let context:AudioContext|undefined,music:GainNode,effects:GainNode,master:GainNode,trainGain:GainNode,pan:StereoPannerNode;
 let entered=false,birthdayMusic=false,nextNote=0,birthdayBeat=0;
 const birthdayNotes=[[67,.75],[67,.25],[69,1],[67,1],[72,1],[71,2],[67,.75],[67,.25],[69,1],[67,1],[74,1],[72,2],[67,.75],[67,.25],[79,1],[76,1],[72,1],[71,1],[69,2],[77,.75],[77,.25],[76,1],[72,1],[74,1],[72,3]];
 const changeMusic=(e:Event)=>{birthdayMusic=(e as CustomEvent).detail==='birthday';birthdayBeat=0;nextNote=0};window.addEventListener('room-music',changeMusic);
 const enter=()=>{entered=true;unlock()};
 window.addEventListener('room-enter',enter);
 let muted=false,musicLevel=.3,effectLevel=.6,beat=0,last=0,dark=false,reading=false;
 let timer:ReturnType<typeof setInterval>|undefined;
 try{const saved=JSON.parse(localStorage.getItem('room-sound-settings')||'null');if(saved){muted=!!saved.muted;musicLevel=saved.music??.3;effectLevel=saved.effects??.6}}catch{}
 const panel=document.createElement('details');panel.style.cssText='position:absolute;left:18px;bottom:18px;z-index:40;color:#eee;background:#28302bd9;padding:10px 14px;border-radius:18px;font:13px sans-serif;';
 const summary=document.createElement('summary');summary.textContent='♫ 声音';summary.style.cursor='pointer';panel.append(summary);
 const mute=document.createElement('button');panel.append(mute);
 const persist=()=>{try{localStorage.setItem('room-sound-settings',JSON.stringify({muted,music:musicLevel,effects:effectLevel}))}catch{}};
 function mix(){mute.textContent=muted?'开启声音':'静音';summary.textContent=muted?'♫ 已静音':'♫ 声音';if(!context)return;const t=context.currentTime;master.gain.setTargetAtTime(muted?0:1,t,.15);music.gain.setTargetAtTime(musicLevel*(dark?.22:reading?.6:1),t,.8);effects.gain.setTargetAtTime(effectLevel,t,.15)}
 for(const [name,value,set] of [['音乐',musicLevel,(v:number)=>musicLevel=v],['音效',effectLevel,(v:number)=>effectLevel=v]] as const){const label=document.createElement('label');label.style.display='block';label.textContent=name;const input=document.createElement('input');input.type='range';input.min='0';input.max='1';input.step='.05';input.value=String(value);input.setAttribute('aria-label',name+'音量');input.oninput=()=>{unlock();set(Number(input.value));mix();persist()};label.append(input);panel.append(label)}
 mute.onclick=()=>{unlock();muted=!muted;mix();persist()};panel.addEventListener('pointerdown',e=>e.stopPropagation());panel.addEventListener('pointerup',e=>e.stopPropagation());host.append(panel);mix();
 function tone(f:number,duration:number,volume:number,bus:GainNode,end=f){if(!context)return;const t=context.currentTime,o=context.createOscillator(),g=context.createGain();o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(end,t+duration*.7);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(bus);o.start();o.stop(t+duration+.02);o.onended=()=>{o.disconnect();g.disconnect()}}
 function noise(duration:number,volume:number,freq:number){if(!context)return;const c=context,t=c.currentTime,b=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate),data=b.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1+.3*Math.sin(i/c.sampleRate*60));const s=c.createBufferSource(),filter=c.createBiquadFilter(),g=c.createGain();s.buffer=b;filter.type='bandpass';filter.frequency.value=freq;filter.Q.value=.7;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+duration);s.connect(filter);filter.connect(g);g.connect(effects);s.start();s.onended=()=>{s.disconnect();filter.disconnect();g.disconnect()}}
 function unlock(){if(!entered)return;try{if(!context){context=new AudioContext();master=context.createGain();music=context.createGain();effects=context.createGain();master.gain.value=0;music.gain.value=0;music.connect(master);effects.connect(master);master.connect(context.destination);
  const buffer=context.createBuffer(1,context.sampleRate*3,context.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.4;
  const source=context.createBufferSource(),filter=context.createBiquadFilter();source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=450;trainGain=context.createGain();trainGain.gain.value=0;pan=context.createStereoPanner();source.connect(filter);filter.connect(trainGain);trainGain.connect(pan);pan.connect(effects);source.start();
  timer=setInterval(()=>{if(!context||context.state!=='running'||muted)return;if(context.currentTime<nextNote)return;if(birthdayMusic){const [note,length]=birthdayNotes[birthdayBeat++%birthdayNotes.length];const f=440*Math.pow(2,(note-69)/12);tone(f,length*.58+.3,.065,music);tone(f/2,length*.58+.5,.015,music);nextNote=context.currentTime+length*.62;return}nextNote=context.currentTime+.85;const melody=[261.63,329.63,392,329.63,220,293.66,349.23,293.66,246.94,329.63,392,493.88,220,293.66,349.23,293.66];const f=melody[beat%melody.length];tone(f,2.3,.035,music);if(beat%4===0)tone(f/2,3.6,.025,music);beat++},100);
 }if(!document.hidden)void context.resume().catch(()=>{});mix()}catch{}}
 function sound(e:Event){unlock();if(!context||muted||document.hidden)return;const kind=(e as CustomEvent<RoomSound>).detail;const now=performance.now();if(now-last<70&&kind!=='reward')return;last=now;
  if(kind==='pop'){tone(430+Math.random()*90,.18,.035,effects,220);return}
  if(kind==='reward'){tone(659.25,1,.07,effects);tone(987.77,1.5,.045,effects);return}
  if(kind==='cat'){tone(520,.65,.07,effects,330);tone(670,.48,.025,effects,470);noise(3.5,.10,85)}
  else if(kind==='cup'){tone(1350,.5,.045,effects);tone(2120,.3,.015,effects)}
  else if(kind==='switch'||kind==='key')noise(.055,.13,kind==='switch'?1500:650);
  else if(kind==='ignite'){noise(.08,.15,2200);noise(.4,.05,700)}
  else if(kind==='blow')noise(.7,.15,450);
  else if(kind==='leaves')noise(1.2,.065,1800);
  else noise(kind==='paper'?.32:.15,.1,900+Math.random()*800);
 }
 const visible=()=>{if(document.hidden)void context?.suspend();else if(context)void context.resume().catch(()=>{})};
 window.addEventListener('pointerdown',unlock);window.addEventListener('keydown',unlock);window.addEventListener('room-sound',sound);document.addEventListener('visibilitychange',visible);unlock();
 return {update(time:number,isDark:boolean,isReading:boolean){dark=isDark;reading=isReading;if(!context)return;const phase=(time+4)%22;const envelope=phase<19?Math.pow(Math.sin(Math.PI*phase/19),4):0;trainGain.gain.setTargetAtTime(envelope*.085*(reading?.65:1),context.currentTime,.12);pan.pan.setTargetAtTime(Math.max(-1,Math.min(1,(phase-9.5)/9.5)),context.currentTime,.15);mix()},dispose(){window.removeEventListener('room-music',changeMusic);window.removeEventListener('room-enter',enter);clearInterval(timer);window.removeEventListener('pointerdown',unlock);window.removeEventListener('keydown',unlock);window.removeEventListener('room-sound',sound);document.removeEventListener('visibilitychange',visible);void context?.close();panel.remove()}};
}
