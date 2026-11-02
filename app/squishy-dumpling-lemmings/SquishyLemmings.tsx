"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type Skill = "umbrella" | "builder" | "climber" | "digger" | "blocker"
type BaoKind = "classic" | "strawberry" | "matcha" | "blueberry" | "lavender" | "peach" | "golden" | "rainbow"
type Bao = { id: number; x: number; y: number; dir: 1 | -1; kind: BaoKind; skill?: Skill; fall: number; saved: boolean; walking: boolean }
type Level = { name: string; subtitle: string; spawn: number; target: number; exitX: number; exitY: number; platforms: { x: number; y: number; w: number; h: number; kind?: string }[]; hazards: { x: number; y: number; w: number; h: number; kind: string }[] }

const LEVELS: Level[] = [
  { name: "Bao Garden", subtitle: "A little hop, skip & umbrella!", spawn: 8, target: 6, exitX: 91, exitY: 75,
    platforms: [{x:0,y:83,w:29,h:5},{x:36,y:83,w:23,h:5},{x:66,y:83,w:34,h:5},{x:43,y:62,w:16,h:4},{x:66,y:48,w:13,h:4}],
    hazards: [{x:29,y:83,w:7,h:5,kind:"gap"},{x:59,y:83,w:7,h:5,kind:"gap"},{x:59,y:83,w:7,h:5,kind:"gap"}] },
  { name: "Matcha Mountain", subtitle: "Build a bridge across the big gap.", spawn: 10, target: 7, exitX: 92, exitY: 78,
    platforms: [{x:0,y:83,w:24,h:5},{x:43,y:83,w:18,h:5},{x:77,y:83,w:23,h:5},{x:23,y:65,w:14,h:4},{x:57,y:55,w:13,h:4},{x:77,y:69,w:10,h:4}],
    hazards: [{x:24,y:83,w:19,h:5,kind:"gap"},{x:61,y:83,w:16,h:5,kind:"gap"}] },
  { name: "Rainbow Rooftops", subtitle: "Climb up, dig down, and get everyone home.", spawn: 12, target: 8, exitX: 92, exitY: 44,
    platforms: [{x:0,y:83,w:23,h:5},{x:23,y:68,w:18,h:5},{x:41,y:55,w:17,h:5},{x:58,y:68,w:17,h:5},{x:75,y:48,w:25,h:5},{x:75,y:83,w:25,h:5}],
    hazards: [{x:23,y:83,w:52,h:5,kind:"gap"}] },
]

const COLORS: Record<BaoKind, { fill: string; line: string; cheek: string }> = {
  classic: {fill:"#fff0d9",line:"#dfbca0",cheek:"#f49c9e"},
  strawberry: {fill:"#ffc9d8",line:"#e995b0",cheek:"#ef8ea7"},
  matcha: {fill:"#cce5ae",line:"#96bd7c",cheek:"#f49c9e"},
  blueberry: {fill:"#c9d6ff",line:"#91a7e6",cheek:"#ee9bb3"},
  lavender: {fill:"#e3d0ff",line:"#b59add",cheek:"#ef9eb7"},
  peach: {fill:"#ffd6b7",line:"#e9ae8b",cheek:"#f49c9e"},
  golden: {fill:"#ffcf63",line:"#d99b2b",cheek:"#f49c9e"},
  rainbow: {fill:"url(#bao-rainbow-fill)",line:"#c5a0df",cheek:"#f49c9e"},
}
const KINDS: BaoKind[] = ["classic","strawberry","matcha","blueberry","lavender","peach","golden","rainbow"]
const SKILLS: { id: Skill; label: string; icon: string; hint: string; count: number }[] = [
  {id:"umbrella",label:"Umbrella",icon:"☂️",hint:"Float safely down",count:4},
  {id:"builder",label:"Builder",icon:"🧱",hint:"Build a little bridge",count:8},
  {id:"climber",label:"Climber",icon:"🪜",hint:"Climb up walls",count:4},
  {id:"digger",label:"Digger",icon:"⛏️",hint:"Dig through platforms",count:4},
  {id:"blocker",label:"Blocker",icon:"🛑",hint:"Turn the parade around",count:2},
]

function DumplingSprite({kind, skill, tiny=false}: {kind:BaoKind;skill?:Skill;tiny?:boolean}) {
  const c = COLORS[kind]
  return <svg className={tiny ? "sdlem-bao-art sdlem-bao-art--tiny" : "sdlem-bao-art"} viewBox="0 0 120 112" aria-label={kind+" dumpling"} role="img">
    <defs><linearGradient id="bao-rainbow-fill" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffb8d2"/><stop offset="35%" stopColor="#ffe2a2"/><stop offset="65%" stopColor="#b8f3db"/><stop offset="100%" stopColor="#c9b8ff"/></linearGradient></defs>
    <ellipse cx="60" cy="101" rx="35" ry="7" fill="#7d554b" opacity=".12"/>
    <path d="M18 69 C12 54 25 39 36 31 C42 17 51 12 60 17 C69 12 78 17 84 31 C95 39 108 54 102 69 C97 91 80 99 60 99 C40 99 23 91 18 69Z" fill={c.fill} stroke={c.line} strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M34 38 C38 27 47 23 51 30 M60 25 L60 38 M69 30 C75 23 82 28 86 38" fill="none" stroke={c.line} strokeWidth="3" strokeLinecap="round"/>
    <ellipse cx="42" cy="58" rx="4" ry="5" fill="#543b39"/><ellipse cx="78" cy="58" rx="4" ry="5" fill="#543b39"/>
    <path d="M52 69 Q60 77 68 69" fill="none" stroke="#543b39" strokeWidth="3" strokeLinecap="round"/>
    <ellipse cx="31" cy="68" rx="7" ry="4" fill={c.cheek} opacity=".7"/><ellipse cx="89" cy="68" rx="7" ry="4" fill={c.cheek} opacity=".7"/>
    {kind==="golden" && <path d="M91 15 L94 23 L102 26 L94 29 L91 37 L88 29 L80 26 L88 23Z" fill="#f4b33c"/>}
    {kind==="rainbow" && <path d="M15 23 L18 30 L25 33 L18 36 L15 43 L12 36 L5 33 L12 30Z" fill="#d7a7ff"/>}
    {skill==="umbrella" && <g><path d="M25 26 Q60 -3 95 26Z" fill="#ff91b7" stroke="#b96792" strokeWidth="2"/><path d="M60 25 V43 Q60 49 66 46" fill="none" stroke="#8b668d" strokeWidth="3" strokeLinecap="round"/></g>}
    {skill==="climber" && <text x="83" y="24" fontSize="20">🪜</text>}
    {skill==="builder" && <text x="80" y="23" fontSize="18">🧱</text>}
    {skill==="digger" && <text x="81" y="24" fontSize="18">⛏️</text>}
    {skill==="blocker" && <text x="80" y="24" fontSize="18">✋</text>}
  </svg>
}

export default function SquishyLemmings() {
  const [levelIndex, setLevelIndex] = useState(0)
  const [baos, setBaos] = useState<Bao[]>([])
  const [selectedSkill, setSelectedSkill] = useState<Skill>("umbrella")
  const [skillCounts, setSkillCounts] = useState<Record<Skill,number>>({umbrella:4,builder:8,climber:4,digger:4,blocker:2})
  const [released, setReleased] = useState(0)
  const [saved, setSaved] = useState(0)
  const [lost, setLost] = useState(0)
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [message, setMessage] = useState("Choose a skill, then tap a dumpling to give it a job.")
  const [sound, setSound] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [levelBest, setLevelBest] = useState<Record<number,number>>({})
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const level = LEVELS[levelIndex]
  const activeCount = baos.filter(b=>!b.saved).length
  const percent = Math.min(100, Math.round((saved / level.target) * 100))

  const resetLevel = useCallback((index=levelIndex) => {
    setLevelIndex(index)
    setBaos([])
    setReleased(0)
    setSaved(0)
    setLost(0)
    setRunning(false)
    setPaused(false)
    setCompleted(false)
    setSkillCounts({umbrella:4,builder:8,climber:4,digger:4,blocker:2})
    setMessage("Ready when you are! Press Release Bao Parade to begin.")
  }, [levelIndex])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("sdlem-level-best")
      if (raw) setLevelBest(JSON.parse(raw))
      const savedSound = window.localStorage.getItem("sdlem-sound")
      if (savedSound !== null) setSound(savedSound === "true")
    } catch {}
  }, [])

  const release = () => {
    if (completed) resetLevel()
    setRunning(true)
    setPaused(false)
    setMessage("Off they go! Tap a dumpling to assign a skill.")
  }

  const assignSkill = (id:number) => {
    const bao = baos.find(b=>b.id===id)
    if (!bao || bao.saved || bao.skill || !running || paused) return
    if (skillCounts[selectedSkill] <= 0) {
      setMessage("Oops! You've used all your "+selectedSkill+" skills.")
      return
    }
    setBaos(old=>old.map(b=>b.id===id ? {...b,skill:selectedSkill} : b))
    setSkillCounts(old=>({...old,[selectedSkill]:old[selectedSkill]-1}))
    const labels:Record<Skill,string> = {umbrella:"opened a teeny umbrella",builder:"started building a squishy bridge",climber:"learned to climb",digger:"started digging",blocker:"became a little traffic marshal"}
    setMessage("A job for Bao #"+(id+1)+" — "+labels[selectedSkill]+"!")
  }

  useEffect(() => {
    if (!running || paused || completed) return
    intervalRef.current = setInterval(() => {
      setBaos(old => {
        const next = old.map(b => {
          if (b.saved) return b
          let x = b.x
          let y = b.y
          let dir = b.dir
          let fall = b.fall
          let walking = true
          const floor = level.platforms.find(p => x >= p.x && x <= p.x+p.w && y <= p.y && y >= p.y-8)
          const supported = !!floor
          if (b.skill === "blocker") { walking = false; dir = (Math.floor(Date.now()/900)%2 ? 1 : -1) as 1|-1; }
          else if (b.skill === "digger" && supported && floor && floor.w > 7) { y += 1.4; if (y > floor.y + 7) { b.skill = undefined; } }
          else if (!supported && y < 93) {
            fall += b.skill === "umbrella" ? 0.22 : 0.9
            y += Math.min(fall, b.skill === "umbrella" ? 1.1 : 3.4)
            walking = false
          } else {
            if (floor) y = floor.y
            fall = 0
            const wall = level.platforms.some(p=>p.h>8 && x+dir*1.1 > p.x && x+dir*1.1 < p.x+p.w && Math.abs(y-p.y)<7)
            if (wall && b.skill==="climber") { x += dir*1.1; y -= 1.1; }
            else if (wall) dir = (dir*-1) as 1|-1
            else x += dir * (b.skill==="builder" ? 0.65 : 0.95)
            if (b.skill==="builder") {
              const gapAhead = level.hazards.some(h=>h.kind==="gap" && x+dir*3 >= h.x && x+dir*3 <= h.x+h.w && Math.abs(y-h.y)<9)
              if (gapAhead) {
                const exists = level.platforms.some(p=>p.kind==="bridge" && Math.abs(p.x-(x+dir*2))<3)
                if (!exists) level.platforms.push({x:Math.max(0,x-1),y,w:4,h:2,kind:"bridge"})
              }
            }
          }
          if (x < 2) { x=2; dir=1 }
          if (x > 98) { x=98; dir=-1 }
          const atExit = Math.abs(x-level.exitX)<3 && Math.abs(y-level.exitY)<12
          if (atExit) return {...b,x,y,dir,fall,walking,saved:true}
          if (y >= 92 && !level.platforms.some(p=>x>=p.x && x<=p.x+p.w && Math.abs(y-p.y)<5)) return {...b,x,y,dir,fall,walking,saved:false}
          return {...b,x,y,dir,fall,walking}
        })
        const newlySaved = next.filter(b=>b.saved && !old.find(o=>o.id===b.id)?.saved).length
        if (newlySaved) setSaved(s=>s+newlySaved)
        const newlyLost = next.filter(b=>!b.saved && b.y>=92 && !level.platforms.some(p=>b.x>=p.x && b.x<=p.x+p.w && Math.abs(b.y-p.y)<5)).length
        if (newlyLost) setLost(s=>s+newlyLost)
        return next
      })
      setReleased(old => {
        if (old < level.spawn && Math.random() < 0.11 * speed) {
          const id = old
          setBaos(current => current.some(b=>b.id===id) ? current : [...current,{id,x:4,y:77,dir:1,kind:KINDS[(id+levelIndex*2)%KINDS.length],fall:0,saved:false,walking:true}])
          return old+1
        }
        return old
      })
    }, 100 / speed)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running,paused,completed,level,levelIndex,speed])

  useEffect(() => {
    if (!running || completed) return
    if (saved >= level.target) {
      setCompleted(true); setRunning(false); setMessage("All those happy baos made it home! Level complete! ✨")
      setLevelBest(old => {
        const next = {...old,[levelIndex]:Math.max(old[levelIndex]||0,saved)}
        try { window.localStorage.setItem("sdlem-level-best",JSON.stringify(next)) } catch {}
        return next
      })
    } else if (released >= level.spawn && baos.length > 0 && activeCount === 0) {
      setRunning(false); setCompleted(true)
      setMessage("The parade has finished. "+saved+" made it home — try again and rescue more!")
    }
  }, [saved,released,level,baos.length,activeCount,running,completed,levelIndex])

  const toggleSound = () => {
    setSound(old => { try {window.localStorage.setItem("sdlem-sound",String(!old))} catch {}; return !old })
  }

  const chooseLevel = (index:number) => resetLevel(index)
  const platformElements = useMemo(()=>level.platforms.map((p,i)=><g key={i}>
    <rect x={p.x*10} y={p.y*4.2} width={p.w*10} height={Math.max(7,p.h*4.2)} rx="5" className={p.kind==="bridge"?"sdlem-bridge":"sdlem-platform"}/>
    <path d={"M"+(p.x*10+7)+" "+(p.y*4.2+3)+" H"+(p.x*10+p.w*10-7)} className="sdlem-platform-shine"/>
    {p.kind==="bridge" && Array.from({length:Math.max(1,Math.floor(p.w/2))}).map((_,j)=><path key={j} d={"M"+(p.x*10+j*20+10)+" "+(p.y*4.2+4)+" v5"} className="sdlem-bridge-line"/>)}
  </g>),[level])
  const skillLabel = SKILLS.find(s=>s.id===selectedSkill)

  return <section className="sdlem-page">
    <div className="sdlem-shell">
      <div className="sdlem-eyebrow">✦ THE GOO GANG PRESENTS ✦</div>
      <div className="sdlem-heading-row"><div><h1>Squishy Dumpling <span>Lemmings</span></h1><p className="sdlem-intro">Tiny baos. Big adventure. Can you guide them all home?</p></div><div className="sdlem-sticker">૮ ˶ᵔ ᵕ ᵔ˶ ა<br/><b>BAO!</b></div></div>
      <div className="sdlem-stats">
        <div><span>LEVEL</span><strong>{String(levelIndex+1).padStart(2,"0")} <small>/ {LEVELS.length}</small></strong></div>
        <div><span>RESCUED</span><strong>{saved} <small>/ {level.target}</small></strong></div>
        <div><span>ON PARADE</span><strong>{Math.max(0,level.spawn-released)+activeCount}</strong></div>
        <div><span>OOPSIES</span><strong>{lost}</strong></div>
      </div>
      <div className="sdlem-progress"><span style={{width:percent+"%"}}/></div>
      <div className="sdlem-game-frame">
        <div className="sdlem-game-top"><div><span className="sdlem-level-pill">WORLD {levelIndex+1}</span><h2>{level.name}</h2><p>{level.subtitle}</p></div><div className="sdlem-top-actions"><button onClick={()=>setPaused(p=>!p)} disabled={!running} className="sdlem-small-btn">{paused?"▶ Resume":"Ⅱ Pause"}</button><button onClick={toggleSound} className="sdlem-small-btn">{sound?"♫ Sound on":"♫ Sound off"}</button></div></div>
        <div className={"sdlem-world"+(paused?" is-paused":"")}>
          <svg className="sdlem-scenery" viewBox="0 0 1000 420" preserveAspectRatio="none" aria-hidden="true">
            <defs><linearGradient id="sdlem-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#dff5ff"/><stop offset="100%" stopColor="#fff0f6"/></linearGradient></defs>
            <rect width="1000" height="420" fill="url(#sdlem-sky)"/>
            <circle cx="835" cy="65" r="33" fill="#fff4b5" opacity=".9"/><circle cx="835" cy="65" r="43" fill="#fff4b5" opacity=".25"/>
            <g fill="#fff" opacity=".8"><ellipse cx="170" cy="76" rx="58" ry="18"/><ellipse cx="205" cy="65" rx="36" ry="22"/><ellipse cx="240" cy="78" rx="45" ry="15"/><ellipse cx="615" cy="105" rx="48" ry="15"/><ellipse cx="644" cy="94" rx="32" ry="21"/></g>
            <g fill="#a9dfc1" opacity=".55"><circle cx="130" cy="316" r="76"/><circle cx="215" cy="333" r="91"/><circle cx="770" cy="331" r="105"/><circle cx="915" cy="327" r="75"/></g>
            {Array.from({length:22}).map((_,i)=><g key={i} transform={"translate("+(i*47+18)+" "+(260+(i%4)*23)+")"} opacity=".7"><circle r="3" fill={i%2?"#f6a9c8":"#f7d47c"}/><path d="M0 0 v-8" stroke="#79bd8b" strokeWidth="2"/></g>)}
            {platformElements}
            {level.hazards.filter(h=>h.kind==="gap").map((h,i)=><g key={i}><rect x={h.x*10} y="352" width={h.w*10} height="68" fill="#7a8bba" opacity=".17"/><path d={"M"+h.x*10+" 355 l10 12 l10 -12 l10 12"} fill="none" stroke="#9ca9d3" strokeWidth="3" opacity=".6"/></g>)}
            <g transform={"translate("+(level.exitX*10-10)+" "+(level.exitY*4.2-65)+")"}><path d="M10 66 V8 H66 V66" fill="#fff8fc" stroke="#c18cc6" strokeWidth="5" strokeLinecap="round"/><path d="M19 66 V17 H57 V66" fill="#d8f5e7"/><path d="M20 17 H56" stroke="#c18cc6" strokeWidth="4"/><text x="38" y="43" textAnchor="middle" fontSize="20">♡</text><text x="38" y="-2" textAnchor="middle" fontSize="14" fill="#9d6eb0" fontWeight="bold">HOME</text></g>
            <g transform="translate(27 280)"><rect x="0" y="0" width="36" height="66" rx="8" fill="#f3c7d9" stroke="#cf9bb8" strokeWidth="3"/><rect x="7" y="7" width="22" height="12" rx="4" fill="#fff2f7"/><text x="18" y="42" fontSize="16" textAnchor="middle">♡</text><text x="18" y="58" fontSize="8" textAnchor="middle" fill="#8d6380">BAO</text></g>
          </svg>
          {baos.filter(b=>!b.saved && b.y<94).map(b=><button key={b.id} className={"sdlem-bao"+(b.skill?" has-skill":"")+(b.id===baos.length-1?" is-new":"")} style={{left:b.x+"%",top:(b.y*0.42)+"%",transform:"translate(-50%,-50%) scaleX("+b.dir+")"}} onClick={()=>assignSkill(b.id)} aria-label={"Assign "+selectedSkill+" to dumpling "+(b.id+1)} title={"Bao #"+(b.id+1)+(b.skill?" · "+b.skill:" · tap to assign "+selectedSkill)}><DumplingSprite kind={b.kind} skill={b.skill} tiny/>{b.skill && <span className="sdlem-skill-dot">{SKILLS.find(s=>s.id===b.skill)?.icon}</span>}</button>)}
          {paused && <div className="sdlem-overlay"><div><span>⏸</span><strong>Parade paused</strong><p>Take your time, little bao boss.</p><button onClick={()=>setPaused(false)}>Back to the parade</button></div></div>}
          {!running && !completed && <div className="sdlem-start-overlay"><div className="sdlem-start-card"><span className="sdlem-big-bao">૮ ˶ᵔ ᵕ ᵔ˶ ა</span><h3>Ready, set, bao!</h3><p>Give your dumplings skills to get them safely to the HOME door.</p><button onClick={release}>▶ Release Bao Parade</button></div></div>}
          {completed && <div className="sdlem-overlay"><div className="sdlem-result-card"><span>{saved>=level.target?"🎉":"💗"}</span><strong>{saved>=level.target?"Level complete!":"Parade finished!"}</strong><p>{saved} of {level.target} required baos made it home.</p>{saved>=level.target && levelIndex<LEVELS.length-1 ? <button onClick={()=>chooseLevel(levelIndex+1)}>Next world →</button>:<button onClick={()=>resetLevel()}>↻ Try again</button>}{saved>=level.target && levelIndex===LEVELS.length-1 && <p className="sdlem-winner">You are the ultimate Bao Boss!</p>}</div></div>}
        </div>
        <div className="sdlem-message" role="status"><span>✦</span>{message}</div>
      </div>
      <div className="sdlem-controls">
        <div className="sdlem-section-heading"><div><span className="sdlem-kicker">YOUR TOOLBOX</span><h2>Pick a skill</h2></div><span className="sdlem-tool-hint">Choose a tool, then tap a walking bao!</span></div>
        <div className="sdlem-skills">{SKILLS.map(s=><button key={s.id} className={"sdlem-skill"+(selectedSkill===s.id?" is-selected":"")} onClick={()=>{setSelectedSkill(s.id);setMessage(s.hint+". Now tap a dumpling to assign it.")}}><span className="sdlem-skill-icon">{s.icon}</span><span className="sdlem-skill-copy"><b>{s.label}</b><small>{s.hint}</small></span><span className="sdlem-skill-count">{skillCounts[s.id]}</span></button>)}</div>
        <div className="sdlem-bottom-row"><div className="sdlem-selected-hint"><span>{skillLabel?.icon}</span><div><b>{skillLabel?.label} selected</b><small>{skillLabel?.hint}. {skillCounts[selectedSkill]} left.</small></div></div><div className="sdlem-play-actions"><label className="sdlem-speed">Speed <select value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={1}>1×</option><option value={1.5}>1.5×</option><option value={2}>2×</option></select></label><button className="sdlem-reset" onClick={()=>resetLevel()}>↻ Restart</button><button className="sdlem-release" onClick={running?()=>setPaused(p=>!p):release}>{running?(paused?"▶ Resume":"Ⅱ Pause"):"▶ Release Bao Parade"}</button></div></div>
      </div>
      <div className="sdlem-level-select"><div><span className="sdlem-kicker">THE BAO ADVENTURE</span><h2>Choose your world</h2><p>Rescue enough dumplings to unlock the next stage.</p></div><div className="sdlem-world-cards">{LEVELS.map((l,i)=><button key={l.name} onClick={()=>i===0||levelBest[i-1]!==undefined||i<=levelIndex?chooseLevel(i):setMessage("Finish the previous world to unlock "+l.name+"!")} className={"sdlem-world-card"+(i===levelIndex?" is-current":"")+(i>0&&i>levelIndex&&levelBest[i-1]===undefined?" is-locked":"")}><span className="sdlem-world-number">{i===0||i<=levelIndex||levelBest[i-1]!==undefined?"0"+(i+1):"🔒"}</span><span className="sdlem-world-emoji">{["🌷","🍵","🌈"][i]}</span><b>{l.name}</b><small>{i===levelIndex?"You're here":i===0||i<=levelIndex||levelBest[i-1]!==undefined?"Tap to play":"Complete the previous world"}</small></button>)}</div></div>
      <div className="sdlem-howto"><span className="sdlem-howto-icon">💡</span><div><b>How to play</b><p>Release the parade, then tap individual dumplings to give them a skill. Umbrellas soften long falls, builders bridge gaps, climbers scale walls, diggers tunnel through platforms and blockers turn their friends around. Get enough baos through the HOME door to win. Some skills work best when assigned just before a hazard!</p></div></div>
      <div className="sdlem-character-strip"><div><span>MEET THE PARADE</span><b>Eight squishy personalities, one big mission.</b></div>{KINDS.map(k=><div key={k} className="sdlem-character"><DumplingSprite kind={k}/><small>{k}</small></div>)}</div>
    </div>
  </section>
}
