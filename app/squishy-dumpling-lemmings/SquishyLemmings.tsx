"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { PointerEvent as ReactPointerEvent } from "react"

type Skill = "climber" | "floater" | "bomber" | "blocker" | "builder" | "basher" | "miner" | "digger"
type Terrain = { x:number; y:number; w:number; h:number; steel?:boolean; bridge?:boolean }
type Hazard = { x:number; y:number; w:number; h:number; kind:"water"|"fire"|"trap" }
type Level = { id:number; name:string; group:string; width:number; total:number; rescue:number; seconds:number; rate:number; hatch:number; exit:number; terrain:Terrain[]; hazards:Hazard[]; skills:Record<Skill,number>; objective:string }
type Bao = { id:number; variant:number; x:number; y:number; dir:1|-1; vy:number; fall:number; skill?:Skill; action:number; saved:boolean; dead:boolean; bomber:number; build:number; frame:number; splat?:number; climbTop?:number; climbExitX?:number }
type Game = { baos:Bao[]; terrain:Terrain[]; spawned:number; saved:number; dead:number; clock:number; spawnClock:number; camera:number; cameraFollow:boolean; running:boolean; paused:boolean; complete:boolean; failed:boolean; rate:number; speed:number; selected:Skill; skills:Record<Skill,number>; nextId:number }

const SKILLS: {id:Skill; label:string; icon:string; tip:string}[] = [
 {id:"climber",label:"Climber",icon:"🧗",tip:"Climb vertical walls"},
 {id:"floater",label:"Floater",icon:"☂️",tip:"Float safely down"},
 {id:"bomber",label:"Bomber",icon:"💣",tip:"Explode after a short fuse"},
 {id:"blocker",label:"Blocker",icon:"🛑",tip:"Stop and turn the crowd"},
 {id:"builder",label:"Builder",icon:"🧱",tip:"Build a staircase"},
 {id:"basher",label:"Basher",icon:"👊",tip:"Tunnel horizontally"},
 {id:"miner",label:"Miner",icon:"⛏️",tip:"Mine diagonally down"},
 {id:"digger",label:"Digger",icon:"⬇️",tip:"Dig straight down"}
]
const EMPTY_SKILLS:Record<Skill,number>={climber:4,floater:4,bomber:4,blocker:4,builder:12,basher:8,miner:6,digger:6}
const GROUPS=["Mellow","Mischievous","Tricky","Bao-nkers"]
const GROUP_COLOURS=["#9ed9ae","#f2c16e","#b9a4e8","#ed9bbd"]
const W=960, H=420, BAO_W=44, BAO_H=44, GROUND=385

function makeLevel(id:number):Level {
 const group=Math.floor(id/30), n=id%30;
 const width=2520+group*180+(id%5)*110;
 const terrain:Terrain[]=[{x:0,y:GROUND-26,w:width,h:140}];
 const hazards:Hazard[]=[];
 let gapCount=0;
 const rand=(()=>{let seed=(id+1)*7919;return()=>{seed=(seed*48271)%2147483647;return seed/2147483647}})();
 const wall=(x:number,top:number,w=34)=>terrain.push({x,y:top,w,h:GROUND-26-top});
 const shelf=(x:number,y:number,w:number)=>terrain.push({x,y,w,h:15});
 const steel=(x:number,y:number,w:number,h=18)=>terrain.push({x,y,w,h,steel:true});
 const ramp=(x:number,y:number,steps:number,dir:1|-1=1)=>{
  for(let k=0;k<steps;k++)terrain.push({x:x+(dir===1?k*21:(steps-k-1)*21),y:y-k*12,w:23,h:GROUND-26-(y-k*12)});
 };
 const gap=(x:number,w:number,kind:"water"|"pit"="pit")=>{
  if(gapCount>=2)return;
  gapCount++;
  w=Math.min(90,w);
  const right=x+w;
  for(let i=terrain.length-1;i>=0;i--){
   const t=terrain[i];
   if(t.y!==GROUND-26||t.h!==140||right<=t.x||x>=t.x+t.w)continue;
   terrain.splice(i,1);
   if(x>t.x)terrain.push({x:t.x,y:t.y,w:x-t.x,h:t.h});
   if(right<t.x+t.w)terrain.push({x:right,y:t.y,w:t.x+t.w-right,h:t.h});
  }
  if(kind==="water")hazards.push({x,y:GROUND-26,w,h:140,kind:"water"});
 };
 const names=[
  "Bao Boulevard","The Wobble Wall","Pudding Gap","The Sticky Passage","Cloud Kitchen","Jellybean Crossing","The Noodle Maze","Mooncake Mountain","Steamed-Up Summit","The Great Bao Escape",
  "Bamboo Bounce","The Sugar Steps","Peachy Passage","The Bao Bridge","Cloudtop Crossing","The Winding Walkway","Pillow Fort","The Matcha Mine","Honeycomb Heights","The Great Drop",
  "Steamer Express","The Split-Level","Lavender Labyrinth","The Golden Gate","Rainbow Run","The Wobbly Workshop","The Secret Staircase","The Waterway","The Castle Courtyard","Homeward Bound"
 ];
 const prefixes=["","Sugar Rush · ","Cloud Kingdom · ","Midnight Mochi · "];
 const title=prefixes[group]+names[n]+(n>=10?" "+String(n+1).padStart(2,"0"):"");
 const skills:Record<Skill,number>={climber:0,floater:0,bomber:0,blocker:0,builder:0,basher:0,miner:0,digger:0};
 const total=group===0?12:group===1?18:group===2?24:30;
 const rescue=[65,72,78,84][group];
 let objective="Guide the parade safely to the pavilion";
 if(id===0){wall(510,205,38);skills.basher=12;objective="Learn to bash through a soft wall"}
 else if(id===1){wall(620,255,42);skills.climber=12;skills.floater=2;objective="Climb the tall wall and reach the exit"}
 else if(id===2){gap(720,85);shelf(980,285,190);skills.builder=5;skills.floater=4;objective="Build a staircase across the first chasm"}
 else if(id===3){wall(540,195,34);gap(1050,85);wall(1510,175,36);skills.basher=3;skills.builder=5;skills.miner=3;objective="Combine tunnelling and building to cross the split path"}
 else {
  const sections=3+group+Math.floor(n/7);
  const startX=360;
  const usable=width-760;
  for(let i=0;i<sections;i++){
   const fraction=(i+1)/(sections+1);
   const x=Math.round(startX+usable*fraction+(rand()-.5)*105);
   const variant=(id*7+i*11+Math.floor(rand()*8))%8;
   if(variant===0){wall(x,145+Math.round(rand()*85),32+Math.round(rand()*12))}
   else if(variant===1){shelf(x,245-Math.round(rand()*85),145+Math.round(rand()*95))}
   else if(variant===2){ramp(x,315-Math.round(rand()*25),5+Math.floor(rand()*4),rand()>.5?1:-1)}
   else if(variant===3){if(group===0)wall(x,165+Math.round(rand()*65),38);else steel(x,235-Math.round(rand()*65),120+Math.round(rand()*75))}
   else if(variant===4){gap(x,65+Math.round(rand()*25),group>=1&&rand()>.25?"water":"pit")}
   else if(variant===5){wall(x,180,34);shelf(x+105,270-Math.round(rand()*45),135)}
   else if(variant===6){shelf(x,285,145);shelf(x+190,225,145);wall(x+390,155,34)}
   else{gap(x,65+Math.round(rand()*25));ramp(x+115,315,5,1)}
  }
  skills.climber=group===0?(n>5?2:0):Math.max(1,4-group);
  skills.floater=group===0?(n>8?2:1):3+group;
  skills.bomber=group===0?1:2+group;
  skills.blocker=group===0?(n>14?1:0):1+group;
  skills.builder=Math.max(2,9-group*2-Math.floor(n/10));
  skills.basher=Math.max(1,6-group-Math.floor(n/12));
  skills.miner=group===0?(n>20?1:0):Math.max(1,4-group);
  skills.digger=group<2?(n>21?1:0):Math.max(1,3-group);
  if(group>=2&&n%4===0){
   const hx=Math.round(width*(.42+rand()*.28));
   hazards.push({x:hx,y:GROUND-62,w:42+Math.round(rand()*24),h:62,kind:"trap"});
  }
  if(group===3&&n%3===0){
   const hx=Math.round(width*(.3+rand()*.35));
   hazards.push({x:hx,y:GROUND-62,w:78,h:62,kind:"fire"});
  }
  const challenges=[
   "Find the safe route through staggered platforms",
   "Use a builder to bridge the wide break",
   "Keep the group moving past the steel barrier",
   "Choose the right worker to open a tunnel",
   "Manage the crowd around the hazard",
   "Rescue the required number with a limited toolkit",
   "Cross the split route without losing the parade",
   "Use height and timing to reach the pavilion"
  ];
  objective=challenges[(id*5+n)%challenges.length];
 }
 terrain.push({x:0,y:GROUND-26,w:150,h:26},{x:width-260,y:GROUND-26,w:260,h:26});
 const seconds=group===0?300:group===1?285:group===2?270:255;
 return {id,name:title,group:GROUPS[group],width,total,rescue,seconds,rate:24+group*5+Math.floor(n/8),hatch:75,exit:width-115,terrain,hazards,skills,objective};
}

/**
 * The opening campaign is authored rather than randomly assembled.
 * Keep these layouts deliberately readable: each introduces a small number
 * of hazards or terrain decisions before later groups combine them.
 */
function makeOpeningPuzzle(id:number):Level|null {
 const authored:Record<number,{
  name:string;objective:string;width:number;total?:number;rescue?:number;rate?:number;
  gaps?:{x:number;w:number;water?:boolean}[];
  walls?:{x:number;y:number;w:number;h:number}[];
  platforms?:{x:number;y:number;w:number;h?:number;steel?:boolean}[];
  hazards?:Hazard[];
  skills:Partial<Record<Skill,number>>;
 }> = {
  // Level 5 — teach bashing, then ask the player to use the opening it creates.
  4:{name:"Cloud Kitchen",objective:"Open the two sealed kitchen passages. The second wall is narrower, so save a basher for it.",width:2260,walls:[
   {x:470,y:218,w:48,h:141},{x:1120,y:185,w:42,h:174},
   {x:1570,y:248,w:48,h:111}
  ],platforms:[
   {x:700,y:305,w:150},{x:880,y:270,w:145},{x:1320,y:315,w:130},{x:1810,y:292,w:170}
  ],skills:{basher:3}},
  // Level 6 — two separate bridges, with a raised landing between them.
  5:{name:"Jellybean Crossing",objective:"Two breaks interrupt the parade. Build across each one, using the raised middle shelf as a landing.",width:2380,gaps:[
   {x:520,w:76},{x:1120,w:84}
  ],platforms:[
   {x:760,y:300,w:210},{x:1450,y:292,w:190},{x:1680,y:250,w:145},{x:1900,y:305,w:140}
  ],skills:{builder:5,floater:2}},
  // Level 7 — a layered maze. Bash the lower walls; the steel roof is deliberately indestructible.
  6:{name:"The Noodle Maze",objective:"The lower route is blocked twice. Bash through the soft walls; the steel canopy cannot be destroyed.",width:2420,walls:[
   {x:440,y:235,w:42,h:124},{x:1010,y:210,w:46,h:149},{x:1740,y:240,w:42,h:119}
  ],platforms:[
   {x:610,y:300,w:190},{x:820,y:265,w:170},{x:1190,y:285,w:190},
   {x:1430,y:250,w:190},{x:1640,y:205,w:135}
  ],skills:{basher:3,blocker:1}},
  // Level 8 — climb to the upper gallery, then descend safely to the exit route.
  7:{name:"Mooncake Mountain",objective:"Climb the tall outer wall to reach the gallery. The far drop is too high to survive without a floater.",width:2320,walls:[
   {x:560,y:150,w:46,h:209}
  ],platforms:[
   {x:606,y:235,w:310},{x:980,y:195,w:230},{x:1260,y:245,w:210},
   {x:1540,y:285,w:180},{x:1830,y:315,w:170}
  ],skills:{climber:12,floater:4}},
  // Level 9 — steel changes the route: it supports the upper crossing but cannot be mined or bashed.
  8:{name:"Steamed-Up Summit",objective:"The steel shelf is permanent. Use the lower soft-rock passage and the stepped ledges to reach the far side.",width:2460,walls:[
   {x:650,y:225,w:42,h:134},{x:1470,y:205,w:42,h:154}
  ],platforms:[
   {x:820,y:300,w:170},{x:1010,y:270,w:170},{x:1200,y:240,w:180},
   {x:1580,y:295,w:150},{x:1770,y:260,w:170}
  ],gaps:[{x:1970,w:72}],skills:{basher:2,builder:3,miner:2,floater:2}},
  // Level 10 — a water basin with a stepped approach and a second, ordinary pit.
  9:{name:"The Great Bao Escape",objective:"The blue basin is deadly. Build a continuous crossing, then bridge the smaller dry pit before the pavilion.",width:2500,gaps:[
   {x:620,w:88,water:true},{x:1510,w:76}
  ],platforms:[
   {x:820,y:315,w:170},{x:1030,y:278,w:170},{x:1240,y:315,w:150},
   {x:1710,y:300,w:180},{x:1940,y:270,w:155}
  ],skills:{builder:7,floater:3}},
  // Level 11 — the trap sits in the obvious corridor; the upper ledges provide an alternative route.
  10:{name:"Bamboo Bounce",objective:"Don't send the parade through the trap. Use the stepped upper route, then bring everyone back down to the main path.",width:2380,hazards:[
   {x:690,y:323,w:58,h:62,kind:"trap"},{x:1500,y:323,w:58,h:62,kind:"trap"}
  ],walls:[
   {x:520,y:205,w:42,h:154},{x:1270,y:220,w:42,h:139}
  ],platforms:[
   {x:570,y:285,w:210},{x:800,y:245,w:190},{x:1010,y:285,w:180},
   {x:1390,y:285,w:190},{x:1610,y:245,w:190},{x:1830,y:285,w:180}
  ],skills:{climber:12,builder:5,blocker:1,floater:2}},
  // Level 12 — combine a climb, a bridge and a controlled descent.
  11:{name:"The Sugar Steps",objective:"Scale the first tower, bridge the broken upper walkway, then float down to the low exit path.",width:2520,walls:[
   {x:470,y:145,w:48,h:214},{x:1640,y:205,w:44,h:154}
  ],gaps:[{x:1120,w:88}],platforms:[
   {x:518,y:250,w:250},{x:820,y:220,w:190},{x:1010,y:250,w:110},
   {x:1210,y:250,w:200},{x:1450,y:285,w:150},{x:1730,y:295,w:180},{x:1950,y:320,w:150}
  ],skills:{climber:12,builder:5,floater:4,basher:1}}
 };
 const spec=authored[id];
 if(!spec)return null;
 const floorY=GROUND-26;
 const terrain:Terrain[]=[];
 const hazards:Hazard[]=(spec.hazards||[]).map(h=>({...h}));
 const gaps=(spec.gaps||[]).slice().sort((a,b)=>a.x-b.x);
 let cursor=0;
 gaps.forEach(g=>{
  if(g.x>cursor)terrain.push({x:cursor,y:floorY,w:g.x-cursor,h:140});
  if(g.water)hazards.push({x:g.x,y:floorY,w:g.w,h:140,kind:"water"});
  cursor=g.x+g.w;
 });
 if(cursor<spec.width)terrain.push({x:cursor,y:floorY,w:spec.width-cursor,h:140});
 (spec.walls||[]).forEach(w=>terrain.push({...w}));
 (spec.platforms||[]).forEach(p=>terrain.push({x:p.x,y:p.y,w:p.w,h:p.h||15,steel:p.steel}));
 // Keep the hatch and rescue pavilion on dependable ground.
 terrain.push({x:0,y:floorY,w:150,h:26},{x:spec.width-260,y:floorY,w:260,h:26});
 const skills:Record<Skill,number>={climber:0,floater:0,bomber:0,blocker:0,builder:0,basher:0,miner:0,digger:0};
 Object.keys(spec.skills).forEach(key=>{skills[key as Skill]=spec.skills[key as Skill]||0});
 return {
  id,name:spec.name,group:GROUPS[0],width:spec.width,total:spec.total||12,
  rescue:spec.rescue||65,seconds:300,rate:spec.rate||24,hatch:75,
  exit:spec.width-115,terrain,hazards,skills,objective:spec.objective
 };
}
const LEVELS=Array.from({length:120},(_,i)=>makeOpeningPuzzle(i)||makeLevel(i))
const BAO_COLOURS=["#fff0d9","#ffc9d8","#cce5ae","#c9d6ff","#e3d0ff","#ffd6b7","#ffcf63","#f3a6d0"]
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v))
const floorAt=(terrain:Terrain[],x:number,y:number)=>terrain.filter(t=>x>=t.x-2&&x<=t.x+t.w+2&&y<=t.y+34&&y>=t.y-32).sort((a,b)=>a.y-b.y)[0]
const solidAt=(terrain:Terrain[],x:number,y:number)=>terrain.some(t=>x>=t.x&&x<=t.x+t.w&&y>=t.y&&y<=t.y+t.h)
const cloneSkills=(s:Record<Skill,number>)=>({...s})

function carveTerrain(terrain:Terrain[], x:number, y:number, w:number, h:number){
 const right=x+w, bottom=y+h;
 for(let i=terrain.length-1;i>=0;i--){
  const t=terrain[i], ix=Math.max(x,t.x), iy=Math.max(y,t.y), ir=Math.min(right,t.x+t.w), ib=Math.min(bottom,t.y+t.h);
  if(ix>=ir||iy>=ib||t.steel)continue;
  const pieces:Terrain[]=[];
  if(iy>t.y)pieces.push({...t,h:iy-t.y});
  if(ib<t.y+t.h)pieces.push({...t,y:ib,h:t.y+t.h-ib});
  if(ix>t.x)pieces.push({...t,y:iy,w:ix-t.x,h:ib-iy});
  if(ir<t.x+t.w)pieces.push({...t,x:ir,y:iy,w:t.x+t.w-ir,h:ib-iy});
  terrain.splice(i,1,...pieces);
 }
}


export default function SquishyLemmings(){
 const canvasRef=useRef<HTMLCanvasElement|null>(null)
 const gameRef=useRef<Game|null>(null)
 const levelRef=useRef<Level>(LEVELS[0])
 const rafRef=useRef<number>(0)
 const lastRef=useRef(0)
 const [levelId,setLevelId]=useState(0)
 const [selected,setSelected]=useState<Skill>("floater")
 const [hud,setHud]=useState({spawned:0,saved:0,dead:0,time:360,rate:20,active:0,percent:0,paused:false,running:false,complete:false,failed:false})
 const [camera,setCamera]=useState(0)
 const [cameraFollow,setCameraFollow]=useState(false)
 const miniDragRef=useRef(false)
 const [speed,setSpeed]=useState(1)
 const [best,setBest]=useState<Record<number,number>>({})
 const level=LEVELS[levelId]
 let unlockedThrough=0
 for(let i=0;i<LEVELS.length;i++){
  const required=Math.ceil(LEVELS[i].total*LEVELS[i].rescue/100)
  if((best[i]||0)>=required)unlockedThrough=Math.min(119,i+1)
  else break
 }
 levelRef.current=level
 if(!gameRef.current){gameRef.current={baos:[],terrain:level.terrain.map(t=>({...t})),spawned:0,saved:0,dead:0,clock:level.seconds,spawnClock:0,camera:0,cameraFollow:false,running:false,paused:false,complete:false,failed:false,rate:level.rate,speed:1,selected:"floater",skills:cloneSkills(level.skills),nextId:0}}

 const reset=useCallback((id=levelId)=>{
  const l=LEVELS[id]
  gameRef.current={baos:[],terrain:l.terrain.map(t=>({...t})),spawned:0,saved:0,dead:0,clock:l.seconds,spawnClock:0,camera:0,cameraFollow:false,running:false,paused:false,complete:false,failed:false,rate:l.rate,speed:1,selected:"floater",skills:cloneSkills(l.skills),nextId:0}
  setLevelId(id);setSelected("floater");setCamera(0);setCameraFollow(false);setSpeed(1)
  setHud({spawned:0,saved:0,dead:0,time:l.seconds,rate:l.rate,active:0,percent:0,paused:false,running:false,complete:false,failed:false})
 },[levelId])

 useEffect(()=>{try{const v=localStorage.getItem("sdlem-campaign-best");if(v)setBest(JSON.parse(v))}catch{}},[])

 const start=()=>{const g=gameRef.current;if(!g)return;if(g.complete||g.failed)reset(levelId);const next=gameRef.current;if(next){next.running=true;next.paused=false}}
 const pause=()=>{const g=gameRef.current;if(g){g.paused=!g.paused;setHud(h=>({...h,paused:g.paused}))}}
 const assign=(skill:Skill)=>{const g=gameRef.current;if(!g)return;g.selected=skill;setSelected(skill)}
 const setRate=(delta:number)=>{const g=gameRef.current;if(g)g.rate=clamp(g.rate+delta,1,99)}
 const changeSpeed=(v:number)=>{setSpeed(v);const g=gameRef.current;if(g)g.speed=v}
 const nuke=()=>{const g=gameRef.current;if(!g||!g.running)return;g.baos.forEach(b=>{if(!b.saved&&!b.dead&&b.skill!=="blocker"){b.skill="bomber";b.bomber=5}})}
 const selectLevel=(id:number)=>{if(id<=unlockedThrough)reset(id)}
 const setFollow=(value:boolean)=>{const g=gameRef.current;if(g)g.cameraFollow=value;setCameraFollow(value)}
 const moveCamera=(value:number)=>{const g=gameRef.current;if(!g)return;g.camera=clamp(value,0,Math.max(0,levelRef.current.width-W));setCamera(g.camera)}
 const handleCanvasMove=(event:ReactPointerEvent<HTMLCanvasElement>)=>{
  const g=gameRef.current;if(!g)return
  const rect=event.currentTarget.getBoundingClientRect()
  const x=(event.clientX-rect.left)/rect.width*W
  if(miniDragRef.current){moveCamera(((x-(W-272))/260)*levelRef.current.width-W/2);return}
  if(!g.cameraFollow&&event.buttons===0){if(x<18)moveCamera(g.camera-18);else if(x>W-18)moveCamera(g.camera+18)}
 }

 const clickWorld=(event:ReactPointerEvent<HTMLCanvasElement>)=>{
  const g=gameRef.current;if(!g||!g.running||g.paused)return
  const rect=event.currentTarget.getBoundingClientRect()
  const screenX=(event.clientX-rect.left)/rect.width*W
  const px=screenX+g.camera
  const py=(event.clientY-rect.top)/rect.height*H
  if(py>H-42&&screenX>W-285){event.currentTarget.setPointerCapture(event.pointerId);moveCamera(((screenX-(W-272))/260)*levelRef.current.width-W/2);miniDragRef.current=true;return}
  const bao=g.baos.filter(b=>!b.saved&&!b.dead).sort((a,b)=>Math.abs(a.x-px)+Math.abs(a.y-py)-Math.abs(b.x-px)-Math.abs(b.y-py))[0]
  // Wider hit area makes tapping individual workers easier on phones.
  if(!bao||Math.abs(bao.x-px)>48||Math.abs(bao.y-py)>52)return
  // Skill assignments are permanent once made, as in classic Lemmings.
  if(bao.skill)return

  if(g.skills[g.selected]<=0)return
  bao.skill=g.selected
  g.skills[g.selected]--
  if(g.selected==="bomber")bao.bomber=2.5
 }

 useEffect(()=>{
  const canvas=canvasRef.current;if(!canvas)return
  const ctx=canvas.getContext("2d");if(!ctx)return
  let alive=true
  let hudTick=0
  const baoSprites:HTMLImageElement[]=[]
  const baoStyles=[
   {body:"#fff0d8",shade:"#f3d4ac",detail:"#dba98a"},
   {body:"#ffd8e5",shade:"#f4aac3",detail:"#e98cab"},
   {body:"#d7edb9",shade:"#a9ce85",detail:"#7ca95e"},
   {body:"#c5e7ff",shade:"#83b9f1",detail:"#528bd0"},
   {body:"#ead7ff",shade:"#c3a0ef",detail:"#9970ce"},
   {body:"#ffdbc0",shade:"#ffb08e",detail:"#e78370"},
   {body:"#fff064",shade:"#ffad08",detail:"#d97800"},
   {body:"#ff8cdb",shade:"#9d62ff",detail:"#6735db"}
  ]
  baoStyles.forEach((style,index)=>{
   const rainbow=index===7
   const stops=rainbow?'<stop offset="0%" stop-color="#ff78bb"/><stop offset="28%" stop-color="#ffad69"/><stop offset="50%" stop-color="#fff078"/><stop offset="70%" stop-color="#71edc2"/><stop offset="100%" stop-color="#8a70ff"/>': '<stop offset="0%" stop-color="'+style.body+'"/><stop offset="100%" stop-color="'+style.shade+'"/>'
   const stripes=rainbow?'<g clip-path="url(#clip)"><path d="M5 47 L115 78" stroke="#ff477e" stroke-width="12"/><path d="M5 61 L115 92" stroke="#ffdc48" stroke-width="11"/><path d="M5 75 L100 102" stroke="#48e3a3" stroke-width="10"/></g>':''
   const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 112"><defs><linearGradient id="body" x1="0" y1="0" x2=".8" y2="1">'+stops+'</linearGradient><clipPath id="clip"><path d="M15 70 Q9 53 25 39 Q35 30 45 26 Q52 18 60 25 Q68 18 75 27 Q90 30 99 43 Q112 57 105 75 Q98 95 60 98 Q22 97 15 70Z"/></clipPath></defs><ellipse cx="60" cy="99" rx="34" ry="5" fill="#b98976" opacity=".13"/><path d="M15 70 Q9 53 25 39 Q35 30 45 26 Q52 18 60 25 Q68 18 75 27 Q90 30 99 43 Q112 57 105 75 Q98 95 60 98 Q22 97 15 70Z" fill="url(#body)" stroke="'+style.detail+'" stroke-width="3"/> '+stripes+'<path d="M29 43 Q39 32 47 32 M52 29 Q60 24 66 31 M74 32 Q84 34 91 45" fill="none" stroke="#fffaf0" stroke-width="4" stroke-linecap="round"/><ellipse cx="34" cy="70" rx="7" ry="4" fill="#f49ca8" opacity=".8"/><ellipse cx="86" cy="70" rx="7" ry="4" fill="#f49ca8" opacity=".8"/><ellipse cx="44" cy="62" rx="3.7" ry="5" fill="#59464a"/><ellipse cx="76" cy="62" rx="3.7" ry="5" fill="#59464a"/><path d="M54 71 Q60 78 66 71" fill="none" stroke="#59464a" stroke-width="2.8" stroke-linecap="round"/><path d="M28 53 Q31 49 35 52 M83 52 Q88 49 91 53" fill="none" stroke="#fffaf0" stroke-width="2.5" stroke-linecap="round"/></svg>'
   const img=new Image()
   img.onload=()=>{baoSprites[index]=img}
   img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg)
  })
  const draw=()=>{
   if(!alive)return
   const g=gameRef.current,l=levelRef.current
   if(!g){rafRef.current=requestAnimationFrame(draw);return}
   const now=performance.now(),dt=Math.min(.05,(now-(lastRef.current||now))/1000);lastRef.current=now
   if(g.running&&!g.paused&&!g.complete&&!g.failed){
    const step=dt*g.speed
    g.clock=Math.max(0,g.clock-step)
    // Classic release-rate scale: the setting is dumplings per minute, not a frame multiplier.
    g.spawnClock+=step*(g.rate/60)
    if(g.spawned<l.total&&g.spawnClock>=1){
     g.spawnClock-=1
     g.baos.push({id:g.nextId++,variant:g.nextId%8,x:l.hatch+26,y:GROUND-52,dir:1,vy:0,fall:0,action:0,saved:false,dead:false,bomber:0,build:0,frame:0})
     g.spawned++
    }
    g.baos.forEach(b=>{
     if(b.saved)return
     if(b.dead){b.frame+=step;return}
     b.frame+=step
     if(b.bomber>0){b.bomber-=step;if(b.bomber<=0){carveTerrain(g.terrain,b.x-38,b.y-34,76,68);b.dead=true;b.splat=1;g.dead++;return}}
     if(bomberSkillHazard(b,l.hazards)){b.dead=true;b.splat=1;g.dead++;return}
     const foot=b.y+BAO_H/2
     const support=floorAt(g.terrain,b.x,foot)
     const supported=!!support
     const frontX=b.x+b.dir*(BAO_W/2+2)
     // Bridge pieces form one continuous staircase surface. Their exposed
     // rectangle edges must never count as walls; floorAt() handles the
     // individual tops as the dumpling walks across them.
     const wall=g.terrain.some(t=>
      !t.bridge&&frontX>=t.x&&frontX<=t.x+t.w&&
      ((b.y-4)>=t.y&&(b.y-4)<=t.y+t.h||(b.y+4)>=t.y&&(b.y+4)<=t.y+t.h)
     )
     const blocker=g.baos.find(o=>o!==b&&!o.dead&&!o.saved&&o.skill==="blocker"&&o.action===1&&Math.abs(o.x-b.x)<18&&Math.abs(o.y-b.y)<24)
     if(b.skill==="blocker"&&supported){b.y=support!.y-BAO_H/2;b.vy=0;b.fall=0;b.action=1;return}
     if(blocker){b.dir=(b.x<blocker.x?-1:1);b.x+=b.dir*1.2;return}
     // Once a climber starts scaling a wall, keep climbing even after its
     // head rises above the wall's collision area. Finish on the far side.
     if(b.skill==="climber"&&b.climbTop!==undefined&&b.climbExitX!==undefined){
      b.vy=0;
      b.fall=0;
      b.y-=118*step;
      if(b.y+BAO_H/2<=b.climbTop+1){
       b.y=b.climbTop-BAO_H/2;
       b.x=b.climbExitX;
       b.climbTop=undefined;
       b.climbExitX=undefined;
       // Resume walking immediately once the climber clears the wall.
       b.x+=b.dir*31*step;
      }
      return;
     }
     if(wall&&b.skill==="climber"){
      const climbWall=g.terrain.find(t=>
       frontX>=t.x-4&&frontX<=t.x+t.w+4&&
       b.y+BAO_H/2>t.y&&b.y-BAO_H/2<t.y+t.h
      );
      if(!climbWall){
       b.dir=(-b.dir) as 1|-1;
       return;
      }
      b.climbTop=climbWall.y;
      b.climbExitX=b.dir===1
       ? climbWall.x+climbWall.w+BAO_W/2+2
       : climbWall.x-BAO_W/2-2;
      b.vy=0;
      b.fall=0;
      b.y-=118*step;
      if(b.y+BAO_H/2<=b.climbTop+1){
       b.y=b.climbTop-BAO_H/2;
       b.x=b.climbExitX;
       b.climbTop=undefined;
       b.climbExitX=undefined;
       // Don't leave the dumpling paused at the top of the wall.
       b.x+=b.dir*31*step;
      }
      return;
     }
     // Diggers stop when they break through the floor; they then fall normally.
     if(b.skill==="digger"){
      if(supported&&support&&!support.steel){
       b.action=4;
       carveTerrain(g.terrain,b.x-12,foot-2,24,30);
       b.y+=4;b.vy=0;b.fall=0;
       return;
      }
      if(supported&&support&&support.steel){b.skill=undefined;b.action=0}
      else if(b.action===4){b.skill=undefined;b.action=0}
     }
     if(b.skill==="basher"){
      // Keep the proven narrow vertical tunnel: widening this vertically can
      // cut into the floor and leave the worker with no proper footing.
      const probeX=b.x+b.dir*(BAO_W/2+30);
      const bashTop=b.y-BAO_H/2+5;
      const bashBottom=b.y+BAO_H/2-5;
      const overlapsBashHeight=(t:Terrain)=>bashBottom>t.y&&bashTop<t.y+t.h;
      const steelBlocked=g.terrain.some(t=>
       t.steel&&probeX>=t.x-2&&probeX<=t.x+t.w+2&&overlapsBashHeight(t)
      );
      if(steelBlocked){b.skill=undefined;b.action=0;b.dir=(-b.dir) as 1|-1;return}
      const materialAhead=g.terrain.some(t=>
       !t.steel&&probeX>=t.x-2&&probeX<=t.x+t.w+2&&overlapsBashHeight(t)
      );
      const bodyStillInWall=g.terrain.some(t=>
       !t.steel&&b.y+BAO_H/2-5>t.y&&b.y-BAO_H/2+5<t.y+t.h&&
       b.x+BAO_W/2>t.x&&b.x-BAO_W/2<t.x+t.w
      );
      if(b.action===2&&!materialAhead&&!bodyStillInWall){
       b.skill=undefined;
       b.action=0;
      }else if(materialAhead||(b.action!==2&&wall)){
       b.action=2;
       // A slightly wider horizontal cut removes the thin front lip that
       // could survive between consecutive bash frames, without cutting down.
       const carveX=b.dir===1?b.x+BAO_W/2-4:b.x-BAO_W/2-30;
       carveTerrain(g.terrain,carveX,b.y-BAO_H/2+3,34,BAO_H-6);
       b.x+=b.dir*2.8;
       return;
      }else if(b.action===2&&bodyStillInWall){
       b.x+=b.dir*2.8;
       return;
      }
      // If no wall is in front yet, retain the queued assignment.
     }
     if(b.skill==="miner"){
      const cutX=b.x+b.dir*13,cutY=foot+9;
      const steelBlocked=g.terrain.some(t=>t.steel&&cutX>=t.x&&cutX<=t.x+t.w&&cutY>=t.y&&cutY<=t.y+t.h);
      if(steelBlocked){b.skill=undefined;b.action=0}
      else if(solidAt(g.terrain,cutX,cutY)){
       b.action=3;
       carveTerrain(g.terrain,Math.min(cutX,cutX-b.dir*22),cutY-8,30,23);
       b.x+=b.dir*2.1;b.y+=2.1;b.vy=0;return;
      }else if(b.action===3){b.skill=undefined;b.action=0}
      else{b.skill=undefined}
     }
     if(b.skill==="builder"&&supported){
      if(wall){
       // A builder cannot lay steps into a solid wall; finish the order and turn.
       b.skill=undefined;
       b.build=0;
       b.dir=(-b.dir) as 1|-1;
       return;
      }
      if(b.build<12){
       const bx=b.x+b.dir*8,by=b.y+BAO_H/2-8;
       b.x+=b.dir*8;
       b.y-=8;
       b.build++;
       g.terrain.push({x:bx,y:by,w:19,h:9,bridge:true});
       return;
      }
      b.skill=undefined;
      b.build=0;
     }
     if(wall&&b.skill!=="basher"){
      b.dir=(b.dir*-1) as 1|-1
     }
     if(supported&&support){if(b.fall>112&&b.skill!=="floater"){b.dead=true;b.splat=1;g.dead++;return}b.y=support.y-BAO_H/2;b.vy=0;b.fall=0}
     else{
      if(b.skill==="floater"){
       // The umbrella actively limits descent speed, even if assigned mid-fall.
       b.vy=Math.min(b.vy+180*step,75);
      }else{
       b.vy+=620*step;
      }
      b.y+=b.vy*step
      b.fall+=b.vy*step
      if(b.y>H+20){b.dead=true;b.splat=1;g.dead++;return}
     }
     if(b.y>GROUND+60){b.dead=true;b.splat=1;g.dead++;return}
     // Walk horizontally while grounded or airborne. Stopping x movement
     // during a fall made every gap behave like an invisible safety net.
     if(!wall)b.x+=b.dir*31*step
     if(b.x>=l.exit-18&&b.x<=l.exit+45&&b.y>GROUND-80){b.saved=true;g.saved++}
     if(b.x<5){b.x=5;b.dir=1}
    })
    // Hazards and rescue percentage are evaluated after movement.
    // Keep the parade running after the rescue quota is met. Every released
    // dumpling must finish, and the hatch must be empty, before a stage ends.
    const paradeFinished=g.spawned>=l.total&&g.baos.length===l.total&&g.baos.every(b=>b.saved||b.dead)
    if(paradeFinished){g.running=false;g.complete=g.saved>=Math.ceil(l.total*l.rescue/100);g.failed=!g.complete}
    else if(g.clock<=0){g.running=false;g.complete=false;g.failed=true}
    const active=g.baos.filter(b=>!b.saved&&!b.dead).length
    if(g.complete){setBest(old=>{const next={...old,[l.id]:Math.max(old[l.id]||0,g.saved)};try{localStorage.setItem("sdlem-campaign-best",JSON.stringify(next))}catch{};return next})}
    // Always publish the terminal state immediately. If a level ends between HUD ticks,
   // the animation loop must not leave the React UI showing a frozen in-progress game.
   if(now-hudTick>120||g.complete||g.failed){hudTick=now;setCamera(g.camera);setHud({spawned:g.spawned,saved:g.saved,dead:g.dead,time:g.clock,rate:g.rate,active,percent:Math.floor(g.saved/l.total*100),paused:g.paused,running:g.running,complete:g.complete,failed:g.failed})}
   }
   // Optional camera follow. Classic mode leaves camera movement in the player's hands.
   const target=g.baos.find(b=>!b.saved&&!b.dead)
   if(g.cameraFollow&&target&&g.running&&!g.paused){const desired=clamp(target.x-W*.38,0,l.width-W);g.camera+=(desired-g.camera)*.12}
   ctx.clearRect(0,0,W,H)
   const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#dff4ff");sky.addColorStop(1,"#fff1f6");ctx.fillStyle=sky;ctx.fillRect(0,0,W,H)
   ctx.save();ctx.translate(-g.camera,0)
   // Soft layered hills, floating clouds and distant bamboo silhouettes.
   ctx.fillStyle="#c5e8d0";for(let i=0;i<l.width/260+2;i++){ctx.beginPath();ctx.arc(i*260+100,GROUND+20,105,Math.PI,Math.PI*2);ctx.fill()}
   for(let i=0;i<l.width/430+2;i++){
    const cx=i*430+155,cy=72+(i%3)*25;
    ctx.fillStyle="#ffffffb8";ctx.beginPath();ctx.arc(cx,cy,22,0,Math.PI*2);ctx.arc(cx+22,cy-8,28,0,Math.PI*2);ctx.arc(cx+50,cy,20,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#a6d7b4";ctx.fillRect(i*430+300,GROUND-128,7,110);ctx.fillRect(i*430+316,GROUND-145,6,127);
    for(let leaf=0;leaf<5;leaf++){ctx.beginPath();ctx.ellipse(i*430+294+(leaf%2)*25,GROUND-116-leaf*19,13,4,-.55,0,Math.PI*2);ctx.fill()}
   }
   // Hazard drawing is layered over the terrain below.
   // terrain: individual rounded grass/stone ledges
   g.terrain.forEach(t=>{
    const grad=ctx.createLinearGradient(0,t.y,0,t.y+t.h);
    if(t.steel){grad.addColorStop(0,"#c8d5df");grad.addColorStop(.22,"#8398aa");grad.addColorStop(1,"#586a7b")}
    else if(t.bridge){grad.addColorStop(0,"#e9c59c");grad.addColorStop(1,"#a87553")}
    else{grad.addColorStop(0,"#9cdb9c");grad.addColorStop(.13,"#69b982");grad.addColorStop(.14,"#c99c79");grad.addColorStop(1,"#936b61")}
    ctx.fillStyle=grad;ctx.strokeStyle=t.steel?"#526577":t.bridge?"#936749":"#628e66";ctx.lineWidth=2;
    ctx.fillRect(t.x,t.y,t.w,t.h);ctx.strokeRect(t.x,t.y,t.w,t.h);
    if(t.steel){ctx.fillStyle="#e8f0f5";ctx.fillRect(t.x+3,t.y+3,Math.max(0,t.w-6),2);ctx.fillStyle="#536778";for(let px=t.x+7;px<t.x+t.w-4;px+=18){ctx.beginPath();ctx.arc(px,t.y+t.h/2,2,0,Math.PI*2);ctx.fill()}}
    else if(t.bridge){ctx.strokeStyle="#966747";ctx.lineWidth=1;for(let px=t.x+8;px<t.x+t.w;px+=12){ctx.beginPath();ctx.moveTo(px,t.y+1);ctx.lineTo(px,t.y+t.h-1);ctx.stroke()}}
    else{ctx.fillStyle="#d5f3bb";ctx.fillRect(t.x,t.y,t.w,3);ctx.fillStyle="#5c9e70";for(let px=t.x+7;px<t.x+t.w-3;px+=21){ctx.beginPath();ctx.ellipse(px,t.y+8,3,1.5,-.35,0,Math.PI*2);ctx.fill()}}
   })
   l.hazards.forEach(h=>{ctx.fillStyle=h.kind==="water"?"#55b9df":h.kind==="fire"?"#f49b64":"#e68b8b";ctx.fillRect(h.x,h.y,h.w,h.h);ctx.fillStyle="#fff9";ctx.fillRect(h.x,h.y,h.w,4);if(h.kind==="fire"){ctx.font="20px sans-serif";ctx.fillText("♨",h.x+8,h.y+25)}if(h.kind==="trap"){ctx.fillStyle="#773f54";ctx.fillRect(h.x+8,h.y+12,h.w-16,8)}})
   // hatch and exit
   // Decorative bamboo-steamer hatch with a raised lid and warm glow.
   ctx.fillStyle="#9a6b78";ctx.fillRect(l.hatch-36,GROUND-48,72,24);ctx.fillStyle="#d89baf";ctx.fillRect(l.hatch-34,GROUND-52,68,7);ctx.fillStyle="#f6d6e3";ctx.fillRect(l.hatch-27,GROUND-67,54,17);ctx.strokeStyle="#a86d8b";ctx.lineWidth=3;ctx.strokeRect(l.hatch-27,GROUND-67,54,17);ctx.fillStyle="#fff";ctx.fillRect(l.hatch-20,GROUND-63,40,5);ctx.fillStyle="#8b6389";ctx.font="bold 10px sans-serif";ctx.fillText("BAO IN",l.hatch-18,GROUND-73);ctx.beginPath();ctx.ellipse(l.hatch,GROUND-70,30,8,0,Math.PI,Math.PI*2);ctx.fillStyle="#e9b5c9";ctx.fill();ctx.strokeStyle="#a86d8b";ctx.stroke();
   // A proper little pagoda-style rescue pavilion.
   ctx.fillStyle="#a66e91";ctx.fillRect(l.exit-12,GROUND-88,66,88);ctx.fillStyle="#fff1f8";ctx.fillRect(l.exit-5,GROUND-78,52,78);ctx.fillStyle="#d98eb5";ctx.beginPath();ctx.moveTo(l.exit-23,GROUND-86);ctx.lineTo(l.exit+21,GROUND-119);ctx.lineTo(l.exit+66,GROUND-86);ctx.closePath();ctx.fill();ctx.strokeStyle="#a66e91";ctx.lineWidth=4;ctx.stroke();ctx.fillStyle="#f6d5e5";ctx.fillRect(l.exit+10,GROUND-51,22,51);ctx.beginPath();ctx.arc(l.exit+21,GROUND-51,11,Math.PI,0);ctx.fill();ctx.fillStyle="#9c6488";ctx.font="bold 10px sans-serif";ctx.fillText("HOME",l.exit+7,GROUND-94);ctx.fillStyle="#fff";ctx.font="18px sans-serif";ctx.fillText("♡",l.exit+13,GROUND-19)
   g.baos.forEach(b=>{
    if(b.saved||b.x<g.camera-40||b.x>g.camera+W+40)return
    if(b.dead){
     const age=Math.min(1,b.frame/0.45), gooX=b.x, gooY=Math.min(H-9,b.y+BAO_H/2);
     ctx.save();ctx.translate(gooX,gooY);ctx.globalAlpha=1-age*.35;
     ctx.fillStyle="#f28eae";ctx.beginPath();ctx.ellipse(0,0,17+age*5,5+age*2,0,0,Math.PI*2);ctx.fill();
     ctx.fillStyle="#ffd5e2";ctx.beginPath();ctx.ellipse(-5,-2,5,2,0,0,Math.PI*2);ctx.ellipse(7,1,3,1.5,0,0,Math.PI*2);ctx.fill();
     ctx.fillStyle="#fff";ctx.font="bold 12px sans-serif";ctx.fillText("✦",12,-8);ctx.restore();return;
    }
    const bob=Math.sin(b.frame*8)*1.2
    ctx.save();ctx.translate(b.x,b.y+bob);ctx.scale(b.dir*1.2,1.12)
    ctx.fillStyle="#72555b30";ctx.beginPath();ctx.ellipse(0,BAO_H/2+2,16,4,0,0,Math.PI*2);ctx.fill()
    if(baoSprites[b.variant])ctx.drawImage(baoSprites[b.variant],-24,-24,48,48);
    else {ctx.fillStyle="#fff0d8";ctx.beginPath();ctx.ellipse(0,0,19,17,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#493640";ctx.beginPath();ctx.arc(-5,-2,2,0,Math.PI*2);ctx.arc(5,-2,2,0,Math.PI*2);ctx.fill()}
    // Every assigned skill gets a persistent, readable badge so queued
    // orders are visible before their trigger condition is reached.
    if(b.skill){
     const skillIcons:Record<Skill,string>={climber:"↟",floater:"☂",bomber:"✹",blocker:"Ⅱ",builder:"▰",basher:"✊",miner:"⚒",digger:"↓"};
     const badgeText=skillIcons[b.skill];
     ctx.save();ctx.scale(b.dir,1);
     ctx.fillStyle="#fff";ctx.strokeStyle="#9b6a91";ctx.lineWidth=1.5;
     ctx.beginPath();ctx.roundRect(-12,-38,24,17,7);ctx.fill();ctx.stroke();
     ctx.fillStyle="#704b72";ctx.font="bold 13px sans-serif";ctx.textAlign="center";ctx.fillText(badgeText,0,-26);
     ctx.restore();
    }
    if(b.skill==="climber"||b.skill==="builder"){ctx.fillStyle=b.skill==="builder"?"#f4bd42":"#e96b67";ctx.beginPath();ctx.arc(0,-15,10,Math.PI,0);ctx.lineTo(10,-12);ctx.lineTo(-10,-12);ctx.fill();ctx.fillStyle="#fff8";ctx.fillRect(-5,-17,5,2);ctx.fillStyle="#fff";ctx.font="bold 8px sans-serif";ctx.fillText(b.skill==="builder"?"BUILD":"UP",-9,-27)}
    if(b.skill==="floater"){ctx.fillStyle="#ef8eb7";ctx.strokeStyle="#865b91";ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-13,-25);ctx.quadraticCurveTo(0,-43,13,-25);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(0,-25);ctx.lineTo(0,-15);ctx.moveTo(-11,-25);ctx.lineTo(0,-15);ctx.lineTo(11,-25);ctx.stroke()}
    if(b.skill==="bomber"){ctx.fillStyle="#333";ctx.beginPath();ctx.arc(0,-22,4,0,Math.PI*2);ctx.fill();ctx.fillStyle="#f4c84b";ctx.fillRect(2,-28,4,3);ctx.fillStyle="#e85b68";ctx.font="bold 10px sans-serif";ctx.fillText(Math.ceil(b.bomber||0).toString(),-3,-30)}
    if(b.skill==="blocker"){ctx.fillStyle="#df5965";ctx.strokeStyle="#8e3547";ctx.lineWidth=1.5;ctx.fillRect(-13,-8,26,7);ctx.strokeRect(-13,-8,26,7);ctx.fillStyle="#fff";ctx.font="bold 8px sans-serif";ctx.fillText("STOP",-10,-2);ctx.fillStyle="#fff";ctx.font="bold 8px sans-serif";ctx.fillText("BLOCK",-13,-20)}
    if(b.skill==="basher"){ctx.fillStyle="#e7a34c";ctx.fillRect(-10,-19,20,5);ctx.strokeStyle="#80535c";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(8,-3);ctx.lineTo(17,3);ctx.stroke()}
    if(b.skill==="miner"){ctx.strokeStyle="#6f7181";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(8,-22);ctx.lineTo(15,-30);ctx.stroke();ctx.beginPath();ctx.moveTo(10,-30);ctx.lineTo(19,-30);ctx.stroke()}
    if(b.skill==="digger"){ctx.fillStyle="#8a694e";ctx.fillRect(9,-20,3,18);ctx.fillStyle="#aeb8c3";ctx.beginPath();ctx.moveTo(7,-3);ctx.lineTo(15,-3);ctx.lineTo(11,3);ctx.closePath();ctx.fill()}
    if(b.bomber>0&&b.skill!=="bomber"){ctx.fillStyle="#e85b68";ctx.font="bold 10px sans-serif";ctx.fillText(Math.ceil(b.bomber).toString(),-3,-25)}
    ctx.restore()
   })
   ctx.restore()
   // Full-level minimap with terrain, hazards, workers and the current viewport.
   const miniY=H-36,miniW=260,miniX=W-miniW-12,miniH=25,scale=miniW/l.width
   ctx.fillStyle="#fffE";ctx.fillRect(miniX,miniY,miniW,miniH);ctx.fillStyle="#d6ebdc";ctx.fillRect(miniX,miniY+miniH-5,miniW,5)
   g.terrain.forEach(t=>{ctx.fillStyle=t.steel?"#647889":t.bridge?"#a87553":"#6eae7c";ctx.fillRect(miniX+t.x*scale,miniY+Math.max(2,Math.min(miniH-7,(t.y/H)*miniH)),Math.max(1,t.w*scale),Math.max(1,t.h/H*miniH))})
   l.hazards.forEach(h=>{ctx.fillStyle=h.kind==="water"?"#45b6df":h.kind==="fire"?"#ef8955":"#d66f86";ctx.fillRect(miniX+h.x*scale,miniY+miniH-7,Math.max(2,h.w*scale),4)})
   g.baos.forEach(b=>{if(!b.saved&&!b.dead){ctx.fillStyle="#d94d92";ctx.fillRect(miniX+b.x*scale,miniY+miniH-10,2,3)}})
   ctx.strokeStyle="#674a70";ctx.lineWidth=2;ctx.strokeRect(miniX+g.camera*scale,miniY,Math.max(3,W*scale),miniH)
   ctx.fillStyle="#775e7a";ctx.font="10px sans-serif";ctx.fillText("LEVEL MAP · CLICK OR DRAG",miniX,miniY-4)
   rafRef.current=requestAnimationFrame(draw)
  }
  const bomberSkillHazard=(b:Bao,hazards:Hazard[])=>hazards.some(h=>b.x>h.x&&b.x<h.x+h.w&&b.y+BAO_H/2>h.y-8&&b.y-BAO_H/2<h.y+h.h)
  rafRef.current=requestAnimationFrame(draw)
  return()=>{alive=false;cancelAnimationFrame(rafRef.current)}
 },[])

 const scroll=(value:number)=>moveCamera(value)
 useEffect(()=>{const onKey=(event:KeyboardEvent)=>{if(event.key==="ArrowLeft"||event.key.toLowerCase()==="a"){event.preventDefault();moveCamera((gameRef.current?.camera||0)-90)}else if(event.key==="ArrowRight"||event.key.toLowerCase()==="d"){event.preventDefault();moveCamera((gameRef.current?.camera||0)+90)}};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey)},[])
 const maxCamera=Math.max(0,level.width-W)
 return <section className="sdlem-page"><div className="sdlem-shell">
  <div className="sdlem-eyebrow">✦ THE GOO GANG PRESENTS ✦</div>
  <div className="sdlem-heading-row"><div><h1>Squishy Dumpling <span>Lemmings</span></h1><p className="sdlem-intro">A proper little puzzle campaign. One tiny job at a time.</p></div><div className="sdlem-sticker">૮ ˶ᵔ ᵕ ᵔ˶ ა<br/><b>BAO!</b></div></div>
  <div className="sdlem-stats"><div><span>OUT</span><strong>{hud.spawned}<small> / {level.total}</small></strong></div><div><span>RESCUED</span><strong>{hud.saved}<small> / {Math.ceil(level.total*level.rescue/100)}</small></strong></div><div><span>ON SCREEN</span><strong>{hud.active}</strong></div><div><span>TIME LEFT</span><strong>{Math.floor(hud.time/60)}:{String(Math.floor(hud.time%60)).padStart(2,"0")}</strong></div></div>
  <div className="sdlem-progress"><span style={{width:hud.percent+"%"}}/></div>
  <div className="sdlem-game-frame"><div className="sdlem-game-top"><div><span className="sdlem-level-pill">{level.group.toUpperCase()} · LEVEL {String(level.id+1).padStart(3,"0")}</span><h2>{level.name}</h2><p>Rescue {level.rescue}% · {level.total} dumplings · {Math.floor(level.seconds/60)} minutes</p><p className="sdlem-objective">✦ {level.objective}</p></div><div className="sdlem-top-actions"><button className="sdlem-small-btn" onClick={pause} disabled={!hud.running}>Ⅱ Pause</button><button className="sdlem-small-btn" onClick={()=>reset(levelId)}>↻ Restart</button></div></div>
   <div className="sdlem-canvas-wrap"><canvas ref={canvasRef} width={W} height={H} onPointerDown={clickWorld} onPointerMove={handleCanvasMove} onPointerUp={()=>{miniDragRef.current=false}} onPointerLeave={()=>{miniDragRef.current=false}} aria-label="Scrollable Squishy Dumpling Lemmings level"/></div>
   <div className="sdlem-scroll"><button onClick={()=>scroll((gameRef.current?.camera||0)-220)} aria-label="Scroll left">◀</button><input aria-label="Scroll level" type="range" min="0" max={maxCamera} value={Math.min(camera,maxCamera)} onChange={e=>scroll(Number(e.target.value))}/><button onClick={()=>scroll((gameRef.current?.camera||0)+220)} aria-label="Scroll right">▶</button><label className="sdlem-follow-toggle"><input type="checkbox" checked={cameraFollow} onChange={e=>setFollow(e.target.checked)}/> Follow action</label><span>{Math.round((camera/maxCamera||0)*100)}%</span></div>
   <div className="sdlem-message">{hud.complete?"🎉 Level complete!":hud.failed?"💗 Not quite — have another go.":hud.paused?"⏸ Parade paused.":hud.running?"Tap a dumpling once to assign the selected job permanently; it triggers when its conditions are met.":"Press release to start the parade. Select a skill first or during play."}</div>
   {(hud.complete||hud.failed)&&<div className="sdlem-result"><b>{hud.complete?"Beautifully done, Bao Boss!":"The parade has finished."}</b><span>{hud.saved} rescued out of {level.total}. {hud.complete?"The next stage is unlocked.":"Try changing the release rate or skill timing."}</span><button onClick={()=>hud.complete&&levelId<119?reset(levelId+1):reset(levelId)}>{hud.complete&&levelId<119?"Next level →":"Try again"}</button></div>}
  </div>
  <div className="sdlem-controls"><div className="sdlem-section-heading"><div><span className="sdlem-kicker">SKILL PANEL</span><h2>Choose a job</h2></div><span className="sdlem-tool-hint">1. Pick a job · 2. Tap any dumpling · 3. It triggers automatically</span></div>
   <div className="sdlem-skills">{SKILLS.map(s=><button key={s.id} disabled={(gameRef.current?.skills[s.id]??level.skills[s.id])===0||hud.complete||hud.failed} className={"sdlem-skill"+(selected===s.id?" is-selected":"")} onClick={()=>assign(s.id)}><span className="sdlem-skill-icon">{s.icon}</span><span className="sdlem-skill-copy"><b>{s.label}</b><small>{s.tip}</small></span><span className="sdlem-skill-count">{gameRef.current?.skills[s.id]??level.skills[s.id]}</span></button>)}</div>
   <div className="sdlem-bottom-row"><div className="sdlem-selected-hint"><b>Active tool: {SKILLS.find(s=>s.id===selected)?.icon} {SKILLS.find(s=>s.id===selected)?.label}</b><small>Click a worker once to assign the job permanently; it triggers when its conditions are met.</small></div><div className="sdlem-play-actions"><button className="sdlem-small-btn" onClick={()=>setRate(-5)} disabled={!hud.running}>− Release</button><b className="sdlem-rate">{gameRef.current?.rate??level.rate}</b><button className="sdlem-small-btn" onClick={()=>setRate(5)} disabled={!hud.running}>+ Release</button><button className="sdlem-small-btn" onClick={nuke} disabled={!hud.running}>☠ Nuke</button><label className="sdlem-speed">Speed <select value={speed} onChange={e=>changeSpeed(Number(e.target.value))}><option value={1}>1×</option><option value={2}>2×</option><option value={4}>4×</option></select></label><button className="sdlem-release" onClick={start}>{hud.running?"▶ Continue":"▶ Release Bao Parade"}</button></div></div>
  </div>
  <div className="sdlem-level-select"><div><span className="sdlem-kicker">120 PUZZLE STAGES</span><h2>Choose your world</h2><p>Four difficulty groups, 30 levels each. Complete a level to unlock the next.</p></div><div className="sdlem-level-picker"><label>Difficulty <select value={Math.floor(levelId/30)} onChange={e=>selectLevel(Number(e.target.value)*30)}>{GROUPS.map((g,i)=><option key={g} value={i} disabled={i*30>unlockedThrough}>{g}</option>)}</select></label><label>Level <select value={levelId%30} onChange={e=>selectLevel(Math.floor(levelId/30)*30+Number(e.target.value))}>{Array.from({length:30},(_,i)=><option key={i} value={i} disabled={Math.floor(levelId/30)*30+i>unlockedThrough}>{String(i+1).padStart(2,"0")} · {LEVELS[Math.floor(levelId/30)*30+i].name}</option>)}</select></label><span className="sdlem-campaign-count">{Object.keys(best).length} / 120 cleared</span></div></div>
  <div className="sdlem-howto"><span className="sdlem-howto-icon">💡</span><div><b>Classic Lemmings rules</b><p>Dumplings walk on their own, turn at walls and fall if you leave a gap. Assign skills to change the landscape or their behaviour. Blockers stop the parade and turn other walkers back; builders lay 12 steps; bashers tunnel sideways; miners cut diagonally; diggers tunnel down; climbers scale walls; floaters survive long falls; bombers clear a small crater. Pause to plan, adjust the release rate and use the mini-map/scrollbar to explore the whole level.</p></div></div>
 </div></section>
}
