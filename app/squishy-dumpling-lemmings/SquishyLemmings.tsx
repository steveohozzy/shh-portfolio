"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { PointerEvent as ReactPointerEvent } from "react"

type Skill = "climber" | "floater" | "bomber" | "blocker" | "builder" | "basher" | "miner" | "digger"
type Terrain = { x:number; y:number; w:number; h:number; steel?:boolean; bridge?:boolean }
type Hazard = { x:number; y:number; w:number; h:number; kind:"water"|"fire"|"trap" }
type Level = { id:number; name:string; group:string; width:number; total:number; rescue:number; seconds:number; rate:number; hatch:number; exit:number; terrain:Terrain[]; hazards:Hazard[]; skills:Record<Skill,number> }
type Bao = { id:number; x:number; y:number; dir:1|-1; vy:number; fall:number; skill?:Skill; action:number; saved:boolean; dead:boolean; bomber:number; build:number; frame:number; splat?:number }
type Game = { baos:Bao[]; terrain:Terrain[]; spawned:number; saved:number; dead:number; clock:number; spawnClock:number; camera:number; running:boolean; paused:boolean; complete:boolean; failed:boolean; rate:number; speed:number; selected:Skill; skills:Record<Skill,number>; nextId:number }

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
 const group=Math.floor(id/30), n=id%30, width=2400+(n%4)*180+group*120;
 const terrain:Terrain[]=[{x:0,y:GROUND-26,w:width,h:140},{x:0,y:GROUND-26,w:150,h:26},{x:width-260,y:GROUND-26,w:260,h:26}];
 const hazards:Hazard[]=[];
 const wall=(x:number,top=205,w=34)=>terrain.push({x,y:top,w,h:GROUND-26-top});
 const shelf=(x:number,y:number,w:number)=>terrain.push({x,y,w,h:15});
 const gap=(x:number,w:number)=>{
  const base=terrain.find(t=>t.x===0&&t.w===width&&t.y===GROUND-26&&t.h===140);
  if(base){
   terrain.splice(terrain.indexOf(base),1);
   terrain.push({x:0,y:GROUND-26,w,h:140},{x:x+w,y:GROUND-26,w:width-x-w,h:140});
   return;
  }
  const segment=terrain.find(t=>t.y===GROUND-26&&t.h===140&&x>=t.x&&x+w<=t.x+t.w);
  if(segment){
   terrain.splice(terrain.indexOf(segment),1);
   if(x>segment.x)terrain.push({x:segment.x,y:GROUND-26,w:x-segment.x,h:140});
   if(x+w<segment.x+segment.w)terrain.push({x:x+w,y:GROUND-26,w:segment.x+segment.w-x-w,h:140});
  }
 };
 if(n===0){wall(510,205,38);shelf(850,300,150)}
 else if(n===1){wall(620,155,42);shelf(1120,280,190)}
 else if(n===2){gap(720,130);shelf(980,285,190);wall(1460,220,34)}
 else if(n===3){wall(540,195,34);gap(1050,150);wall(1510,175,36)}
 else if(n===4){shelf(440,270,250);wall(820,160,38);shelf(1190,245,210);wall(1660,190,36)}
 else if(n===5){gap(600,170);gap(1280,190);shelf(850,270,170);shelf(1540,250,190)}
 else if(n===6){wall(480,125,38);wall(900,125,38);wall(1320,125,38);shelf(1650,280,220)}
 else if(n===7){shelf(420,285,220);shelf(790,235,220);shelf(1160,185,220);wall(1570,155,36)}
 else {for(let i=0;i<3+group;i++){const x=400+i*390+(n%3)*35;if((i+n)%2===0)wall(x,185-((i+n)%3)*25,32);else shelf(x,260-((i+n)%3)*28,150)}if(n%4===2)gap(1050+(n%3)*100,110+(n%2)*45)}
 if(group>=1&&n%3===0)hazards.push({x:width*.52,y:GROUND-4,w:105,h:55,kind:"water"});
 if(group>=2&&n%4===1)hazards.push({x:width*.7,y:GROUND-4,w:58,h:36,kind:"trap"});
 if(group===3&&n%5===0)hazards.push({x:width*.42,y:GROUND-4,w:95,h:52,kind:"fire"});
 const skills:Record<Skill,number>={climber:3,floater:3,bomber:2,blocker:2,builder:8,basher:5,miner:4,digger:3};
 if(n===0){skills.basher=12;skills.builder=0;skills.miner=0;skills.digger=0;skills.climber=0;skills.floater=0;skills.bomber=0;skills.blocker=0}
 if(n===1){skills.basher=0;skills.climber=18;skills.floater=3;skills.builder=0;skills.miner=0;skills.digger=0;skills.blocker=0;skills.bomber=0}
 if(n===2){skills.builder=5;skills.floater=4;skills.basher=0;skills.miner=0;skills.digger=0;skills.climber=0}
 if(n===3){skills.basher=3;skills.builder=5;skills.miner=3;skills.digger=0}
 if(group>=2){skills.builder=Math.max(2,skills.builder-2);skills.basher=Math.max(1,skills.basher-1)}
 if(group===3){skills.digger=Math.max(1,skills.digger-1);skills.blocker=Math.max(1,skills.blocker-1)}
 const names=["Bao Boulevard","The Wobble Wall","Pudding Gap","The Sticky Passage","Cloud Kitchen","Jellybean Crossing","The Noodle Maze","Mooncake Mountain","Steamed-Up Summit","The Great Bao Escape"];
 return {id,name:names[n%names.length],group:GROUPS[group],width,total:group===0?12:group===1?18:group===2?24:30,rescue:group===0?65:group===1?72:group===2?78:84,seconds:300-group*25,rate:24+group*5,hatch:75,exit:width-115,terrain,hazards,skills}
}
const LEVELS=Array.from({length:120},(_,i)=>makeLevel(i))
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
 const [speed,setSpeed]=useState(1)
 const [best,setBest]=useState<Record<number,number>>({})
 const level=LEVELS[levelId]
 levelRef.current=level
 if(!gameRef.current){gameRef.current={baos:[],terrain:level.terrain.map(t=>({...t})),spawned:0,saved:0,dead:0,clock:level.seconds,spawnClock:0,camera:0,running:false,paused:false,complete:false,failed:false,rate:level.rate,speed:1,selected:"floater",skills:cloneSkills(level.skills),nextId:0}}

 const reset=useCallback((id=levelId)=>{
  const l=LEVELS[id]
  gameRef.current={baos:[],terrain:l.terrain.map(t=>({...t})),spawned:0,saved:0,dead:0,clock:l.seconds,spawnClock:0,camera:0,running:false,paused:false,complete:false,failed:false,rate:l.rate,speed:1,selected:"floater",skills:cloneSkills(l.skills),nextId:0}
  setLevelId(id);setSelected("floater");setCamera(0);setSpeed(1)
  setHud({spawned:0,saved:0,dead:0,time:l.seconds,rate:l.rate,active:0,percent:0,paused:false,running:false,complete:false,failed:false})
 },[levelId])

 useEffect(()=>{try{const v=localStorage.getItem("sdlem-campaign-best");if(v)setBest(JSON.parse(v))}catch{}},[])

 const start=()=>{const g=gameRef.current;if(!g)return;if(g.complete||g.failed)reset(levelId);const next=gameRef.current;if(next){next.running=true;next.paused=false}}
 const pause=()=>{const g=gameRef.current;if(g){g.paused=!g.paused;setHud(h=>({...h,paused:g.paused}))}}
 const assign=(skill:Skill)=>{const g=gameRef.current;if(!g)return;g.selected=skill;setSelected(skill)}
 const setRate=(delta:number)=>{const g=gameRef.current;if(g)g.rate=clamp(g.rate+delta,level.rate,99)}
 const changeSpeed=(v:number)=>{setSpeed(v);const g=gameRef.current;if(g)g.speed=v}
 const nuke=()=>{const g=gameRef.current;if(!g||!g.running)return;g.baos.forEach(b=>{if(!b.saved&&!b.dead&&b.skill!=="blocker"){b.skill="bomber";b.bomber=5}})}
 const selectLevel=(id:number)=>reset(id)

 const clickWorld=(event:ReactPointerEvent<HTMLCanvasElement>)=>{
  const g=gameRef.current;if(!g||!g.running||g.paused)return
  const rect=event.currentTarget.getBoundingClientRect()
  const screenX=(event.clientX-rect.left)/rect.width*W
  const px=screenX+g.camera
  const py=(event.clientY-rect.top)/rect.height*H
  if(py>H-30&&screenX>W-285){g.camera=clamp(((screenX-(W-272))/260)*levelRef.current.width,0,levelRef.current.width-W);setCamera(g.camera);return}
  const bao=g.baos.filter(b=>!b.saved&&!b.dead).sort((a,b)=>Math.abs(a.x-px)+Math.abs(a.y-py)-Math.abs(b.x-px)-Math.abs(b.y-py))[0]
  // Wider hit area makes tapping individual workers easier on phones.
  if(!bao||Math.abs(bao.x-px)>48||Math.abs(bao.y-py)>52)return
  // A second click toggles the worker's current job off and restores its skill token.
  if(bao.skill){
   const oldSkill=bao.skill
   bao.skill=undefined
   if(oldSkill!=="bomber"||bao.bomber<=0)g.skills[oldSkill]=Math.min(levelRef.current.skills[oldSkill],g.skills[oldSkill]+1)
   bao.bomber=0
   bao.action=0
   bao.build=0
   return
  }
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
  const draw=()=>{
   if(!alive)return
   const g=gameRef.current,l=levelRef.current
   if(!g){rafRef.current=requestAnimationFrame(draw);return}
   const now=performance.now(),dt=Math.min(.05,(now-(lastRef.current||now))/1000);lastRef.current=now
   if(g.running&&!g.paused&&!g.complete&&!g.failed){
    const step=dt*g.speed
    g.clock=Math.max(0,g.clock-step)
    g.spawnClock+=step*(g.rate/100)
    if(g.spawned<l.total&&g.spawnClock>=.11){
     g.spawnClock=0
     g.baos.push({id:g.nextId++,x:l.hatch,y:GROUND-52,dir:1,vy:0,fall:0,action:0,saved:false,dead:false,bomber:0,build:0,frame:0})
     g.spawned++
    }
    g.baos.forEach(b=>{
     if(b.saved)return
     if(b.dead){b.frame+=step;return}
     b.frame+=step
     if(b.bomber>0){b.bomber-=step;if(b.bomber<=0){g.terrain=g.terrain.filter(t=>!(b.x>t.x-28&&b.x<t.x+t.w+28&&b.y>t.y-28&&b.y<t.y+t.h+28));b.dead=true;b.splat=1;g.dead++;return}}
     if(bomberSkillHazard(b,l.hazards)){b.dead=true;b.splat=1;g.dead++;return}
     const foot=b.y+BAO_H/2
     const support=floorAt(g.terrain,b.x+b.dir*3,foot)
     const supported=!!support
     const frontX=b.x+b.dir*(BAO_W/2+2)
     const wall=solidAt(g.terrain,frontX,b.y-4)||solidAt(g.terrain,frontX,b.y+4)
     const blocker=g.baos.find(o=>o!==b&&!o.dead&&!o.saved&&o.skill==="blocker"&&o.action===1&&Math.abs(o.x-b.x)<18&&Math.abs(o.y-b.y)<24)
     if(b.skill==="blocker"&&supported){b.y=support!.y-BAO_H/2;b.vy=0;b.fall=0;b.action=1;return}
     if(blocker){b.dir=(b.x<blocker.x?-1:1);b.x+=b.dir*1.2;return}
     if(b.skill==="digger"&&supported&&support){
      if(!support.steel){carveTerrain(g.terrain,b.x-12,foot-2,24,30);b.y+=4;b.vy=0;return}
      b.skill=undefined;
     }
     if(b.skill==="basher"){
      const cutX=b.x+b.dir*(BAO_W/2+8), cutY=b.y-5;
      if(solidAt(g.terrain,cutX,cutY)||solidAt(g.terrain,cutX,cutY+14)){
       carveTerrain(g.terrain,Math.min(cutX,cutX- b.dir*24),cutY-7,30,27);
       b.x+=b.dir*2.8;
       return;
      }
      b.skill=undefined;
     }
     if(b.skill==="miner"){
      const cutX=b.x+b.dir*13, cutY=foot+9;
      if(solidAt(g.terrain,cutX,cutY)){
       carveTerrain(g.terrain,Math.min(cutX,cutX- b.dir*22),cutY-8,30,23);
       b.x+=b.dir*2.1;b.y+=2.1;b.vy=0;return;
      }
      b.skill=undefined;
     }
     if(b.skill==="builder"&&supported){
      if(b.build<12){const bx=b.x+b.dir*7,by=b.y+BAO_H/2-3;b.x+=b.dir*7;b.y-=1.5;b.build++;g.terrain.push({x:bx,y:by,w:9,h:5,bridge:true});return}
      b.skill=undefined;b.build=0
     }
     if(wall){
      if(b.skill==="climber"){b.y-=2;b.x+=b.dir*.5;if(!solidAt(g.terrain,b.x+b.dir*7,b.y-BAO_H/2)){b.y-=5;b.skill=undefined}return}
      b.dir=(b.dir*-1) as 1|-1
     }
     if(supported&&support){if(b.fall>112&&b.skill!=="floater"){b.dead=true;b.splat=1;g.dead++;return}b.y=support.y-BAO_H/2;b.vy=0;b.fall=0}
     else{
      b.vy+=b.skill==="floater"?180:620
      b.y+=b.vy*step
      b.fall+=b.vy*step
      if(b.y>H+20){b.dead=true;g.dead++;return}
     }
     if(b.y>GROUND+60){b.dead=true;g.dead++;return}
     if(!wall&&supported)b.x+=b.dir*(b.skill==="builder"?1.4:31)*step
     if(b.x>=l.exit-18&&b.x<=l.exit+45&&b.y>GROUND-80){b.saved=true;g.saved++}
     if(b.x<5){b.x=5;b.dir=1}
    })
    // Hazards and rescue percentage are evaluated after movement.
    if(g.clock<=0||(g.spawned>=l.total&&g.baos.every(b=>b.saved||b.dead))){g.running=false;g.complete=g.saved>=Math.ceil(l.total*l.rescue/100);g.failed=!g.complete}
    if(g.saved>=Math.ceil(l.total*l.rescue/100)){g.running=false;g.complete=true;g.failed=false}
    const active=g.baos.filter(b=>!b.saved&&!b.dead).length
    if(g.complete){setBest(old=>{const next={...old,[l.id]:Math.max(old[l.id]||0,g.saved)};try{localStorage.setItem("sdlem-campaign-best",JSON.stringify(next))}catch{};return next})}
    if(now-hudTick>120){hudTick=now;setCamera(g.camera);setHud({spawned:g.spawned,saved:g.saved,dead:g.dead,time:g.clock,rate:g.rate,active,percent:Math.floor(g.saved/l.total*100),paused:g.paused,running:g.running,complete:g.complete,failed:g.failed})}
   }
   // Follow the parade, while allowing the user to move the camera with the scrollbar/minimap.
   const target=g.baos.find(b=>!b.saved&&!b.dead)
   if(target&&g.running&&!g.paused){if(target.x>g.camera+W-90)g.camera=clamp(g.camera+(target.x-(g.camera+W-90))*.12,0,l.width-W);else if(target.x<g.camera+70)g.camera=clamp(g.camera-(g.camera+70-target.x)*.12,0,l.width-W)}
   ctx.clearRect(0,0,W,H)
   const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#dff4ff");sky.addColorStop(1,"#fff1f6");ctx.fillStyle=sky;ctx.fillRect(0,0,W,H)
   ctx.save();ctx.translate(-g.camera,0)
   // distant hills
   ctx.fillStyle="#c5e8d0";for(let i=0;i<l.width/260+2;i++){ctx.beginPath();ctx.arc(i*260+100,GROUND+20,105,Math.PI,Math.PI*2);ctx.fill()}
   // hazard pools
   l.hazards.forEach(h=>{ctx.fillStyle=h.kind==="water"?"#74c9e7":h.kind==="fire"?"#f49b64":"#e68b8b";ctx.fillRect(h.x,h.y,h.w,h.h);ctx.fillStyle="#fff8";ctx.fillRect(h.x,h.y,h.w,4)})
   // terrain: individual rounded grass/stone ledges
   g.terrain.forEach(t=>{ctx.fillStyle=t.steel?"#8e9aa7":t.bridge?"#c99a70":"#82c994";ctx.strokeStyle=t.steel?"#566575":t.bridge?"#986e56":"#4f9e70";ctx.lineWidth=2;ctx.fillRect(t.x,t.y,t.w,t.h);ctx.strokeRect(t.x,t.y,t.w,t.h);ctx.fillStyle=t.steel?"#c4cbd1":t.bridge?"#e8c39a":"#c8f0c8";ctx.fillRect(t.x,t.y,t.w,4)})
   // hatch and exit
   ctx.fillStyle="#e69abc";ctx.fillRect(l.hatch-20,GROUND-66,40,18);ctx.fillStyle="#fff";ctx.fillRect(l.hatch-14,GROUND-62,28,8);ctx.fillStyle="#8b6389";ctx.font="bold 11px sans-serif";ctx.fillText("IN",l.hatch-7,GROUND-70)
   ctx.fillStyle="#fff4fa";ctx.fillRect(l.exit,GROUND-68,42,68);ctx.strokeStyle="#b97ca5";ctx.lineWidth=5;ctx.strokeRect(l.exit,GROUND-68,42,68);ctx.fillStyle="#e9a8cb";ctx.font="bold 12px sans-serif";ctx.fillText("HOME",l.exit+3,GROUND-77);ctx.font="20px sans-serif";ctx.fillText("♡",l.exit+11,GROUND-25)
   g.baos.forEach(b=>{
    if(b.saved||b.x<g.camera-40||b.x>g.camera+W+40)return
    if(b.dead){
     const age=Math.min(1,b.frame/0.45), gooX=b.x, gooY=Math.min(H-9,b.y+BAO_H/2);
     ctx.save();ctx.translate(gooX,gooY);ctx.globalAlpha=1-age*.35;
     ctx.fillStyle="#f28eae";ctx.beginPath();ctx.ellipse(0,0,17+age*5,5+age*2,0,0,Math.PI*2);ctx.fill();
     ctx.fillStyle="#ffd5e2";ctx.beginPath();ctx.ellipse(-5,-2,5,2,0,0,Math.PI*2);ctx.ellipse(7,1,3,1.5,0,0,Math.PI*2);ctx.fill();
     ctx.fillStyle="#fff";ctx.font="bold 12px sans-serif";ctx.fillText("✦",12,-8);ctx.restore();return;
    }
    const col=BAO_COLOURS[b.id%BAO_COLOURS.length], bob=Math.sin(b.frame*8)*1.2
    ctx.save();ctx.translate(b.x,b.y+bob);ctx.scale(b.dir*1.2,1.12)
    ctx.fillStyle="#72555b30";ctx.beginPath();ctx.ellipse(0,BAO_H/2+2,16,4,0,0,Math.PI*2);ctx.fill()
    ctx.fillStyle="#8c6670";ctx.beginPath();ctx.ellipse(-8,BAO_H/2-1,6,3,0,0,Math.PI*2);ctx.ellipse(8,BAO_H/2-1,6,3,0,0,Math.PI*2);ctx.fill()
    // Round, pleated steamed-bun silhouette with wide cheeks rather than an egg shape.
    const body=ctx.createRadialGradient(-7,-10,2,0,1,24);body.addColorStop(0,"#fffdf8");body.addColorStop(.25,col);body.addColorStop(.78,col);body.addColorStop(1,"#b889a0")
    ctx.fillStyle=body;ctx.strokeStyle="#986f7c";ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(-15,7);ctx.bezierCurveTo(-20,1,-18,-8,-12,-13);ctx.quadraticCurveTo(-7,-19,-2,-16);ctx.quadraticCurveTo(0,-22,2,-16);ctx.quadraticCurveTo(8,-19,13,-12);ctx.bezierCurveTo(19,-5,18,5,12,11);ctx.quadraticCurveTo(7,18,0,18);ctx.quadraticCurveTo(-10,18,-15,7);ctx.fill();ctx.stroke()
    ctx.strokeStyle="#fff9";ctx.lineWidth=1.8;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-11,-12);ctx.quadraticCurveTo(-7,-8,-5,-4);ctx.moveTo(-5,-16);ctx.quadraticCurveTo(-2,-10,0,-5);ctx.moveTo(0,-18);ctx.quadraticCurveTo(1,-10,2,-5);ctx.moveTo(6,-16);ctx.quadraticCurveTo(5,-9,5,-4);ctx.moveTo(11,-12);ctx.quadraticCurveTo(7,-8,5,-4);ctx.stroke()
    ctx.strokeStyle="#b889a0";ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-14,1);ctx.quadraticCurveTo(-12,8,-7,11);ctx.moveTo(14,1);ctx.quadraticCurveTo(12,8,7,11);ctx.stroke()
    ctx.fillStyle="#493640";ctx.beginPath();ctx.ellipse(-4.5,-2,1.9,2.6,0,0,Math.PI*2);ctx.ellipse(4.5,-2,1.9,2.6,0,0,Math.PI*2);ctx.fill()
    ctx.fillStyle="#f08fa9";ctx.beginPath();ctx.ellipse(-9,3,3.3,2.2,0,0,Math.PI*2);ctx.ellipse(9,3,3.3,2.2,0,0,Math.PI*2);ctx.fill()
    ctx.strokeStyle="#754e5b";ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(0,2,2.6,.15,Math.PI-.15);ctx.stroke()
    ctx.strokeStyle="#b889a0";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-12,5);ctx.lineTo(-16,9);ctx.moveTo(12,5);ctx.lineTo(16,9);ctx.stroke()
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
   // mini-map and viewport marker
   const miniY=H-19,miniW=260,miniX= W-miniW-12
   ctx.fillStyle="#fffD";ctx.fillRect(miniX,miniY,miniW,10);ctx.fillStyle="#83c995";ctx.fillRect(miniX,miniY,miniW*W/l.width,10);ctx.strokeStyle="#745c7a";ctx.strokeRect(miniX+(g.camera/l.width)*miniW,miniY,miniW*W/l.width,10)
   ctx.fillStyle="#775e7a";ctx.font="10px sans-serif";ctx.fillText("LEVEL MAP",miniX,miniY-4)
   rafRef.current=requestAnimationFrame(draw)
  }
  const bomberSkillHazard=(b:Bao,hazards:Hazard[])=>hazards.some(h=>b.x>h.x&&b.x<h.x+h.w&&b.y+BAO_H/2>h.y-8&&b.y-BAO_H/2<h.y+h.h)
  rafRef.current=requestAnimationFrame(draw)
  return()=>{alive=false;cancelAnimationFrame(rafRef.current)}
 },[])

 const scroll=(value:number)=>{const g=gameRef.current;if(!g)return;g.camera=value;setCamera(value)}
 const maxCamera=Math.max(0,level.width-W)
 return <section className="sdlem-page"><div className="sdlem-shell">
  <div className="sdlem-eyebrow">✦ THE GOO GANG PRESENTS ✦</div>
  <div className="sdlem-heading-row"><div><h1>Squishy Dumpling <span>Lemmings</span></h1><p className="sdlem-intro">A proper little puzzle campaign. One tiny job at a time.</p></div><div className="sdlem-sticker">૮ ˶ᵔ ᵕ ᵔ˶ ა<br/><b>BAO!</b></div></div>
  <div className="sdlem-stats"><div><span>OUT</span><strong>{hud.spawned}<small> / {level.total}</small></strong></div><div><span>RESCUED</span><strong>{hud.saved}<small> / {Math.ceil(level.total*level.rescue/100)}</small></strong></div><div><span>ON SCREEN</span><strong>{hud.active}</strong></div><div><span>TIME LEFT</span><strong>{Math.floor(hud.time/60)}:{String(Math.floor(hud.time%60)).padStart(2,"0")}</strong></div></div>
  <div className="sdlem-progress"><span style={{width:hud.percent+"%"}}/></div>
  <div className="sdlem-game-frame"><div className="sdlem-game-top"><div><span className="sdlem-level-pill">{level.group.toUpperCase()} · LEVEL {String(level.id+1).padStart(3,"0")}</span><h2>{level.name}</h2><p>Rescue {level.rescue}% · {level.total} dumplings · {Math.floor(level.seconds/60)} minutes</p></div><div className="sdlem-top-actions"><button className="sdlem-small-btn" onClick={pause} disabled={!hud.running}>Ⅱ Pause</button><button className="sdlem-small-btn" onClick={()=>reset(levelId)}>↻ Restart</button></div></div>
   <div className="sdlem-canvas-wrap"><canvas ref={canvasRef} width={W} height={H} onPointerDown={clickWorld} aria-label="Scrollable Squishy Dumpling Lemmings level"/></div>
   <div className="sdlem-scroll"><button onClick={()=>scroll(clamp((gameRef.current?.camera||0)-220,0,maxCamera))}>◀</button><input aria-label="Scroll level" type="range" min="0" max={maxCamera} value={Math.min(camera,maxCamera)} onChange={e=>scroll(Number(e.target.value))}/><button onClick={()=>scroll(clamp((gameRef.current?.camera||0)+220,0,maxCamera))}>▶</button><span>{Math.round((camera/maxCamera||0)*100)}%</span></div>
   <div className="sdlem-message">{hud.complete?"🎉 Level complete!":hud.failed?"💗 Not quite — have another go.":hud.paused?"⏸ Parade paused.":hud.running?"Tap a dumpling to assign the selected job; tap it again to remove the job.":"Press release to start the parade. Select a skill first or during play."}</div>
   {(hud.complete||hud.failed)&&<div className="sdlem-result"><b>{hud.complete?"Beautifully done, Bao Boss!":"The parade has finished."}</b><span>{hud.saved} rescued out of {level.total}. {hud.complete?"The next stage is unlocked.":"Try changing the release rate or skill timing."}</span><button onClick={()=>hud.complete&&levelId<119?reset(levelId+1):reset(levelId)}>{hud.complete&&levelId<119?"Next level →":"Try again"}</button></div>}
  </div>
  <div className="sdlem-controls"><div className="sdlem-section-heading"><div><span className="sdlem-kicker">SKILL PANEL</span><h2>Choose a job</h2></div><span className="sdlem-tool-hint">1. Pick a job · 2. Tap a dumpling · 3. Tap again to undo</span></div>
   <div className="sdlem-skills">{SKILLS.map(s=><button key={s.id} disabled={level.skills[s.id]===0||hud.complete||hud.failed} className={"sdlem-skill"+(selected===s.id?" is-selected":"")} onClick={()=>assign(s.id)}><span className="sdlem-skill-icon">{s.icon}</span><span className="sdlem-skill-copy"><b>{s.label}</b><small>{s.tip}</small></span><span className="sdlem-skill-count">{gameRef.current?.skills[s.id]??level.skills[s.id]}</span></button>)}</div>
   <div className="sdlem-bottom-row"><div className="sdlem-selected-hint"><b>Active tool: {SKILLS.find(s=>s.id===selected)?.icon} {SKILLS.find(s=>s.id===selected)?.label}</b><small>Click a worker to apply the selected job; click that worker again to remove the job.</small></div><div className="sdlem-play-actions"><button className="sdlem-small-btn" onClick={()=>setRate(-5)} disabled={!hud.running}>− Release</button><b className="sdlem-rate">{gameRef.current?.rate??level.rate}</b><button className="sdlem-small-btn" onClick={()=>setRate(5)} disabled={!hud.running}>+ Release</button><button className="sdlem-small-btn" onClick={nuke} disabled={!hud.running}>☠ Nuke</button><label className="sdlem-speed">Speed <select value={speed} onChange={e=>changeSpeed(Number(e.target.value))}><option value={1}>1×</option><option value={2}>2×</option><option value={4}>4×</option></select></label><button className="sdlem-release" onClick={start}>{hud.running?"▶ Continue":"▶ Release Bao Parade"}</button></div></div>
  </div>
  <div className="sdlem-level-select"><div><span className="sdlem-kicker">120 ORIGINAL STAGES</span><h2>Choose your world</h2><p>Four difficulty groups, 30 levels each. Complete a level to unlock the next.</p></div><div className="sdlem-level-picker"><label>Difficulty <select value={Math.floor(levelId/30)} onChange={e=>selectLevel(Number(e.target.value)*30)}>{GROUPS.map((g,i)=><option key={g} value={i}>{g}</option>)}</select></label><label>Level <select value={levelId%30} onChange={e=>selectLevel(Math.floor(levelId/30)*30+Number(e.target.value))}>{Array.from({length:30},(_,i)=><option key={i} value={i}>{String(i+1).padStart(2,"0")} · {LEVELS[Math.floor(levelId/30)*30+i].name}</option>)}</select></label><span className="sdlem-campaign-count">{Object.keys(best).length} / 120 cleared</span></div></div>
  <div className="sdlem-howto"><span className="sdlem-howto-icon">💡</span><div><b>Classic Lemmings rules</b><p>Dumplings walk on their own, turn at walls and fall if you leave a gap. Assign skills to change the landscape or their behaviour. Blockers stop the parade and turn other walkers back; builders lay 12 steps; bashers tunnel sideways; miners cut diagonally; diggers tunnel down; climbers scale walls; floaters survive long falls; bombers clear a small crater. Pause to plan, adjust the release rate and use the mini-map/scrollbar to explore the whole level.</p></div></div>
 </div></section>
}
