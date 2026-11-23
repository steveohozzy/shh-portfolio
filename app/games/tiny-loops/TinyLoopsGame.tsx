"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window { THREE?: any; }
}

type GameStatus = "ready" | "playing" | "crashed" | "won";
const THREE_CDN = "https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.min.js";

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
  const add = (p: any) => points.push(p.clone());
  const line = (to: any, steps = 24) => {
    const from = points[points.length - 1];
    for (let i = 1; i <= steps; i++) add(from.clone().lerp(to, i / steps));
  };
  const bend = (control: any, to: any, steps = 48) => {
    const from = points[points.length - 1];
    for (let i = 1; i <= steps; i++) {
      const t = i / steps, u = 1 - t;
      add(from.clone().multiplyScalar(u * u).add(control.clone().multiplyScalar(2 * u * t)).add(to.clone().multiplyScalar(t * t)));
    }
  };

  add(new T.Vector3(0, 0, 8));
  line(new T.Vector3(0, 0, -35), 55);
  bend(new T.Vector3(1, 0, -55), new T.Vector3(16, 0, -68));
  line(new T.Vector3(18, 0, -82), 20);

  // A full vertical loop, entered and exited in the direction of travel.
  const loopStart = points[points.length - 1].clone();
  const radius = 8;
  for (let i = 1; i <= 150; i++) {
    const a = (Math.PI * 2 * i) / 150;
    add(new T.Vector3(loopStart.x, radius * (1 - Math.cos(a)), loopStart.z - radius * Math.sin(a)));
  }
  line(new T.Vector3(18, 0, -112), 30);
  bend(new T.Vector3(34, 0, -130), new T.Vector3(42, 0, -151), 55);
  line(new T.Vector3(42, 0, -174), 28);

  // A wide banked turn around the outside of a floating platform.
  for (let i = 1; i <= 100; i++) {
    const a = (Math.PI / 2) * (i / 100);
    add(new T.Vector3(42 + 19 * Math.sin(a), 1.5 * Math.sin(a * 2), -174 - 19 * (1 - Math.cos(a))));
  }
  line(new T.Vector3(61, 0, -225), 60);
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
  line(new T.Vector3(-22, 18, -370), 40);
  bend(new T.Vector3(-22, 4, -395), new T.Vector3(0, 0, -414), 70);
  line(new T.Vector3(0, 0, -460), 65);
  bend(new T.Vector3(18, 0, -485), new T.Vector3(35, 0, -500), 60);
  line(new T.Vector3(35, 0, -555), 75);

  const curve = new T.CatmullRomCurve3(points, false, "centripetal", 0.15);
  curve.arcLengthDivisions = 3000;
  curve.updateArcLengths();
  return curve;
}

function createWorld(T: any, mount: HTMLDivElement, onHud: (v: { speed: number; coins: number; flips: number; status: GameStatus }) => void) {
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
  // Build separate rail meshes around the jump gaps so the cart visibly leaves the track.
  const railSections: [number, number][] = [];
  let sectionStart = 0;
  jumpZones.forEach(([a, b]) => {
    if (a > sectionStart) railSections.push([sectionStart, a]);
    sectionStart = b;
  });
  if (sectionStart < length) railSections.push([sectionStart, length]);
  [-0.72, 0.72].forEach((offset) => {
    railSections.forEach(([from, to]) => {
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
  const jumpZones = [[43, 51], [113, 123], [204, 214], [326, 336]]; // distances along the course
  const inJump = (d: number) => jumpZones.some(([a, b]) => d > a && d < b);
  for (let i = 0; i < 760; i++) {
    const d = (length * i) / 759;
    if (inJump(d)) continue;
    const u = course.getUtoTmapping(0, d);
    const p = course.getPointAt(u);
    const f = frameAt(Math.min(segments, Math.round(u * segments)));
    const matrix = new T.Matrix4().makeBasis(f.side, f.normal, f.tangent);
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
  const body = new T.Mesh(new T.BoxGeometry(1.05, 0.34, 1.35), new T.MeshStandardMaterial({ color: 0xffc928, roughness: 0.42 }));
  body.position.y = 0.23;
  body.castShadow = true;
  cart.add(body);
  const head = new T.Mesh(new T.SphereGeometry(0.27, 14, 12), new T.MeshStandardMaterial({ color: 0xffd84c, roughness: 0.7 }));
  head.position.set(0, 0.76, -0.12);
  head.castShadow = true;
  cart.add(head);
  const riderBody = new T.Mesh(new T.CapsuleGeometry(0.18, 0.48, 4, 8), new T.MeshStandardMaterial({ color: 0xffc928, roughness: 0.8 }));
  riderBody.position.set(0, 0.55, 0.03);
  riderBody.castShadow = true;
  cart.add(riderBody);
  [-0.48, 0.48].forEach((x) => [-0.42, 0.42].forEach((z) => {
    const wheel = new T.Mesh(new T.CylinderGeometry(0.2, 0.2, 0.13, 12), new T.MeshStandardMaterial({ color: 0x444444, roughness: 0.9 }));
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.12, z);
    cart.add(wheel);
  }));
  scene.add(cart);

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

  const state = { status: "ready" as GameStatus, distance: 0, speed: 0, holding: false, flips: 0, spin: 0, coins: 0, elapsed: 0, lastTime: performance.now(), raf: 0 };
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
    if (state.status === "playing") {
      state.speed = Math.min(28, state.speed + (state.holding ? 15 : -4.5) * dt);
      state.speed = Math.max(5, state.speed);
      state.distance += state.speed * dt;
      if (state.distance >= length - 3) {
        state.status = "won";
        onHud({ speed: state.speed, coins: state.coins, flips: state.flips, status: state.status });
      }
    }

    const distance = Math.min(state.distance, length - 0.1);
    const u = course.getUtoTmapping(0, distance);
    const point = course.getPointAt(u);
    const index = Math.min(segments, Math.round(u * segments));
    const frame = frameAt(index);
    const jump = jumpZones.find(([a, b]) => distance >= a && distance <= b);
    let flight = 0;
    if (jump) {
      flight = Math.sin(Math.PI * (distance - jump[0]) / (jump[1] - jump[0]));
      point.addScaledVector(frame.normal, Math.max(0, flight) * 3.4);
      if (state.holding) state.spin += dt * Math.PI * 2 * 1.15;
    } else if (state.spin) {
      const completed = Math.floor(state.spin / (Math.PI * 2));
      if (completed > state.flips) {
        state.coins += (completed - state.flips) * 2;
        state.flips = completed;
      }
      state.spin = 0;
    }
    cart.position.copy(point).addScaledVector(frame.normal, 0.32);
    const basis = new T.Matrix4().makeBasis(frame.side, frame.normal, frame.tangent);
    cart.quaternion.setFromRotationMatrix(basis);
    if (jump) cart.rotateZ(state.spin);

    const cameraTarget = point.clone().addScaledVector(frame.tangent, 7).addScaledVector(frame.normal, 1.4);
    const cameraPosition = point.clone().addScaledVector(frame.tangent, -11).addScaledVector(frame.normal, 5.5).addScaledVector(frame.side, 0.5);
    camera.position.lerp(cameraPosition, 1 - Math.exp(-dt * 4.5));
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
      onHud({ speed: state.speed, coins: state.coins, flips: state.flips, status: state.status });
    }
  };
  state.raf = requestAnimationFrame(animate);

  return {
    start() { state.status = "playing"; state.speed = 6; onHud({ speed: state.speed, coins: state.coins, flips: state.flips, status: state.status }); },
    restart() {
      state.status = "playing"; state.distance = 0; state.speed = 6; state.holding = false;
      state.flips = 0; state.spin = 0; state.coins = 0;
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
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    let world: ReturnType<typeof createWorld> | null = null;
    loadThree().then((T) => {
      if (cancelled || !mountRef.current) return;
      world = createWorld(T, mountRef.current, (v) => {
        setSpeed(Math.round(v.speed * 4));
        setCoins(v.coins);
        setFlips(v.flips);
        setStatus(v.status);
      });
      gameRef.current = world;
    }).catch((e) => setError(e instanceof Error ? e.message : "Unable to start the 3D game"));
    return () => {
      cancelled = true;
      world?.destroy();
      gameRef.current = null;
    };
  }, []);

  const start = () => gameRef.current?.restart();
  const holdStart = () => gameRef.current?.setHolding(true);
  const holdEnd = () => gameRef.current?.setHolding(false);

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
        <div className="loop-rush-game-frame" onPointerDown={holdStart} onPointerUp={holdEnd} onPointerLeave={holdEnd} onContextMenu={(e) => e.preventDefault()}>
          <div ref={mountRef} className="loop-rush-canvas" />
          <div className="loop-rush-hud"><span>⚡ {speed} SPEED</span><span>🟡 {coins} COINS</span><span>↻ {flips} FLIPS</span></div>
          {error && <div className="loop-rush-overlay"><h2>3D ENGINE ERROR</h2><p>{error}</p></div>}
          {status === "ready" && !error && <div className="loop-rush-overlay"><span className="loop-rush-pill">READY?</span><h2>TINY LOOPS</h2><p>Hold the screen or mouse to ride and build speed.</p><button onClick={(e) => { e.stopPropagation(); start(); }}>START RIDE →</button></div>}
          {status === "won" && <div className="loop-rush-overlay"><span className="loop-rush-pill">TRACK CLEARED</span><h2>NICE RIDE!</h2><p>{coins} coins · {flips} flips</p><button onClick={(e) => { e.stopPropagation(); start(); }}>RIDE AGAIN ↻</button></div>}
        </div>
        <div className="loop-rush-controls"><span><i className="loop-rush-dot" /> HOLD TO ACCELERATE / FLIP</span><span>RELEASE TO STOP FLIPPING</span></div>
      </section>
      <footer className="loop-rush-footer">A LITTLE ARCADE FUN BY <b>SHH DESIGN</b></footer>
    </main>
  );
}
