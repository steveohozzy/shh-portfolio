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
  const hill = (to: any, height: number, steps = 60, launchable = true) => {
    const from = points[points.length - 1];
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const hillPoint = from.clone().lerp(to, t).add(new T.Vector3(0, Math.sin(Math.PI * t) * height, 0));
      add(hillPoint);
      if (launchable && i === Math.round(steps / 2)) hillCrestIndices.push(points.length - 1);
    }
  };
  const bend = (control: any, to: any, steps = 48) => {
    const from = points[points.length - 1];
    for (let i = 1; i <= steps; i++) {
      const t = i / steps, u = 1 - t;
      add(from.clone().multiplyScalar(u * u).add(control.clone().multiplyScalar(2 * u * t)).add(to.clone().multiplyScalar(t * t)));
    }
  };

  add(new T.Vector3(0, 0, 8));
  // Gentle opening roller: visible rise, but deliberately not a jump trigger.
  hill(new T.Vector3(0, 0, -35), 6, 70, false);
  bend(new T.Vector3(1, 0, -55), new T.Vector3(16, 0, -68));
  line(new T.Vector3(18, 0, -82), 20);

  // A full vertical loop, entered and exited in the direction of travel.
  const loopStart = points[points.length - 1].clone();
  const radius = 8;
  for (let i = 1; i <= 150; i++) {
    const a = (Math.PI * 2 * i) / 150;
    add(new T.Vector3(loopStart.x, radius * (1 - Math.cos(a)), loopStart.z - radius * Math.sin(a)));
  }
  hill(new T.Vector3(18, 0, -112), 5, 55);
  bend(new T.Vector3(34, 0, -130), new T.Vector3(42, 0, -151), 55);
  line(new T.Vector3(42, 0, -174), 28);

  // A wide banked turn around the outside of a floating platform.
  for (let i = 1; i <= 100; i++) {
    const a = (Math.PI / 2) * (i / 100);
    add(new T.Vector3(42 + 19 * Math.sin(a), 1.5 * Math.sin(a * 2), -174 - 19 * (1 - Math.cos(a))));
  }
  hill(new T.Vector3(61, 0, -225), 7, 80);
  bend(new T.Vector3(62, 9, -244), new T.Vector3(45, 12, -257), 55);
  line(new T.Vector3(25, 12, -257), 30);

  // A second, horizontal corkscrew/spiral section.
  const spiralStart = points[points.length - 1].clone();
  for (let i = 1; i <= 180; i++) {
    const a = (Math.PI * 2 * i) / 180;
    add(new T.Vector3(spiralStart.x + 10 * Math.sin(a), 12 + 2.2 * Math.sin(a * 2), spiralStart.z - 10 * (1 - Math.cos(a))));
  }
  line(new T.Vector3(5, 12, -300), 45);
  bend(new T.Vector3(-10, 18, -320), new T.Vector3(-22, 18, -339), 55);
  hill(new T.Vector3(-22, 18, -370), 5, 55);
  bend(new T.Vector3(-22, 4, -395), new T.Vector3(0, 0, -414), 70);
  line(new T.Vector3(0, 0, -460), 65);
  bend(new T.Vector3(18, 0, -485), new T.Vector3(35, 0, -500), 60);
  line(new T.Vector3(35, 0, -555), 75);

  const curve = new T.CatmullRomCurve3(points, false, "centripetal", 0.15);
  curve.arcLengthDivisions = 3000;
  curve.updateArcLengths();
  const courseLength = curve.getLength();
  const sampledLengths = curve.getLengths(curve.arcLengthDivisions);
  (curve as any).hillCrestDistances = hillCrestIndices.map((pointIndex) => {
    // Convert the hill's curve parameter into its real travelled distance. getUtoTmapping()
    // works in the opposite direction (distance fraction -> curve parameter), so using it
    // here shifts launch triggers far away from their actual hilltops.
    const curveParameter = (pointIndex / (points.length - 1)) * curve.arcLengthDivisions;
    const lowerIndex = Math.floor(curveParameter);
    const upperIndex = Math.min(curve.arcLengthDivisions, lowerIndex + 1);
    const blend = curveParameter - lowerIndex;
    return sampledLengths[lowerIndex] +
      (sampledLengths[upperIndex] - sampledLengths[lowerIndex]) * blend;
  });
  return curve;
}

function createWorld(T: any, mount: HTMLDivElement, onHud: (v: { speed: number; coins: number; flips: number; status: GameStatus; airborne?: boolean; holding?: boolean }) => void) {
  const scene = new T.Scene();
  scene.background = new T.Color(0xe9e9e9);
  scene.fog = new T.Fog(0xe9e9e9, 65, 190);
  const camera = new T.PerspectiveCamera(56, 1, 0.1, 500);
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.outputColorSpace = T.SRGBColorSpace;
  mount.appendChild(renderer.domElement);

  scene.add(new T.HemisphereLight(0xffffff, 0x9b9b9b, 2.0));
  const sun = new T.DirectionalLight(0xffffff, 2.1);
  sun.position.set(-35, 65, 30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  scene.add(sun);

  const course = makeCourse(T);
  const length = course.getLength();
  const segments = 1800;
  const frames = course.computeFrenetFrames(segments, false);
  const railMaterial = new T.MeshStandardMaterial({ color: 0xffd83d, metalness: 0.32, roughness: 0.42 });
  const sleeperMaterials = [
    new T.MeshStandardMaterial({ color: 0xf4c62e, roughness: 0.75 }),
    new T.MeshStandardMaterial({ color: 0x424242, roughness: 0.85 }),
  ];
  const trackGroup = new T.Group();
  scene.add(trackGroup);

  const frameAt = (index: number) => ({
    tangent: frames.tangents[index].clone().normalize(),
    normal: frames.normals[index].clone().normalize(),
    side: frames.binormals[index].clone().normalize(),
  });

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
      const mesh = new T.Mesh(new T.TubeGeometry(railCurve, Math.max(40, count), 0.105, 8, false), railMaterial);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      trackGroup.add(mesh);
    });
  });

  const sleeperGeo = new T.BoxGeometry(1.95, 0.16, 0.34);
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
  const rockMat = new T.MeshStandardMaterial({ color: 0xf8f8f8, roughness: 1 });
  const cliffMat = new T.MeshStandardMaterial({ color: 0xbdbdbd, roughness: 1 });
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
  const chassis = new T.Mesh(new T.BoxGeometry(1.55, 0.24, 1.85), new T.MeshStandardMaterial({ color: 0x30343b, roughness: 0.82 }));
  chassis.position.y = 0.12;
  chassis.castShadow = true;
  cart.add(chassis);
  const body = new T.Mesh(new T.BoxGeometry(1.25, 0.42, 1.45), new T.MeshStandardMaterial({ color: 0xffc928, roughness: 0.42 }));
  body.position.y = 0.23;
  body.castShadow = true;
  cart.add(body);
  const seat = new T.Mesh(new T.BoxGeometry(0.72, 0.48, 0.48), new T.MeshStandardMaterial({ color: 0x343b48, roughness: 0.85 }));
  seat.position.set(0, 0.53, 0.25);
  seat.castShadow = true;
  cart.add(seat);
  const head = new T.Mesh(new T.SphereGeometry(0.34, 16, 14), new T.MeshStandardMaterial({ color: 0xffd84c, roughness: 0.7 }));
  head.position.set(0, 0.76, -0.12);
  head.castShadow = true;
  cart.add(head);
  const riderBody = new T.Mesh(new T.CapsuleGeometry(0.23, 0.52, 4, 10), new T.MeshStandardMaterial({ color: 0x25364a, roughness: 0.8 }));
  riderBody.position.set(0, 0.55, 0.03);
  riderBody.castShadow = true;
  cart.add(riderBody);
  [-0.48, 0.48].forEach((x) => [-0.42, 0.42].forEach((z) => {
    const wheel = new T.Mesh(new T.CylinderGeometry(0.2, 0.2, 0.13, 12), new T.MeshStandardMaterial({ color: 0x444444, roughness: 0.9 }));
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.12, z);
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

  const state = { status: "ready" as GameStatus, distance: 0, speed: 0, holding: false, flips: 0, spin: 0, coins: 0, airborne: false, airHeight: 0, verticalVelocity: 0, airElapsed: 0, activeJumpEnd: 0, elapsed: 0, lastTime: performance.now(), raf: 0 };
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
          state.verticalVelocity = Math.min(19, 7 + state.speed * 0.38);
          state.airElapsed = 0;
          state.activeJumpEnd = launch + Math.max(15, state.speed * 1.05);
          state.spin = 0;
        }
      }
      if (state.distance >= length - 3) {
        state.status = "won";
        onHud({ speed: state.speed, coins: state.coins, flips: state.flips, status: state.status });
      }
    }

    // Ballistic flight: gravity controls the arc; holding only controls the backflip.
    if (state.airborne) {
      state.airElapsed += dt;
      state.verticalVelocity -= 22 * dt;
      state.airHeight += state.verticalVelocity * dt;
      if (state.holding) state.spin += dt * Math.PI * 2 * 1.65;
      if (state.airHeight <= 0 && state.airElapsed > 0.16) {
        state.airHeight = 0;
        state.airborne = false;
        state.verticalVelocity = 0;
        const completed = Math.floor(state.spin / (Math.PI * 2));
        const landingAngle = Math.abs(Math.atan2(Math.sin(state.spin), Math.cos(state.spin)));
        if (landingAngle > 0.7) {
          // Landing part-way through a rotation leaves the rider upside down: wipe out.
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
    camera.up.copy(frame.normal);
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

  return {
    start() {
      state.status = "playing"; state.distance = 0; state.speed = 12; state.holding = false;
      state.flips = 0; state.spin = 0; state.coins = 0; state.airborne = false;
      state.airHeight = 0; state.verticalVelocity = 0; state.airElapsed = 0; state.activeJumpEnd = 0;
      coins.forEach((c) => { c.collected = false; c.mesh.visible = true; });
      onHud({ speed: state.speed, coins: 0, flips: 0, status: state.status });
    },
    restart() {
      state.status = "playing"; state.distance = 0; state.speed = 12; state.holding = false;
      state.flips = 0; state.spin = 0; state.coins = 0; state.airborne = false; state.airHeight = 0; state.verticalVelocity = 0; state.airElapsed = 0;
      coins.forEach((c) => { c.collected = false; c.mesh.visible = true; });
      onHud({ speed: state.speed, coins: 0, flips: 0, status: state.status });
    },
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
          {status === "crashed" && <div className="loop-rush-overlay"><span className="loop-rush-pill">WIPEOUT</span><h2>YOU MISSED THE LANDING</h2><p>Hold to build speed and try the jump again.</p><button onClick={(e) => { e.stopPropagation(); start(); }}>TRY AGAIN ↻</button></div>}
          {status === "won" && <div className="loop-rush-overlay"><span className="loop-rush-pill">TRACK CLEARED</span><h2>NICE RIDE!</h2><p>{coins} coins · {flips} flips</p><button onClick={(e) => { e.stopPropagation(); start(); }}>RIDE AGAIN ↻</button></div>}
        </div>
        <div className="loop-rush-controls"><span><i className="loop-rush-dot" /> HOLD TO ACCELERATE / FLIP</span><span>RELEASE TO STOP FLIPPING</span></div>
      </section>
      <footer className="loop-rush-footer">A LITTLE ARCADE FUN BY <b>SHH DESIGN</b></footer>
    </main>
  );
}
