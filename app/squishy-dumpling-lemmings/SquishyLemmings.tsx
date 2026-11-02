"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { PointerEvent as ReactPointerEvent } from "react"

type Skill = "climber" | "floater" | "bomber" | "blocker" | "builder" | "basher" | "miner" | "digger"
type Terrain = { x:number; y:number; w:number; h:number; steel?:boolean; bridge?:boolean }
type Hazard = { x:number; y:number; w:number; h:number; kind:"water"|"fire"|"trap" }
type Level = { id:number; name:string; group:string; width:number; total:number; rescue:number; seconds:number; rate:number; hatch:number; exit:number; terrain:Terrain[]; hazards:Hazard[]; skills:Record<Skill,number> }
type Bao = { id:number; x:number; y:number; dir:1|-1; vy:number; fall:number; skill?:Skill; action:number; saved:boolean; dead:boolean; bomber:number; build:number; frame:number }
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
const W=960, H=420, BAO_W=28, BAO_H=38, GROUND=385

function makeLevel(id:number):Level {
 const group=Math.floor(id/30), n=id%30, width=3000+(n%5)*240+group*120
 const terrain:Terrain[]=[]
 const hazards:Hazard[]=[]
 // A continuous base with deliberately varied gaps, ledges and walls.
 let x=0
 while(x<width){
   const segment=210+((n*17+x/210*13+group*29)%4)*32
   const gap=(n+Math.floor(x/210)+group)%5===2 ? 52+((n*7)%3)*20 : 0
   const top=GROUND-(((n+Math.floor(x/210)*3+group*5)%4===0)?34:0)
   terrain.push({x,y:top,w:segment-gap,h:H-top+100})
   x+=segment
 }
 // Raised shelves and chunky walls create routes that require skill choices.
 for(let i=0;i<5+group;i++){
   const px=360+i*(width-700)/(5+group)+((n*19+i*31)%70)
   const py=GROUND-55-((i+n+group)%3)*28
   const pw=90+((n+i*7)%3)*28
   terrain.push({x:px,y:py,w:pw,h:18})
   if((i+n+group)%2===0) terrain.push({x:px+pw+18,y:py-54,w:24,h:GROUND-py+54})
 }
 // Later stages add longer gaps and a few hazard pools.
 if(group>=1){
   const gx=850+(n%6)*260
   hazards.push({x:gx,y:GROUND-4,w:90+(n%3)*25,h:55,kind:n%4===0?"fire":"water"})
 }
 if(group>=2){
   const gx=1450+(n%5)*260
   hazards.push({x:gx,y:GROUND-4,w:46,h:32,kind:"trap"})
 }
 if(group===3){
   const gx=width-900
   hazards.push({x:gx,y:GROUND-4,w:110,h:55,kind:"water"})
   terrain.push({x:width-620,y:GROUND-95,w:26,h:95})
 }
 // Exit platform and a small hatch ledge.
 terrain.push({x:width-330,y:GROUND-26,w:330,h:26})
 terrain.push({x:0,y:GROUND-26,w:160,h:26})
 const skills={...EMPTY_SKILLS}
 if(n%4===0) skills.bomber=0
 if(n%5===1) skills.miner=0
 if(n%6===2) skills.floater=0
 if(n%7===3) skills.climber=0
 if(group>=2){skills.builder=Math.max(2,skills.builder-4);skills.basher=Math.max(0,skills.basher-3)}
 if(group===3){skills.digger=Math.max(0,skills.digger-3);skills.blocker=Math.max(0,skills.blocker-2)}
 const names=["Bao Boulevard","The Wobble Works","Pudding Peaks","The Great Dumpling Drop","Cloud Kitchen Crossing","Sticky Rice Ridge","The Noodle Maze","Mooncake Mountain","Jellybean Junction","The Long Way Home"]
 return {
  id,name:names[(n+group*3)%names.length],group:GROUPS[group],width,total:group===0?20:group===1?30:group===2?40:50,
  rescue:group===0?55+Math.floor(n/10)*5:group===1?65+Math.floor(n/10)*5:group===2?75+Math.floor(n/10)*5:85,
  seconds:Math.max(180,360-group*35-(n%6)*10),rate:20+group*8+(n%5)*4,hatch:75,exit:width-115,
  terrain,hazards,skills
 }
}
const LEVELS=Array.from({length:120},(_,i)=>makeLevel(i))
const BAO_COLOURS=["#fff0d9","#ffc9d8","#cce5ae","#c9d6ff","#e3d0ff","#ffd6b7","#ffcf63","#f3a6d0"]
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v))
const floorAt=(terrain:Terrain[],x:number,y:number)=>terrain.filter(t=>x>=t.x-2&&x<=t.x+t.w+2&&y<=t.y+34&&y>=t.y-32).sort((a,b)=>a.y-b.y)[0]
const solidAt=(terrain:Terrain[],x:number,y:number)=>terrain.some(t=>x>=t.x&&x<=t.x+t.w&&y>=t.y&&y<=t.y+t.h)
const cloneSkills=(s:Record<Skill,number>)=>({...s})

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
  if(!bao||Math.abs(bao.x-px)>24||Math.abs(bao.y-py)>28)return
  if(bao.skill==="climber"||bao.skill==="floater"||bao.skill==="blocker"||bao.skill==="bomber"||bao.skill==="builder"||bao.skill==="basher"||bao.skill==="miner"||bao.skill==="digger")return
  if(g.skills[g.selected]<=0)return
  bao.skill=g.selected;g.skills[g.selected]--
  if(g.selected==="bomber")bao.bomber=2.5
  if(g.selected==="climber"||g.selected==="floater")bao.skill=g.selected
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
     if(b.saved||b.dead)return
     b.frame+=step
     if(b.bomber>0){b.bomber-=step;if(b.bomber<=0){g.terrain=g.terrain.filter(t=>!(b.x>t.x-28&&b.x<t.x+t.w+28&&b.y>t.y-28&&b.y<t.y+t.h+28));b.dead=true;g.dead++;return}}
     if(bomberSkillHazard(b,l.hazards)){b.dead=true;g.dead++;return}
     const foot=b.y+BAO_H/2
     const support=floorAt(g.terrain,b.x+b.dir*3,foot)
     const supported=!!support
     const frontX=b.x+b.dir*(BAO_W/2+2)
     const wall=solidAt(g.terrain,frontX,b.y-4)||solidAt(g.terrain,frontX,b.y+4)
     const blocker=g.baos.find(o=>o!==b&&!o.dead&&!o.saved&&o.skill==="blocker"&&o.action===1&&Math.abs(o.x-b.x)<18&&Math.abs(o.y-b.y)<24)
     if(b.skill==="blocker"&&supported){b.y=support!.y-BAO_H/2;b.vy=0;b.fall=0;b.action=1;return}
     if(blocker){b.dir=(b.x<blocker.x?-1:1);b.x+=b.dir*1.2;return}
     if(b.skill==="digger"&&supported&&support){const idx=g.terrain.indexOf(support);if(!support.steel){support.y+=3;support.h=Math.max(0,support.h-3);b.y+=3;if(support.h<=0)g.terrain.splice(idx,1)}else b.skill=undefined;return}
     if(b.skill==="basher"){
      const targetX=frontX
      const target=g.terrain.find(t=>targetX>=t.x-3&&targetX<=t.x+t.w+3&&b.y+4>=t.y&&b.y-4<=t.y+t.h)
      if(target&&!target.steel){const cut=20;const cutX=b.dir===1?targetX:targetX-cut;target.x+=b.dir===1?cut:0;target.w=Math.max(0,target.w-cut);if(target.w===0)g.terrain=g.terrain.filter(t=>t!==target);b.x+=b.dir*2;return}
      b.skill=undefined
     }
     if(b.skill==="miner"&&supported&&support){
      const cutX=b.dir===1?b.x+7:b.x-7
      const target=g.terrain.find(t=>cutX>=t.x&&cutX<=t.x+t.w&&foot>=t.y-5&&foot<=t.y+t.h)
      if(target&&!target.steel){target.y+=3;target.h=Math.max(0,target.h-3);b.x+=b.dir*1.5;b.y+=2.2;return}
      b.skill=undefined
     }
     if(b.skill==="builder"&&supported){
      if(b.build<12){const bx=b.x+b.dir*7,by=b.y+BAO_H/2-3;b.x+=b.dir*7;b.y-=1.5;b.build++;g.terrain.push({x:bx,y:by,w:9,h:5,bridge:true});return}
      b.skill=undefined;b.build=0
     }
     if(wall){
      if(b.skill==="climber"){b.y-=2;b.x+=b.dir*.5;if(!solidAt(g.terrain,b.x+b.dir*7,b.y-BAO_H/2)){b.y-=5;b.skill=undefined}return}
      b.dir=(b.dir*-1) as 1|-1
     }
     if(supported&&support){if(b.fall>112&&b.skill!=="floater"){b.dead=true;g.dead++;return}b.y=support.y-BAO_H/2;b.vy=0;b.fall=0}
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
    if(b.saved||b.dead||b.x<g.camera-40||b.x>g.camera+W+40)return
    const col=BAO_COLOURS[b.id%BAO_COLOURS.length], bob=Math.sin(b.frame*8)*1.2
    ctx.save();ctx.translate(b.x,b.y+bob);ctx.scale(b.dir,1)
    ctx.fillStyle="#72555b30";ctx.beginPath();ctx.ellipse(0,BAO_H/2+2,13,4,0,0,Math.PI*2);ctx.fill()
    ctx.fillStyle="#8c6670";ctx.beginPath();ctx.ellipse(-6,BAO_H/2-1,5,3,0,0,Math.PI*2);ctx.ellipse(6,BAO_H/2-1,5,3,0,0,Math.PI*2);ctx.fill()
    const body=ctx.createRadialGradient(-5,-9,2,0,0,19);body.addColorStop(0,"#fffdf8");body.addColorStop(.28,col);body.addColorStop(1,"#b889a0")
    ctx.fillStyle=body;ctx.strokeStyle="#986f7c";ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(-11,8);ctx.quadraticCurveTo(-15,-4,-8,-14);ctx.quadraticCurveTo(0,-22,8,-13);ctx.quadraticCurveTo(15,-3,11,8);ctx.quadraticCurveTo(8,16,0,16);ctx.quadraticCurveTo(-9,16,-11,8);ctx.fill();ctx.stroke()
    ctx.strokeStyle="#fff9";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-6,-13);ctx.quadraticCurveTo(-4,-19,0,-14);ctx.quadraticCurveTo(4,-19,7,-12);ctx.stroke()
    ctx.fillStyle="#493640";ctx.beginPath();ctx.ellipse(-4,-2,1.7,2.4,0,0,Math.PI*2);ctx.ellipse(4,-2,1.7,2.4,0,0,Math.PI*2);ctx.fill()
    ctx.fillStyle="#f08fa9";ctx.beginPath();ctx.ellipse(-8,4,3,2,0,0,Math.PI*2);ctx.ellipse(8,4,3,2,0,0,Math.PI*2);ctx.fill()
    ctx.strokeStyle="#754e5b";ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(0,2,2.5,.15,Math.PI-.15);ctx.stroke()
    if(b.skill==="climber"||b.skill==="builder"){ctx.fillStyle=b.skill==="builder"?"#f4bd42":"#e96b67";ctx.beginPath();ctx.arc(0,-15,10,Math.PI,0);ctx.lineTo(10,-12);ctx.lineTo(-10,-12);ctx.fill();ctx.fillStyle="#fff8";ctx.fillRect(-5,-17,5,2)}
    if(b.skill==="floater"){ctx.fillStyle="#ef8eb7";ctx.strokeStyle="#865b91";ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-13,-25);ctx.quadraticCurveTo(0,-43,13,-25);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(0,-25);ctx.lineTo(0,-15);ctx.moveTo(-11,-25);ctx.lineTo(0,-15);ctx.lineTo(11,-25);ctx.stroke()}
    if(b.skill==="bomber"){ctx.fillStyle="#333";ctx.beginPath();ctx.arc(0,-22,4,0,Math.PI*2);ctx.fill();ctx.fillStyle="#f4c84b";ctx.fillRect(2,-28,4,3);ctx.fillStyle="#e85b68";ctx.font="bold 10px sans-serif";ctx.fillText(Math.ceil(b.bomber||0).toString(),-3,-30)}
    if(b.skill==="blocker"){ctx.fillStyle="#df5965";ctx.strokeStyle="#8e3547";ctx.lineWidth=1.5;ctx.fillRect(-13,-8,26,7);ctx.strokeRect(-13,-8,26,7);ctx.fillStyle="#fff";ctx.font="bold 8px sans-serif";ctx.fillText("STOP",-10,-2)}
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
  const bomberSkillHazard=(b:Bao,hazards:Hazard[])=>hazards.some(h=>b.x>h.x&&b.x<h.x+h.w&&b.y>h.y-10&&b.y<h.y+h.h)
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
   <div className="sdlem-message">{hud.complete?"🎉 Level complete!":hud.failed?"💗 Not quite — have another go.":hud.paused?"⏸ Parade paused.":hud.running?"Tap a dumpling in the level to assign the selected skill.":"Press release to start the parade. Select a skill first or during play."}</div>
   {(hud.complete||hud.failed)&&<div className="sdlem-result"><b>{hud.complete?"Beautifully done, Bao Boss!":"The parade has finished."}</b><span>{hud.saved} rescued out of {level.total}. {hud.complete?"The next stage is unlocked.":"Try changing the release rate or skill timing."}</span><button onClick={()=>hud.complete&&levelId<119?reset(levelId+1):reset(levelId)}>{hud.complete&&levelId<119?"Next level →":"Try again"}</button></div>}
  </div>
  <div className="sdlem-controls"><div className="sdlem-section-heading"><div><span className="sdlem-kicker">SKILL PANEL</span><h2>Choose a job</h2></div><span className="sdlem-tool-hint">1. Choose a job · 2. Click a walking dumpling · 3. Watch its outfit change</span></div>
   <div className="sdlem-skills">{SKILLS.map(s=><button key={s.id} disabled={level.skills[s.id]===0||hud.complete||hud.failed} className={"sdlem-skill"+(selected===s.id?" is-selected":"")} onClick={()=>assign(s.id)}><span className="sdlem-skill-icon">{s.icon}</span><span className="sdlem-skill-copy"><b>{s.label}</b><small>{s.tip}</small></span><span className="sdlem-skill-count">{gameRef.current?.skills[s.id]??level.skills[s.id]}</span></button>)}</div>
   <div className="sdlem-bottom-row"><div className="sdlem-selected-hint"><b>Active tool: {SKILLS.find(s=>s.id===selected)?.icon} {SKILLS.find(s=>s.id===selected)?.label}</b><small>Click an unassigned walking dumpling. Its equipment changes immediately.</small></div><div className="sdlem-play-actions"><button className="sdlem-small-btn" onClick={()=>setRate(-5)} disabled={!hud.running}>− Release</button><b className="sdlem-rate">{gameRef.current?.rate??level.rate}</b><button className="sdlem-small-btn" onClick={()=>setRate(5)} disabled={!hud.running}>+ Release</button><button className="sdlem-small-btn" onClick={nuke} disabled={!hud.running}>☠ Nuke</button><label className="sdlem-speed">Speed <select value={speed} onChange={e=>changeSpeed(Number(e.target.value))}><option value={1}>1×</option><option value={2}>2×</option><option value={4}>4×</option></select></label><button className="sdlem-release" onClick={start}>{hud.running?"▶ Continue":"▶ Release Bao Parade"}</button></div></div>
  </div>
  <div className="sdlem-level-select"><div><span className="sdlem-kicker">120 ORIGINAL STAGES</span><h2>Choose your world</h2><p>Four difficulty groups, 30 levels each. Complete a level to unlock the next.</p></div><div className="sdlem-level-picker"><label>Difficulty <select value={Math.floor(levelId/30)} onChange={e=>selectLevel(Number(e.target.value)*30)}>{GROUPS.map((g,i)=><option key={g} value={i}>{g}</option>)}</select></label><label>Level <select value={levelId%30} onChange={e=>selectLevel(Math.floor(levelId/30)*30+Number(e.target.value))}>{Array.from({length:30},(_,i)=><option key={i} value={i}>{String(i+1).padStart(2,"0")} · {LEVELS[Math.floor(levelId/30)*30+i].name}</option>)}</select></label><span className="sdlem-campaign-count">{Object.keys(best).length} / 120 cleared</span></div></div>
  <div className="sdlem-howto"><span className="sdlem-howto-icon">💡</span><div><b>Classic Lemmings rules</b><p>Dumplings walk on their own, turn at walls and fall if you leave a gap. Assign skills to change the landscape or their behaviour. Blockers stop the parade and turn other walkers back; builders lay 12 steps; bashers tunnel sideways; miners cut diagonally; diggers tunnel down; climbers scale walls; floaters survive long falls; bombers clear a small crater. Pause to plan, adjust the release rate and use the mini-map/scrollbar to explore the whole level.</p></div></div>
 </div></section>
}
