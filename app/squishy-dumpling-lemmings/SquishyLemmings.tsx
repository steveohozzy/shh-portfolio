"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type Skill = "floater" | "builder" | "climber" | "digger" | "basher" | "miner" | "blocker"
type BaoKind = "classic" | "strawberry" | "matcha" | "blueberry" | "lavender" | "peach" | "golden" | "rainbow"
type Terrain = { id:number; x:number; y:number; w:number; h:number; kind:"ground"|"rock"|"bridge"|"step" }
type Bao = { id:number; x:number; y:number; vx:number; vy:number; dir:1|-1; kind:BaoKind; skill?:Skill; fall:number; saved:boolean; lost:boolean; buildCount:number; action:number; animation:number }
type Level = { name:string; theme:string; subtitle:string; width:number; spawn:number; rescue:number; rate:number; time:number; exitX:number; exitY:number; terrain:Terrain[]; hazards:{x:number;w:number;kind:string}[] }
type Game = { baos:Bao[]; terrain:Terrain[]; released:number; saved:number; lost:number; elapsed:number; spawnClock:number; nextId:number; running:boolean; complete:boolean; won:boolean }

const makeTerrain = (items:number[][]):Terrain[] => items.map((v,i)=>({id:i,x:v[0],y:v[1],w:v[2],h:v[3],kind:(v[4]===1?"rock":"ground")}))
const LEVELS:Level[] = [
 {name:"A Soft Landing",theme:"Bao Garden",subtitle:"Only floaters can make this first big drop safely.",width:3400,spawn:20,rescue:10,rate:55,time:300,exitX:3220,exitY:470,
  terrain:makeTerrain([[0,450,720,170],[850,450,480,170],[1510,450,580,170],[2290,450,1110,170],[0,270,270,24,1],[430,345,230,24,1],[1000,320,250,24,1],[1420,250,280,24,1],[1800,350,260,24,1],[2150,270,260,24,1],[2600,350,250,24,1]]),hazards:[{x:720,w:130,kind:"pit"},{x:1330,w:180,kind:"pit"},{x:2090,w:200,kind:"pit"}]},
 {name:"The Matcha Maze",theme:"Matcha Mountain",subtitle:"Build across the ravine, bash through the rock and find the exit.",width:3900,spawn:24,rescue:14,rate:48,time:360,exitX:3710,exitY:450,
  terrain:makeTerrain([[0,450,570,170],[900,450,400,170],[1640,450,500,170],[2450,450,450,170],[3200,450,700,170],[250,320,260,24,1],[700,350,220,24,1],[1130,280,280,24,1],[1510,350,180,24,1],[1930,300,300,24,1],[2300,360,250,24,1],[2750,280,300,24,1],[3050,350,220,24,1]]),hazards:[{x:570,w:330,kind:"ravine"},{x:1300,w:340,kind:"ravine"},{x:2140,w:310,kind:"ravine"},{x:2900,w:300,kind:"ravine"}]},
 {name:"Cloud Nine Crossing",theme:"Cloudberry Heights",subtitle:"Climb the walls, mine the slopes and keep the parade together.",width:4300,spawn:28,rescue:18,rate:42,time:420,exitX:4120,exitY:420,
  terrain:makeTerrain([[0,460,480,160],[760,390,450,230],[1450,320,430,300],[2110,430,520,190],[2880,340,500,280],[3630,460,670,160],[400,300,160,24,1],[1030,250,250,24,1],[1680,210,210,24,1],[2320,300,230,24,1],[2750,230,220,24,1],[3300,280,260,24,1]]),hazards:[{x:480,w:280,kind:"pit"},{x:1210,w:240,kind:"pit"},{x:1880,w:230,kind:"pit"},{x:2630,w:250,kind:"pit"},{x:3380,w:250,kind:"pit"}]},
 {name:"The Great Bao Escape",theme:"Rainbow Rooftops",subtitle:"A long, multi-route challenge. Every skill counts.",width:5000,spawn:30,rescue:22,rate:38,time:480,exitX:4820,exitY:450,
  terrain:makeTerrain([[0,450,650,170],[930,450,500,170],[1700,450,520,170],[2510,450,540,170],[3330,450,500,170],[4140,450,860,170],[120,300,280,24,1],[570,340,250,24,1],[1000,270,250,24,1],[1430,330,270,24,1],[1840,250,300,24,1],[2240,330,240,24,1],[2660,270,280,24,1],[3060,330,230,24,1],[3470,250,280,24,1],[3880,330,250,24,1],[4380,270,260,24,1]]),hazards:[{x:650,w:280,kind:"ravine"},{x:1430,w:270,kind:"ravine"},{x:2220,w:290,kind:"ravine"},{x:3050,w:280,kind:"ravine"},{x:3830,w:310,kind:"ravine"}]}
]
const KINDS:BaoKind[]=["classic","strawberry","matcha","blueberry","lavender","peach","golden","rainbow"]
const SKILLS:{id:Skill;name:string;icon:string;hint:string;count:number}[]=[
 {id:"floater",name:"Floater",icon:"☂️",hint:"Drift safely down from high drops",count:8},
 {id:"builder",name:"Builder",icon:"🧱",hint:"Build a staircase over gaps",count:12},
 {id:"climber",name:"Climber",icon:"🪜",hint:"Climb vertical walls",count:6},
 {id:"digger",name:"Digger",icon:"⛏️",hint:"Dig straight down through terrain",count:6},
 {id:"basher",name:"Basher",icon:"👊",hint:"Punch a horizontal tunnel through rock",count:6},
 {id:"miner",name:"Miner",icon:"🔨",hint:"Mine a diagonal tunnel downwards",count:6},
 {id:"blocker",name:"Blocker",icon:"🛑",hint:"Stand still and turn the crowd around",count:4}
]
const PALETTE:Record<BaoKind,{fill:string;line:string;cheek:string}>={classic:{fill:"#fff0d9",line:"#dfbca0",cheek:"#f49c9e"},strawberry:{fill:"#ffc9d8",line:"#e995b0",cheek:"#ef8ea7"},matcha:{fill:"#cce5ae",line:"#96bd7c",cheek:"#f49c9e"},blueberry:{fill:"#c9d6ff",line:"#91a7e6",cheek:"#ee9bb3"},lavender:{fill:"#e3d0ff",line:"#b59add",cheek:"#ef9eb7"},peach:{fill:"#ffd6b7",line:"#e9ae8b",cheek:"#f49c9e"},golden:{fill:"#ffcf63",line:"#d99b2b",cheek:"#f49c9e"},rainbow:{fill:"#d8c5f4",line:"#b59add",cheek:"#f49c9e"}}
const freshGame=(level:Level):Game=>({baos:[],terrain:level.terrain.map(t=>({...t})),released:0,saved:0,lost:0,elapsed:0,spawnClock:0,nextId:0,running:false,complete:false,won:false})
const W=960,H=540,BAO_W=27,BAO_H=25
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n))

function BaoFace({kind,skill}:{kind:BaoKind;skill?:Skill}) {
 const c=PALETTE[kind]
 return <svg viewBox="0 0 100 90" className="sdlem-bao-art" aria-hidden="true">
  <ellipse cx="50" cy="82" rx="30" ry="6" fill="#674d5b" opacity=".15"/>
  <path d="M12 57C8 42 22 28 32 23C38 8 46 8 50 14C57 7 65 12 69 23C82 29 94 43 88 59C84 76 69 81 50 81C30 81 17 74 12 57Z" fill={c.fill} stroke={c.line} strokeWidth="2.5"/>
  <path d="M32 29Q40 19 44 28M50 19V29M57 28Q65 19 69 29" fill="none" stroke={c.line} strokeWidth="2.5" strokeLinecap="round"/>
  <ellipse cx="36" cy="49" rx="3.5" ry="4.5" fill="#543b39"/><ellipse cx="64" cy="49" rx="3.5" ry="4.5" fill="#543b39"/>
  <path d="M44 59Q50 65 56 59" fill="none" stroke="#543b39" strokeWidth="2.5" strokeLinecap="round"/>
  <ellipse cx="26" cy="59" rx="6" ry="3.5" fill={c.cheek} opacity=".7"/><ellipse cx="74" cy="59" rx="6" ry="3.5" fill={c.cheek} opacity=".7"/>
  {skill==="floater"&&<path d="M16 22Q50 -4 84 22Z" fill="#ff91b7" stroke="#b96792" strokeWidth="2"/>}
  {kind==="golden"&&<path d="M79 5L83 14L92 17L83 20L79 29L76 20L67 17L76 14Z" fill="#f4b33c"/>}
 </svg>
}

export default function SquishyLemmings(){
 const [levelIndex,setLevelIndex]=useState(0)
 const [game,setGame]=useState<Game>(()=>freshGame(LEVELS[0]))
 const [selected,setSelected]=useState<Skill>("floater")
 const [counts,setCounts]=useState<Record<Skill,number>>(()=>Object.fromEntries(SKILLS.map(s=>[s.id,s.count])) as Record<Skill,number>)
 const [speed,setSpeed]=useState(1)
 const [camera,setCamera]=useState(0)
 const [sound,setSound]=useState(false)
 const [best,setBest]=useState<Record<number,number>>({})
 const canvasRef=useRef<HTMLCanvasElement>(null)
 const gameRef=useRef(game)
 const cameraRef=useRef(0)
 const level=LEVELS[levelIndex]
 const active=game.baos.filter(b=>!b.saved&&!b.lost).length
 const skill=SKILLS.find(s=>s.id===selected)!
 const setGameSafe=(next:Game)=>{gameRef.current=next;setGame(next)}
 const reset=(index=levelIndex)=>{const next=freshGame(LEVELS[index]);setLevelIndex(index);setGameSafe(next);setCounts(Object.fromEntries(SKILLS.map(s=>[s.id,s.count])) as Record<Skill,number>);setCamera(0);cameraRef.current=0}
 const start=()=>{const next={...gameRef.current,running:true,complete:false};setGameSafe(next)}
 const assign=(id:number)=>{const g=gameRef.current;const bao=g.baos.find(b=>b.id===id);if(!bao||bao.saved||bao.lost||bao.skill||!g.running||g.complete)return;if(counts[selected]<=0)return;const next={...g,baos:g.baos.map(b=>b.id===id?{...b,skill:selected,action:0}:b)};setGameSafe(next);setCounts(c=>({...c,[selected]:c[selected]-1}))}
 const floorAt=(terrain:Terrain[],x:number,y:number)=>terrain.find(t=>x>=t.x-2&&x<=t.x+t.w+2&&y>=t.y-4&&y<=t.y+t.h&&y<=t.y+15)
 const tick=useCallback((source:Game,dt:number):Game=>{
  const g:Game={...source,baos:source.baos.map(b=>({...b})),terrain:source.terrain.map(t=>({...t})),elapsed:source.elapsed+dt}
  if(g.released<level.spawn){g.spawnClock+=dt*level.rate/1000;if(g.spawnClock>=1){g.spawnClock-=1;const id=g.nextId++;g.released++;g.baos.push({id,x:35,y:level.terrain[0].y-BAO_H,vx:55,vy:0,dir:1,kind:KINDS[id%KINDS.length],fall:0,saved:false,lost:false,buildCount:0,action:0,animation:0})}}
  g.baos.forEach(b=>{
   if(b.saved||b.lost)return
   b.animation+=dt
   const nearby=floorAt(g.terrain,b.x+b.dir*BAO_W*.45,b.y+BAO_H*.48)
   const supported=!!nearby
   const wall=g.terrain.some(t=>b.dir===1?b.x+BAO_W/2>=t.x&&b.x+BAO_W/2<=t.x+9&&b.y+BAO_H/2>t.y+4&&b.y-BAO_H/2<t.y+t.h:b.x-BAO_W/2<=t.x+t.w&&b.x-BAO_W/2>=t.x+t.w-9&&b.y+BAO_H/2>t.y+4&&b.y-BAO_H/2<t.y+t.h)
   const nextBao=g.baos.some(o=>o.id!==b.id&&!o.saved&&!o.lost&&Math.abs(o.y-b.y)<BAO_H*.7&&Math.abs(o.x-b.x)<BAO_W*.8&&Math.sign(o.x-b.x)===b.dir)
   if(b.skill==="blocker"){b.vx=0;b.vy=0;return}
   if(b.skill==="basher"&&supported){const target=g.terrain.find(t=>b.dir===1?b.x+BAO_W/2>=t.x-2&&b.x+BAO_W/2<=t.x+16&&b.y>=t.y-BAO_H&&b.y<=t.y+t.h:b.x-BAO_W/2<=t.x+t.w+2&&b.x-BAO_W/2>=t.x+t.w-16&&b.y>=t.y-10&&b.y<=t.y+t.h);if(target){target.x+=b.dir*3;target.w-=3;if(target.w<8)g.terrain=g.terrain.filter(t=>t.id!==target.id);b.x+=b.dir*3;b.y-=1;return}else b.skill=undefined}
   if(b.skill==="digger"&&supported){const t=nearby!;t.h-=5;t.y+=5;b.y+=5;if(t.h<=5)g.terrain=g.terrain.filter(q=>q.id!==t.id);return}
   if(b.skill==="miner"&&supported&&b.action%5===0){const t=nearby!;t.x+=b.dir*5;t.y+=3;t.w-=5;t.h-=3;b.x+=b.dir*5;b.y+=3;if(t.w<12||t.h<8)g.terrain=g.terrain.filter(q=>q.id!==t.id);b.action++;return}
   if(b.skill==="builder"&&supported&&b.action%9===0&&b.buildCount<12){g.terrain.push({id:Date.now()+b.id+b.buildCount,x:b.x+b.dir*7,y:b.y-5,w:23,h:8,kind:"step"});b.x+=b.dir*8;b.y-=5;b.buildCount++;b.action++;return}
   if(!supported){b.vy+= (b.skill==="floater"?170:700)*dt/1000;b.y+=b.vy*dt/1000;b.fall+=b.vy*dt/1000;if(b.y>H+100){b.lost=true;g.lost++}return}
   if(b.vy>0){b.y=nearby!.y-BAO_H/2;b.vy=0;if(b.fall>90&&b.skill!=="floater"){b.lost=true;g.lost++;return}b.fall=0}
   if(wall){if(b.skill==="climber"){b.x+=b.dir*1.5;b.y-=2.4}else b.dir=(b.dir*-1) as 1|-1}
   else if(nextBao&&g.baos.some(o=>o.skill==="blocker"&&!o.saved&&!o.lost&&Math.abs(o.y-b.y)<BAO_H*1.4&&Math.abs(o.x-b.x)<BAO_W*1.5)){b.dir=(b.dir*-1) as 1|-1}
   else {b.x+=b.dir*75*dt/1000;if(b.skill==="builder")b.action++}
   const exit=level.exitX
   if(Math.abs(b.x-exit)<26&&Math.abs(b.y-(level.exitY-BAO_H/2))<55){b.saved=true;g.saved++}
   if(b.x<8){b.x=8;b.dir=1}
   if(b.x>level.width-8){b.x=level.width-8;b.dir=-1}
  })
  if(g.saved>=level.rescue){g.complete=true;g.won=true;g.running=false}
  else if(g.elapsed>=level.time*1000||(g.released>=level.spawn&&g.baos.every(b=>b.saved||b.lost))){g.complete=true;g.running=false;g.won=false}
  return g
 },[level])
 useEffect(()=>{gameRef.current=game},[game])
 useEffect(()=>{try{const v=localStorage.getItem("sdlem-level-best-v2");if(v)setBest(JSON.parse(v));setSound(localStorage.getItem("sdlem-sound")==="true")}catch{}},[])
 useEffect(()=>{
  let raf=0,last=0,acc=0
  const loop=(now:number)=>{if(!last)last=now;const delta=Math.min(50,now-last);last=now
   const current=gameRef.current
   if(current.running&&!current.complete){acc+=delta*speed;while(acc>=33){const next=tick(gameRef.current,33);gameRef.current=next;acc-=33}setGame(gameRef.current)}
   raf=requestAnimationFrame(loop)
  }
  raf=requestAnimationFrame(loop);return()=>cancelAnimationFrame(raf)
 },[speed,tick])
 useEffect(()=>{if(game.won){const n={...best,[levelIndex]:Math.max(best[levelIndex]||0,game.saved)};setBest(n);try{localStorage.setItem("sdlem-level-best-v2",JSON.stringify(n))}catch{}}},[game.complete,game.won,game.saved,levelIndex])
 const draw=useCallback(()=>{
  const canvas=canvasRef.current;if(!canvas)return
  const ctx=canvas.getContext("2d");if(!ctx)return
  const ratio=window.devicePixelRatio||1;const rect=canvas.getBoundingClientRect();canvas.width=Math.round(rect.width*ratio);canvas.height=Math.round(rect.height*ratio);ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0)
  ctx.clearRect(0,0,W,H)
  const cam=cameraRef.current
  const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#dff5ff");sky.addColorStop(1,"#fff0f6");ctx.fillStyle=sky;ctx.fillRect(0,0,W,H)
  ctx.fillStyle="#fff4b5";ctx.beginPath();ctx.arc(820,76,38,0,Math.PI*2);ctx.fill()
  for(let i=0;i<18;i++){const x=((i*270-cam*.25)%1200+1200)%1200;ctx.fillStyle=i%2?"#b6e0d0":"#c8e9d9";ctx.beginPath();ctx.arc(x,430,65+(i%3)*12,Math.PI,0);ctx.fill()}
  ctx.save();ctx.translate(-cam,0)
  gRound(ctx,level.width,0,0,0)
  level.hazards.forEach(h=>{ctx.fillStyle="#9b8db9";ctx.globalAlpha=.12;ctx.fillRect(h.x,H-45,h.w,45);ctx.globalAlpha=1})
  game.terrain.forEach(t=>{ctx.fillStyle=t.kind==="rock"?"#b7a3bd":t.kind==="step"?"#d9b48e":"#9fd3a7";ctx.strokeStyle=t.kind==="rock"?"#907b9b":t.kind==="step"?"#b88b6b":"#6caf83";ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(t.x,t.y,t.w,t.h,5);ctx.fill();ctx.stroke();ctx.fillStyle="#e0f4d9";ctx.fillRect(t.x+5,t.y+3,Math.max(0,t.w-10),3)})
  ctx.fillStyle="#fff8fc";ctx.strokeStyle="#bd8dc2";ctx.lineWidth=6;ctx.beginPath();ctx.roundRect(level.exitX-30,level.exitY-75,62,75,8);ctx.fill();ctx.stroke();ctx.fillStyle="#d7f3e4";ctx.fillRect(level.exitX-20,level.exitY-65,42,65);ctx.fillStyle="#9d6eb0";ctx.font="bold 15px sans-serif";ctx.textAlign="center";ctx.fillText("HOME",level.exitX,level.exitY-82)
  game.baos.forEach(b=>{if(b.saved||b.lost)return;ctx.save();ctx.translate(b.x,b.y);ctx.scale(b.dir,1);const c=PALETTE[b.kind];ctx.fillStyle="#72515e";ctx.globalAlpha=.14;ctx.beginPath();ctx.ellipse(0,12,14,3,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1
   ctx.fillStyle=c.fill;ctx.strokeStyle=c.line;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(-14,5);ctx.bezierCurveTo(-21,-8,-10,-18,-5,-19);ctx.bezierCurveTo(0,-29,7,-22,9,-18);ctx.bezierCurveTo(22,-10,19,1,14,7);ctx.quadraticCurveTo(0,17,-14,5);ctx.fill();ctx.stroke()
   ctx.strokeStyle=c.line;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-7,-17);ctx.quadraticCurveTo(-3,-23,0,-17);ctx.moveTo(2,-17);ctx.quadraticCurveTo(8,-24,11,-15);ctx.stroke()
   ctx.fillStyle="#543b39";ctx.beginPath();ctx.arc(-6,-5,1.8,0,7);ctx.arc(6,-5,1.8,0,7);ctx.fill();ctx.strokeStyle="#543b39";ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,3,.2,Math.PI-.2);ctx.stroke()
   ctx.fillStyle=c.cheek;ctx.globalAlpha=.75;ctx.beginPath();ctx.ellipse(-11,1,3.5,2,0,0,7);ctx.ellipse(11,1,3.5,2,0,0,7);ctx.fill();ctx.globalAlpha=1
   if(b.skill==="floater"){ctx.fillStyle="#ff91b7";ctx.beginPath();ctx.moveTo(-17,-19);ctx.quadraticCurveTo(0,-36,17,-19);ctx.closePath();ctx.fill();ctx.strokeStyle="#b96792";ctx.stroke()}
   if(b.skill==="blocker"){ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(0,-24,9,0,7);ctx.fill();ctx.fillStyle="#a85e8d";ctx.font="bold 12px sans-serif";ctx.textAlign="center";ctx.fillText("!",0,-20)}
   ctx.restore()
  })
  ctx.restore()
 },[game,level])
 useEffect(()=>{draw();const resize=()=>draw();window.addEventListener("resize",resize);return()=>window.removeEventListener("resize",resize)},[draw])
 const clickWorld=(e:React.MouseEvent<HTMLCanvasElement>)=>{const r=e.currentTarget.getBoundingClientRect();const x=(e.clientX-r.left)/r.width*W+cameraRef.current;const y=(e.clientY-r.top)/r.height*H;const hit=game.baos.filter(b=>!b.saved&&!b.lost&&Math.abs(b.x-x)<22&&Math.abs(b.y-y)<23).sort((a,b)=>Math.abs(a.x-x)+Math.abs(a.y-y)-Math.abs(b.x-x)-Math.abs(b.y-y))[0];if(hit)assign(hit.id)}
 const scroll=(direction:number)=>{const next=clamp(cameraRef.current+direction*W*.72,0,level.width-W);cameraRef.current=next;setCamera(next)}
 const zoomTo=(value:number)=>{const next=clamp(value,0,level.width-W);cameraRef.current=next;setCamera(next)}
 const progress=Math.round(game.saved/level.rescue*100)
 return <section className="sdlem-page">
  <div className="sdlem-shell">
   <div className="sdlem-eyebrow">✦ THE GOO GANG PRESENTS ✦</div>
   <div className="sdlem-heading-row"><div><h1>Squishy Dumpling <span>Lemmings</span></h1><p className="sdlem-intro">A whole parade of tiny baos. One very big rescue mission.</p></div><div className="sdlem-sticker">૮ ˶ᵔ ᵕ ᵔ˶ ა<br/><b>BAO!</b></div></div>
   <div className="sdlem-stats"><div><span>LEVEL</span><strong>{String(levelIndex+1).padStart(2,"0")} <small>/ {LEVELS.length}</small></strong></div><div><span>RESCUED</span><strong>{game.saved} <small>/ {level.rescue}</small></strong></div><div><span>IN THE WORLD</span><strong>{active+Math.max(0,level.spawn-game.released)}</strong></div><div><span>LOST</span><strong>{game.lost}</strong></div></div>
   <div className="sdlem-progress"><span style={{width:progress+"%"}}/></div>
   <div className="sdlem-game-frame">
    <div className="sdlem-game-top"><div><span className="sdlem-level-pill">WORLD {levelIndex+1} · {level.theme}</span><h2>{level.name}</h2><p>{level.subtitle}</p></div><div className="sdlem-top-actions"><button className="sdlem-small-btn" onClick={()=>setGameSafe({...gameRef.current,running:!gameRef.current.running})} disabled={game.complete}>{game.running?"Ⅱ Pause":"▶ Resume"}</button><button className="sdlem-small-btn" onClick={()=>{setSound(v=>{localStorage.setItem("sdlem-sound",String(!v));return !v})}}>{sound?"♫ Sound on":"♫ Sound off"}</button></div></div>
    <div className="sdlem-canvas-wrap"><canvas ref={canvasRef} className="sdlem-canvas" onClick={clickWorld} aria-label="Scrollable Squishy Dumpling Lemmings level. Click a dumpling to assign the selected skill."/><div className="sdlem-canvas-hint">CLICK A DUMPLING TO GIVE IT A SKILL</div></div>
    <div className="sdlem-camera"><button onClick={()=>scroll(-1)} aria-label="Scroll level left">←</button><input aria-label="Scroll through level" type="range" min="0" max={Math.max(0,level.width-W)} value={camera} onChange={e=>zoomTo(Number(e.target.value))}/><button onClick={()=>scroll(1)} aria-label="Scroll level right">→</button><span>{Math.round(camera/level.width*100)}% explored</span></div>
    <div className="sdlem-message" role="status">{game.complete?(game.won?"🎉 Bao-tastic! You rescued enough dumplings.":"💗 The parade is over. Try a different skill plan."):"✦ "+(game.running?"The parade is marching! Assign skills before the next obstacle.":"Press Release Bao Parade when you're ready.")}</div>
    {game.complete&&<div className="sdlem-result"><b>{game.won?"Level complete!":"Nearly there!"}</b><span>{game.saved} rescued · {game.lost} lost · {level.spawn} total</span><div><button onClick={()=>reset()}>↻ Retry level</button>{game.won&&levelIndex<LEVELS.length-1&&<button onClick={()=>reset(levelIndex+1)}>Next level →</button>}</div></div>}
   </div>
   <div className="sdlem-controls">
    <div className="sdlem-section-heading"><div><span className="sdlem-kicker">YOUR TOOLBOX</span><h2>Assign a skill</h2></div><span className="sdlem-tool-hint">Select a skill, then click a dumpling in the level.</span></div>
    <div className="sdlem-skills">{SKILLS.map(s=><button key={s.id} className={"sdlem-skill"+(selected===s.id?" is-selected":"")} onClick={()=>setSelected(s.id)}><span className="sdlem-skill-icon">{s.icon}</span><span className="sdlem-skill-copy"><b>{s.name}</b><small>{s.hint}</small></span><span className="sdlem-skill-count">{counts[s.id]}</span></button>)}</div>
    <div className="sdlem-bottom-row"><div className="sdlem-selected-hint"><span>{skill.icon}</span><div><b>{skill.name} selected</b><small>{skill.hint} · {counts[selected]} remaining</small></div></div><div className="sdlem-play-actions"><label className="sdlem-speed">Speed <select value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={1}>1×</option><option value={2}>2×</option><option value={4}>4×</option></select></label><button className="sdlem-reset" onClick={()=>reset()}>↻ Restart</button><button className="sdlem-release" onClick={()=>game.running?setGameSafe({...gameRef.current,running:false}):start()}>{game.running?"Ⅱ Pause":"▶ Release Bao Parade"}</button></div></div>
   </div>
   <div className="sdlem-level-select"><div><span className="sdlem-kicker">THE BAO ADVENTURE</span><h2>Choose your level</h2><p>Longer routes, bigger obstacles and more skills to master.</p></div><div className="sdlem-world-cards">{LEVELS.map((l,i)=><button key={l.name} onClick={()=>i===0||best[i-1]!==undefined||i<=levelIndex?reset(i):undefined} className={"sdlem-world-card"+(i===levelIndex?" is-current":"")+(i>0&&i>levelIndex&&best[i-1]===undefined?" is-locked":"")}><span className="sdlem-world-number">{i===0||i<=levelIndex||best[i-1]!==undefined?"0"+(i+1):"🔒"}</span><span className="sdlem-world-emoji">{["🌷","🍵","☁️","🌈"][i]}</span><b>{l.name}</b><small>{i===levelIndex?"You're here":i===0||i<=levelIndex||best[i-1]!==undefined?"Tap to play":"Complete the previous level"}</small></button>)}</div></div>
   <div className="sdlem-howto"><span className="sdlem-howto-icon">💡</span><div><b>How to play</b><p>Like the classic lemmings puzzle, your dumplings march on their own. You don't steer them — you assign skills to solve the landscape. Blockers stand still and turn the parade back, builders create steps, bashers punch sideways through rock, miners carve a diagonal path and diggers tunnel down. Floaters slow long falls and climbers scale walls. Scroll across the wide level to see what's coming, and rescue the required number before time runs out.</p></div></div>
   <div className="sdlem-character-strip"><div><span>MEET THE PARADE</span><b>Eight squishy personalities, one big mission.</b></div>{KINDS.map(k=><div key={k} className="sdlem-character"><span className="sdlem-character-dot" style={{background:PALETTE[k].fill}}/><small>{k}</small></div>)}</div>
  </div>
 </section>
}

function gRound(_ctx:CanvasRenderingContext2D,_width:number,_x:number,_y:number,_r:number){}
