'use client';
import {useEffect,useRef,useState} from 'react';
import {Game,draw} from '../lib/game';

type Phase='ready'|'playing'|'paused'|'over';
export default function Home(){
 const canvas=useRef<HTMLCanvasElement>(null),game=useRef<Game|null>(null),keys=useRef(new Set<string>()),stick=useRef({x:0,y:0}),firing=useRef(false),phaseRef=useRef<Phase>('ready');
 const [phase,setPhase]=useState<Phase>('ready'),[score,setScore]=useState(0),[best,setBest]=useState(0),[stickPos,setStickPos]=useState({x:0,y:0});
 const setMode=(mode:Phase)=>{phaseRef.current=mode;setPhase(mode);};
 const start=()=>{game.current=new Game();setScore(0);keys.current.clear();stick.current={x:0,y:0};firing.current=false;setMode('playing');canvas.current?.focus();};
 const pause=()=>{if(phaseRef.current==='playing')setMode('paused');else if(phaseRef.current==='paused')setMode('playing');};
 useEffect(()=>{
  game.current=new Game();let high=0;try{high=Number(localStorage.getItem('dead-center-best')||0);}catch{}setBest(high);
  let frame=0,last=0,acc=0;
  const tick=(now:number)=>{const dt=Math.min((now-last)/1000,.05);last=now;const g=game.current!;
   if(phaseRef.current==='playing'){acc+=dt;while(acc>=1/120){g.step(1/120,{x:(keys.current.has('ArrowRight')||keys.current.has('d')?1:0)-(keys.current.has('ArrowLeft')||keys.current.has('a')?1:0)+stick.current.x,y:(keys.current.has('ArrowDown')||keys.current.has('s')?1:0)-(keys.current.has('ArrowUp')||keys.current.has('w')?1:0)+stick.current.y,fire:keys.current.has(' ')||keys.current.has('z')||firing.current});acc-=1/120;}
    setScore(g.score);if(g.dead){setMode('over');if(g.score>high){high=g.score;setBest(high);try{localStorage.setItem('dead-center-best',String(high));}catch{}}}
   } else if(phaseRef.current==='over'){g.step(dt,{x:0,y:0,fire:false});}
   const ctx=canvas.current?.getContext('2d');if(ctx)draw(ctx,g);frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);
  const down=(e:KeyboardEvent)=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if([' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','z','Escape','p','Enter','r'].includes(k)){e.preventDefault();if(e.repeat&&['Enter','p','Escape','r'].includes(k))return;if(k==='p'||k==='Escape'){pause();return;}if(k==='r'){start();return;}if((k==='Enter'||k===' ')&&(phaseRef.current==='ready'||phaseRef.current==='over')){start();return;}if(k==='Enter'&&phaseRef.current==='paused'){setMode('playing');return;}keys.current.add(k);}};
  const up=(e:KeyboardEvent)=>keys.current.delete(e.key.length===1?e.key.toLowerCase():e.key);
  const blur=()=>{keys.current.clear();firing.current=false;stick.current={x:0,y:0};setStickPos({x:0,y:0});if(phaseRef.current==='playing')setMode('paused');};
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);
  const visibility=()=>{if(document.hidden)blur();};document.addEventListener('visibilitychange',visibility);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility);};
 },[]);
 const moveStick=(e:React.PointerEvent<HTMLDivElement>)=>{if(!e.currentTarget.hasPointerCapture(e.pointerId))return;const r=e.currentTarget.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2,n=Math.max(32,Math.hypot(x,y));stick.current={x:x/n,y:y/n};setStickPos({x:x/n*28,y:y/n*28});};
 return <main>
  <header><h1>DEAD CENTER</h1><span>BEST <b>{best}</b></span></header>
  <div className="arena">
   <canvas ref={canvas} width={128} height={128} tabIndex={0} aria-label={`Arena. Score ${score}. Move with arrow keys or WASD. Hold space to fire.`} onPointerDown={e=>{if(e.pointerType==='mouse'&&phaseRef.current==='playing'){firing.current=true;e.currentTarget.setPointerCapture(e.pointerId);}}} onPointerUp={()=>{firing.current=false;}} onPointerCancel={()=>{firing.current=false;}} />
   {phase!=='playing'&&<div className={`overlay ${phase==='over'?'over':''}`}>
    <div className="prompt">
     <h2>{phase==='ready'?'DEAD CENTER':phase==='paused'?'PAUSED':'GAME OVER'}</h2>
     {phase==='ready'?<p>Only shoot toward the center.<br/>Don’t get hit by your own bullet.</p>:phase==='over'?<p className="result">{score}<span>POINTS</span></p>:<p>Take a breath.</p>}
     <button className="play" onClick={phase==='paused'?()=>setMode('playing'):start}>{phase==='ready'?'PLAY':phase==='paused'?'RESUME':'PLAY AGAIN'} <span aria-hidden="true">↗</span></button>
     <small>{phase==='ready'?'ENTER / SPACE TO START':phase==='paused'?'ESC TO RESUME':'ENTER / SPACE TO RESTART'}</small>
    </div>
   </div>}
  </div>
  <footer><span><kbd>WASD</kbd> / <kbd>↑↓←→</kbd> move</span><span><kbd>SPACE</kbd> fire</span><button onClick={pause} disabled={phase==='ready'||phase==='over'}>{phase==='paused'?'Resume':'Pause'} <kbd>ESC</kbd></button></footer>
  <div className="touch-controls"><div className="joystick" role="group" aria-label="Movement joystick" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);moveStick(e);}} onPointerMove={moveStick} onPointerUp={()=>{stick.current={x:0,y:0};setStickPos({x:0,y:0});}} onPointerCancel={()=>{stick.current={x:0,y:0};setStickPos({x:0,y:0});}}><span style={{transform:`translate(${stickPos.x}px,${stickPos.y}px)`}}/><i>MOVE</i></div><button className="fire" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);firing.current=true;e.preventDefault();}} onPointerUp={()=>{firing.current=false;}} onPointerCancel={()=>{firing.current=false;}}>FIRE</button></div>
  <p className="credit">Recreated from the game by mors <span>·</span> #pico1k</p>
 </main>;
}
