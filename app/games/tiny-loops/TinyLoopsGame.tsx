"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window { THREE?: any; }
}

type GameStatus = "ready" | "playing" | "crashed" | "won";
const THREE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.1/three.min.js";

function loadThree() {
  return new Promise<any>((resolve, reject) => {
    if (window.THREE) return resolve(window.THREE);
    const existing = document.querySelector<HTMLScriptElement>('script[data-tiny-loops-three]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.THREE));
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = THREE_CDN;
    script.async = true;
    script.dataset.tinyLoopsThree = "true";
    script.onload = () => window.THREE ? resolve(window.THREE) : reject(new Error("Three.js did not initialise"));
    script.onerror = () => reject(new Error("Unable to load the 3D game engine"));
    document.head.appendChild(script);
  });
}

function makeCourse(T: any) {
  const points: any[] = [];
  const hillCrestIndices: number[] = [];
  const add = (p: any) => points.push(p.clone());
  const line = (to: any, steps = 24) => {
    const from = points[points.length - 1];
    for (let i = 1; i <= steps; i++) add(from.clone().lerp(to, i / steps));
  };
  const hill = (to: any, height: number, steps = 64, launchable = true) => {
    const from = points[points.length - 1];
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      add(from.clone().lerp(to, t).add(new T.Vector3(0, Math.sin(Math.PI * t) * height, 0)));
      if (launchable && i === Math.round(steps / 2)) hillCrestIndices.push(points.length - 1);
    }
  };
  const bend = (control: any, to: any, steps = 56) => {
    const from = points[points.length - 1];
    for (let i = 1; i <= steps; i++) {
      const t = i / steps, u = 1 - t;
      add(from.clone().multiplyScalar(u * u).add(control.clone().multiplyScalar(2 * u * t)).add(to.clone().multiplyScalar(t * t)));
    }
  };

  // A deliberately simple, continuous coaster: gentle opening, clear ramps,
  // broad turns and small changes in height. No vertical loops or corkscrews
  // that can make the cart or chase camera appear to flip by themselves.
  add(new T.Vector3(0, 0, 12));
  hill(new T.Vector3(0, 0, -42), 3, 70, false);
  bend(new T.Vector3(2, 0, -62), new T.Vector3(15, 0, -78));
  line(new T.Vector3(18, 0, -94), 22);

  // First proper jump: one clear, rounded ramp.
  hill(new T.Vector3(28, 0, -145), 7, 76, true);
  bend(new T.Vector3(42, 2, -166), new T.Vector3(48, 3, -190));
  line(new T.Vector3(48, 3, -212), 28);

  // A broad sweeping turn and a second, slightly larger jump.
  bend(new T.Vector3(68, 4, -235), new T.Vector3(64, 5, -260), 72);
  hill(new T.Vector3(38, 5, -302), 9, 84, true);
  bend(new T.Vector3(16, 8, -326), new T.Vector3(8, 8, -350), 64);
  line(new T.Vector3(8, 8, -374), 30);

  // Final downhill section with a smaller jump before the finish.
  bend(new T.Vector3(-10, 5, -396), new T.Vector3(-18, 3, -420), 64);
  hill(new T.Vector3(-12, 0, -468), 5, 72, true);
  bend(new T.Vector3(4, 0, -492), new T.Vector3(18, 0, -516), 64);
  line(new T.Vector3(18, 0, -555), 55);

  const curve = new T.CatmullRomCurve3(points, false, "centripetal", 0.15);
  curve.arcLengthDivisions = 3000;
  curve.updateArcLengths();
  const sampledLengths = curve.getLengths(curve.arcLengthDivisions);
  (curve as any).hillCrestDistances = hillCrestIndices.map((pointIndex) => {
    const parameter = (pointIndex / (points.length - 1)) * curve.arcLengthDivisions;
    const lower = Math.floor(parameter);
    const upper = Math.min(curve.arcLengthDivisions, lower + 1);
    const fraction = parameter - lower;
    return sampledLengths[lower] + (sampledLengths[upper] - sampledLengths[lower]) * fraction;
  });
  return curve;
}
function createWorld(T: any, mount: HTMLDivElement, onHud: (v: { speed: number; coins: number; flips: number; status: GameStatus; airborne?: boolean; holding?: boolean }) => void) {
  const scene = new T.Scene();
  scene.background = new T.Color(0x9cddff);
  scene.fog = new T.Fog(0xb8e7ff, 95, 260);
  const camera = new T.PerspectiveCamera(56, 1, 0.1, 500);
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.outputColorSpace = T.SRGBColorSpace;
  mount.appendChild(renderer.domElement);

  scene.add(new T.HemisphereLight(0xffffff, 0x9ab5c9, 2.25));
  const sun = new T.DirectionalLight(0xfff3d5, 2.4);
  sun.position.set(-35, 65, 30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  scene.add(sun);

  const course = makeCourse(T);
  const length = course.getLength();
  const segments = 1800;
  const frames = course.computeFrenetFrames(segments, false);
  const railMaterial = new T.MeshStandardMaterial({ color: 0xffc928, metalness: 0.05, roughness: 0.72 });
  const sleeperMaterials = [
    new T.MeshStandardMaterial({ color: 0xffe36a, roughness: 0.9 }),
    new T.MeshStandardMaterial({ color: 0x343b4b, roughness: 0.95 }),
  ];
  const trackGroup = new T.Group();
  scene.add(trackGroup);

  const frameAt = (index: number) => {
    const tangent = frames.tangents[index].clone().normalize();
    const worldUp = new T.Vector3(0, 1, 0);
    let side = new T.Vector3().crossVectors(tangent, worldUp);
    if (side.lengthSq() < 0.0001) side.set(1, 0, 0);
    side.normalize();
    const normal = new T.Vector3().crossVectors(side, tangent).normalize();
    return { tangent, normal, side };
  };

  // Only the four deliberately modelled hill crests can launch the cart.
  const jumpTriggers: number[] = (course as any).hillCrestDistances;

  // The rails stay continuous: the cart launches from raised hill crests, not missing track.
  [-0.72, 0.72].forEach((offset) => {
    [[0, length]].forEach(([from, to]) => {
      const pts: any[] = [];
      const count = Math.max(8, Math.ceil((to - from) * 5));
      for (let j = 0; j <= count; j++) {
        const d = from + ((to - from) * j) / count;
        const u = course.getUtoTmapping(0, d);
        const p = course.getPointAt(u);
        const f = frameAt(Math.min(segments, Math.round(u * segments)));
        pts.push(p.addScaledVector(f.side, offset).addScaledVector(f.normal, 0.12));
      }
      const railCurve = new T.CatmullRomCurve3(pts, false, "centripetal");
      const mesh = new T.Mesh(new T.TubeGeometry(railCurve, Math.max(40, count), 0.16, 8, false), railMaterial);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      trackGroup.add(mesh);
    });
  });

  const sleeperGeo = new T.BoxGeometry(2.05, 0.2, 0.42);
  const sleeperDummy = new T.Object3D();
  const sleeperMesh = new T.InstancedMesh(sleeperGeo, sleeperMaterials[0], 760);
  const sleeperDark = new T.InstancedMesh(sleeperGeo, sleeperMaterials[1], 760);
  let lightCount = 0, darkCount = 0;
  const inJump = (_d: number) => false;
  for (let i = 0; i < 760; i++) {
    const d = (length * i) / 759;
    if (inJump(d)) continue;
    const u = course.getUtoTmapping(0, d);
    const p = course.getPointAt(u);
    const f = frameAt(Math.min(segments, Math.round(u * segments)));
    const matrix = new T.Matrix4().makeBasis(f.side.clone().negate(), f.normal, f.tangent);
    sleeperDummy.position.copy(p).addScaledVector(f.normal, 0.03);
    sleeperDummy.quaternion.setFromRotationMatrix(matrix);
    sleeperDummy.updateMatrix();
    if (i % 2 === 0) sleeperMesh.setMatrixAt(lightCount++, sleeperDummy.matrix);
    else sleeperDark.setMatrixAt(darkCount++, sleeperDummy.matrix);
  }
  sleeperMesh.count = lightCount;
  sleeperDark.count = darkCount;
  trackGroup.add(sleeperMesh, sleeperDark);

  // Floating low-poly rock shelves and cliff faces beneath the course.
  const rockMat = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true });
  const cliffMat = new T.MeshStandardMaterial({ color: 0xa9c5d8, roughness: 1, flatShading: true });
  const platformGeo = new T.BoxGeometry(1, 1, 1);
  const platformData = [
    [0, -5, -22, 17, 3, 25], [16, -8, -73, 23, 5, 24],
    [43, -7, -171, 26, 5, 34], [55, -9, -208, 28, 5, 24],
    [20, 4, -260, 33, 5, 24], [-18, 9, -343, 27, 5, 29],
    [3, -8, -448, 31, 5, 30], [34, -8, -520, 29, 5, 42],
  ];
  platformData.forEach(([x, y, z, sx, sy, sz], i) => {
    const platform = new T.Mesh(platformGeo, rockMat);
    platform.position.set(x, y, z);
    platform.scale.set(sx, sy, sz);
    platform.castShadow = true;
    platform.receiveShadow = true;
    scene.add(platform);
    const cliff = new T.Mesh(platformGeo, cliffMat);
    cliff.position.set(x + (i % 2 ? 2 : -2), y - sy * 1.9, z);
    cliff.scale.set(sx * 0.88, sy * 2.8, sz * 0.9);
    cliff.castShadow = true;
    cliff.receiveShadow = true;
    scene.add(cliff);
  });

  // Small yellow cart and rider, matching the tiny silhouette in the reference.
  const cart = new T.Group();
  const chassis = new T.Mesh(new T.BoxGeometry(1.65, 0.28, 1.95), new T.MeshStandardMaterial({ color: 0x343b4b, roughness: 0.95 }));
  chassis.position.y = 0.12;
  chassis.castShadow = true;
  cart.add(chassis);
  const body = new T.Mesh(new T.BoxGeometry(1.42, 0.55, 1.58), new T.MeshStandardMaterial({ color: 0xffa928, roughness: 0.78 }));
  body.position.y = 0.28;
  body.castShadow = true;
  cart.add(body);
  const seat = new T.Mesh(new T.BoxGeometry(0.72, 0.48, 0.48), new T.MeshStandardMaterial({ color: 0x343b48, roughness: 0.85 }));
  seat.position.set(0, 0.53, 0.25);
  seat.castShadow = true;
  cart.add(seat);
  const head = new T.Mesh(new T.SphereGeometry(0.4, 16, 12), new T.MeshStandardMaterial({ color: 0xffd65a, roughness: 0.9, flatShading: true }));
  head.position.set(0, 0.84, -0.18);
  head.castShadow = true;
  cart.add(head);
  const riderBody = new T.Mesh(new T.CapsuleGeometry(0.25, 0.48, 4, 8), new T.MeshStandardMaterial({ color: 0x2e6ec8, roughness: 0.95 }));
  riderBody.position.set(0, 0.55, 0.03);
  riderBody.castShadow = true;
  cart.add(riderBody);
  [-0.48, 0.48].forEach((x) => [-0.42, 0.42].forEach((z) => {
    const wheel = new T.Mesh(new T.CylinderGeometry(0.24, 0.24, 0.16, 12), new T.MeshStandardMaterial({ color: 0x303747, roughness: 1 }));
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.14, z);
    cart.add(wheel);
  }));
  cart.scale.setScalar(1.15);
  scene.add(cart);
  const baseCartQuaternion = new T.Quaternion();
  const flipQuaternion = new T.Quaternion();
  const flipAxis = new T.Vector3(1, 0, 0);

  const coinMat = new T.MeshStandardMaterial({ color: 0xffd52f, metalness: 0.75, roughness: 0.25, emissive: 0x6b4d00 });
  const coins: any[] = [];
  for (let i = 0; i < 35; i++) {
    const d = 18 + i * 14;
    if (d >= length - 8) break;
    const p = course.getPointAt(course.getUtoTmapping(0, d));
    const coin = new T.Mesh(new T.TorusGeometry(0.42, 0.12, 8, 18), coinMat);
    coin.position.copy(p).add(new T.Vector3(0, 1.8, 0));
    coin.rotation.y = Math.PI / 2;
    scene.add(coin);
    coins.push({ mesh: coin, distance: d, collected: false });
  }

  const state = { status: "ready" as GameStatus, distance: 0, speed: 0, holding: false, flips: 0, spin: 0, coins: 0, airborne: false, airHeight: 0, verticalVelocity: 0, airElapsed: 0, activeJumpEnd: 0, jumpDuration: 0.9, jumpHeight: 5, elapsed: 0, lastTime: performance.now(), raf: 0 };
  const resize = () => {
    const w = Math.max(1, mount.clientWidth), h = Math.max(1, mount.clientHeight);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(mount);
  resize();

  const animate = (now: number) => {
    state.raf = requestAnimationFrame(animate);
    const dt = Math.min((now - state.lastTime) / 1000, 0.035);
    state.lastTime = now;
    const previousDistance = state.distance;
    if (state.status === "playing") {
      // The ride only advances while the player is holding. Releasing brakes the cart.
      state.speed = Math.min(38, state.speed + (state.holding ? 26 : -12) * dt);
      state.speed = Math.max(0, state.speed);
      state.distance += state.speed * dt;
      if (!state.airborne && state.speed >= 16) {
        const launch = jumpTriggers.find((crest) => previousDistance < crest && state.distance >= crest);
        if (launch !== undefined) {
          state.airborne = true;
          state.airHeight = 0;
          state.airElapsed = 0;
          state.jumpDuration = Math.min(1.3, 0.78 + (state.speed - 16) * 0.018);
          state.jumpHeight = 4 + state.speed * 0.13;
          state.activeJumpEnd = launch + state.speed * state.jumpDuration;
          state.spin = 0;
        }
      }
      if (state.distance >= length - 3) {
        state.status = "won";
        onHud({ speed: state.speed, coins: state.coins, flips: state.flips, status: state.status });
      }
    }

    // A predictable jump arc: the cart follows the track and rises above it.
    // Holding during the arc rotates the cart; releasing immediately stops the flip.
    if (state.airborne) {
      state.airElapsed += dt;
      const progress = Math.min(1, state.airElapsed / state.jumpDuration);
      state.airHeight = Math.sin(progress * Math.PI) * state.jumpHeight;
      if (state.holding) state.spin += dt * Math.PI * 2 * 1.65;
      if (progress >= 1) {
        state.airHeight = 0;
        state.airborne = false;
        const completed = Math.floor(state.spin / (Math.PI * 2));
        const landingAngle = Math.abs(Math.atan2(Math.sin(state.spin), Math.cos(state.spin)));
        if (landingAngle > 0.7) {
          state.status = "crashed";
          state.speed = 0;
        } else if (completed > 0) {
          state.coins += completed * 2;
          state.flips += completed;
        }
        state.spin = 0;
      }
    }

    const distance = Math.min(state.distance, length - 0.1);
    const u = course.getUtoTmapping(0, distance);
    const point = course.getPointAt(u);
    const index = Math.min(segments, Math.round(u * segments));
    const frame = frameAt(index);
    point.y += state.airHeight;
    cart.position.copy(point).addScaledVector(frame.normal, 0.25);
    const basis = new T.Matrix4().makeBasis(frame.side.clone().negate(), frame.normal, frame.tangent);
    baseCartQuaternion.setFromRotationMatrix(basis);
    cart.quaternion.copy(baseCartQuaternion);
    if (state.airborne) {
      // Set the local pitch from the flight angle; do not accumulate rotation each frame.
      flipQuaternion.setFromAxisAngle(flipAxis, -state.spin);
      cart.quaternion.multiply(flipQuaternion);
    }

    // Keep the complete, enlarged cart visible in a stable third-person chase view.
    const cameraTarget = cart.position.clone();
    cameraTarget.y += 0.25;
    const cameraPosition = cart.position.clone()
      .addScaledVector(frame.tangent, -14)
      .addScaledVector(frame.normal, 7.5);
    camera.position.lerp(cameraPosition, 1 - Math.exp(-dt * 5.5));
    camera.up.set(0, 1, 0);
    camera.lookAt(cameraTarget);

    coins.forEach((coin) => {
      coin.mesh.rotation.y += dt * 2;
      if (!coin.collected && Math.abs(coin.distance - distance) < 1.5) {
        coin.collected = true;
        coin.mesh.visible = false;
        state.coins++;
      }
    });
    renderer.render(scene, camera);
    if (now - state.elapsed > 120) {
      state.elapsed = now;
      onHud({ speed: state.speed, coins: state.coins, flips: state.flips, status: state.status, airborne: state.airborne, holding: state.holding });
    }
  };
  state.raf = requestAnimationFrame(animate);

  const resetRun = () => {
    state.status = "playing";
    state.distance = 0;
    state.speed = 12;
    state.holding = false;
    state.flips = 0;
    state.spin = 0;
    state.coins = 0;
    state.airborne = false;
    state.airHeight = 0;
    state.verticalVelocity = 0;
    state.airElapsed = 0;
    state.activeJumpEnd = 0;
    state.jumpDuration = 0.9;
    state.jumpHeight = 5;
    state.lastTime = performance.now();
    coins.forEach((coin) => { coin.collected = false; coin.mesh.visible = true; });
    onHud({ speed: state.speed, coins: 0, flips: 0, status: "playing", airborne: false, holding: false });
  };

  return {
    start: resetRun,
    restart: resetRun,
    setHolding(value: boolean) { state.holding = value; },
    destroy() {
      cancelAnimationFrame(state.raf);
      observer.disconnect();
      renderer.dispose();
      renderer.domElement.remove();
      scene.traverse((obj: any) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach((m: any) => m.dispose());
      });
    },
  };
}

export default function TinyLoopsGame() {
  const mountRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<ReturnType<typeof createWorld> | null>(null);
  const [status, setStatus] = useState<GameStatus>("ready");
  const [speed, setSpeed] = useState(0);
  const [coins, setCoins] = useState(0);
  const [flips, setFlips] = useState(0);
  const [airborne, setAirborne] = useState(false);
  const [error, setError] = useState("");
  const [engineReady, setEngineReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let world: ReturnType<typeof createWorld> | null = null;
    loadThree().then((T) => {
      if (cancelled || !mountRef.current) return;
      world = createWorld(T, mountRef.current, (v) => {
        setSpeed(Math.round(v.speed * 4));
        setCoins(v.coins);
        setFlips(v.flips);
        setAirborne(Boolean(v.airborne));
        setStatus(v.status);
      });
      gameRef.current = world;
      setEngineReady(true);
    }).catch((e) => setError(e instanceof Error ? e.message : "Unable to start the 3D game"));
    return () => {
      cancelled = true;
      world?.destroy();
      gameRef.current = null;
    };
  }, []);

  const start = () => {
    if (!gameRef.current) return;
    gameRef.current.start();
  };
  const holdStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId);
    gameRef.current?.setHolding(true);
  };
  const holdEnd = (e?: React.PointerEvent<HTMLDivElement>) => {
    if (e) e.preventDefault();
    gameRef.current?.setHolding(false);
  };

  return (
    <main className="loop-rush-page">
      <header className="loop-rush-header">
        <a href="/" className="loop-rush-back">← SHH Design</a>
        <span className="loop-rush-brand">SHH <b>ARCADE</b></span>
      </header>
      <section className="loop-rush-shell">
        <div className="loop-rush-heading">
          <div><span className="loop-rush-kicker">THE ORIGINAL-STYLE 3D RIDE</span><h1>TINY LOOPS</h1><p>Hold to accelerate and flip through the air. Release to coast.</p></div>
          <div className="loop-rush-level"><span>LEVEL 01</span><b>First Run</b></div>
        </div>
        <div className="loop-rush-game-frame" onPointerDown={holdStart} onPointerUp={holdEnd} onPointerCancel={holdEnd} onLostPointerCapture={holdEnd} onContextMenu={(e) => e.preventDefault()}>
          <div ref={mountRef} className="loop-rush-canvas" />
          <div className="loop-rush-hud"><span>⚡ {speed} SPEED</span><span>🟡 {coins} COINS</span><span>↻ {flips} FLIPS</span><strong className="loop-rush-air-status">{airborne ? "AIRBORNE — HOLD TO FLIP!" : "HOLD TO ACCELERATE"}</strong></div>
          {error && <div className="loop-rush-overlay"><h2>3D ENGINE ERROR</h2><p>{error}</p></div>}
          {status === "ready" && !error && <div className="loop-rush-overlay"><span className="loop-rush-pill">{engineReady ? "READY?" : "LOADING"}</span><h2>TINY LOOPS</h2><p>{engineReady ? "Hold START to launch and accelerate. Keep holding to build speed and flip from hilltops." : "Loading the 3D track…"}</p><button disabled={!engineReady} onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); start(); gameRef.current?.setHolding(true); const frame = e.currentTarget.closest(".loop-rush-game-frame") as HTMLDivElement | null; frame?.setPointerCapture(e.pointerId); }}>{engineReady ? "HOLD TO START →" : "LOADING…"}</button></div>}
          {status === "crashed" && <div className="loop-rush-overlay" onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()}><span className="loop-rush-pill">WIPEOUT</span><h2>YOU MISSED THE LANDING</h2><p>Hold to build speed and try the jump again.</p><button onClick={(e) => { e.stopPropagation(); gameRef.current?.restart(); }}>TRY AGAIN ↻</button></div>}
          {status === "won" && <div className="loop-rush-overlay" onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()}><span className="loop-rush-pill">TRACK CLEARED</span><h2>NICE RIDE!</h2><p>{coins} coins · {flips} flips</p><button onClick={(e) => { e.stopPropagation(); gameRef.current?.restart(); }}>RIDE AGAIN ↻</button></div>}
        </div>
        <div className="loop-rush-controls"><span><i className="loop-rush-dot" /> HOLD TO ACCELERATE / FLIP</span><span>RELEASE TO STOP FLIPPING</span></div>
      </section>
      <footer className="loop-rush-footer">A LITTLE ARCADE FUN BY <b>SHH DESIGN</b></footer>
    </main>
  );
}
