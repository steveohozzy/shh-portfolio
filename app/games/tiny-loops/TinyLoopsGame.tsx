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
  const hillSections: Array<{ start: number; crest: number; end: number }> = [];
  const add = (p: any) => points.push(p.clone());
  const line = (to: any, steps = 24) => {
    const from = points[points.length - 1];
    for (let i = 1; i <= steps; i++) add(from.clone().lerp(to, i / steps));
  };
  const hill = (to: any, height: number, steps = 64, launchable = true) => {
    const from = points[points.length - 1];
    const startIndex = points.length - 1;
    let crestIndex = -1;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      // Make a recognisable take-off ramp: a long climb followed by a short
      // brow and a steeper drop. The launch point is the actual high point.
      // A straight, clearly visible incline to a defined brow, followed
      // by a steep drop into the section hidden by the jump gap.
      const rampProfile = launchable
        ? (t <= 0.46 ? t / 0.46 : Math.max(0, 1 - (t - 0.46) / 0.54))
        : Math.sin(Math.PI * t);
      // Exaggerate the actual path elevation so the take-off face is steep
      // and unmistakable in the chase camera, with a real downhill landing.
      add(from.clone().lerp(to, t).add(new T.Vector3(0, rampProfile * (launchable ? Math.max(height, 17) : height), 0)));
      if (launchable && i === Math.round(steps * 0.46)) crestIndex = points.length - 1;
    }
    if (launchable && crestIndex >= 0) hillSections.push({ start: startIndex, crest: crestIndex, end: points.length - 1 });
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

  // Level 1 finish section.
  bend(new T.Vector3(-10, 5, -396), new T.Vector3(-18, 3, -420), 64);
  hill(new T.Vector3(-12, 0, -468), 5, 72, true);
  bend(new T.Vector3(4, 0, -492), new T.Vector3(18, 0, -516), 64);
  line(new T.Vector3(18, 0, -555), 55);

  // Level 2: a longer twisting section with two sharper take-off hills.
  bend(new T.Vector3(42, 2, -590), new T.Vector3(55, 5, -625), 72);
  hill(new T.Vector3(30, 5, -685), 10, 84, true);
  bend(new T.Vector3(-2, 8, -712), new T.Vector3(-28, 8, -748), 72);
  hill(new T.Vector3(-48, 3, -812), 8, 80, true);
  bend(new T.Vector3(-12, 1, -845), new T.Vector3(22, 1, -875), 72);
  line(new T.Vector3(35, 1, -910), 42);

  // Level 3: bigger hills, a fast S-bend and a final long jump.
  bend(new T.Vector3(70, 4, -945), new T.Vector3(72, 8, -985), 76);
  hill(new T.Vector3(22, 8, -1055), 12, 90, true);
  bend(new T.Vector3(-18, 11, -1080), new T.Vector3(-42, 6, -1120), 76);
  hill(new T.Vector3(-12, 2, -1190), 11, 90, true);
  bend(new T.Vector3(35, 4, -1220), new T.Vector3(52, 4, -1260), 76);
  hill(new T.Vector3(0, 0, -1335), 13, 96, true);
  line(new T.Vector3(0, 0, -1400), 64);

  const curve = new T.CatmullRomCurve3(points, false, "centripetal", 0.15);
  curve.arcLengthDivisions = 3000;
  curve.updateArcLengths();
  const sampledLengths = curve.getLengths(curve.arcLengthDivisions);
  const distanceAtPoint = (pointIndex: number) => {
    // Convert each hill landmark from its control-point index to travelled distance.
    const parameter = (pointIndex / (points.length - 1)) * curve.arcLengthDivisions;
    const lower = Math.floor(parameter);
    const upper = Math.min(curve.arcLengthDivisions, lower + 1);
    const fraction = parameter - lower;
    return sampledLengths[lower] + (sampledLengths[upper] - sampledLengths[lower]) * fraction;
  };
  (curve as any).hillSections = hillSections.map(({ start, crest, end }) => ({
    start: distanceAtPoint(start),
    crest: distanceAtPoint(crest),
    end: distanceAtPoint(end),
  }));
  (curve as any).hillCrestDistances = (curve as any).hillSections.map((section: any) => section.crest);
  return curve;
}
function createWorld(T: any, mount: HTMLDivElement, onHud: (v: { speed: number; coins: number; flips: number; status: GameStatus; airborne?: boolean; holding?: boolean; level?: number; landed?: boolean; landedFlips?: number }) => void) {
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
    // Keep the cart upright through bends. Frenet normals can roll around a
    // twisting curve and look exactly like an unrequested backflip.
    const forward = new T.Vector3(tangent.x, 0, tangent.z).normalize();
    if (forward.lengthSq() < 0.0001) forward.set(0, 0, -1);
    const side = new T.Vector3().crossVectors(forward, worldUp).normalize();
    return { tangent, normal: worldUp, side, forward };
  };

  // Every launch has a visible rising ramp, a real rail/sleeper gap, and a
  // separate landing section. Only these exact ramp brows can trigger flight.
  const hillSections: Array<{ start: number; crest: number; end: number }> = (course as any).hillSections;
  const jumpTriggers: number[] = hillSections.map((section) => section.crest);
  // Keep the missing section short enough that the cart lands on the
  // descending face of the hill, not on a flat section beyond it.
  const jumpGapLength = 16;
  const jumpGaps = jumpTriggers.map((crest) => [crest, Math.min(length - 3, crest + jumpGapLength)]);

  // Build the take-off and landing ramps from solid, individually aligned
  // track sections. The open space between them is deliberately left empty.
  const rampMaterial = new T.MeshStandardMaterial({ color: 0xffc51e, roughness: 0.72 });
  const rampGeometry = new T.BoxGeometry(2.65, 0.42, 2.15);
  const addRampDeck = (from: number, to: number) => {
    const count = Math.max(4, Math.ceil((to - from) / 1.8));
    for (let i = 0; i < count; i++) {
      const d0 = from + ((to - from) * i) / count;
      const d1 = from + ((to - from) * (i + 1)) / count;
      const mid = (d0 + d1) / 2;
      const u = course.getUtoTmapping(0, mid);
      const p = course.getPointAt(u);
      // The cart stays upright, but the physical track deck follows the true 3D slope.
      const tangent = course.getTangentAt(u).normalize();
      const worldUp = new T.Vector3(0, 1, 0);
      const side = new T.Vector3().crossVectors(tangent, worldUp).normalize();
      if (side.lengthSq() < 0.0001) side.set(1, 0, 0);
      const up = new T.Vector3().crossVectors(side, tangent).normalize();
      const deck = new T.Mesh(rampGeometry, rampMaterial);
      deck.position.copy(p).addScaledVector(up, 0.04);
      deck.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(
        side.clone().negate(), up, tangent
      ));
      deck.scale.z = Math.max(1, d1 - d0 + 0.35);
      deck.castShadow = true;
      deck.receiveShadow = true;
      trackGroup.add(deck);
    }
  };
  hillSections.forEach(({ start, crest, end }) => {
    const landing = Math.min(length - 1, crest + jumpGapLength);
    // Solid yellow track follows the full uphill face to the launch lip,
    // then resumes after the gap and follows the descending landing face.
    addRampDeck(start, crest);
    addRampDeck(landing, end);
  });
  const isInJumpGap = (distance: number) => jumpGaps.some(([from, to]) => distance >= from && distance <= to);
  // The solid yellow ramp deck is the running surface on the hill. Do not
  // place flat sleepers over it or they visually flatten the take-off slope.
  const isOnRampDeck = (distance: number) => hillSections.some(({ start, crest, end }) => {
    const landing = crest + jumpGapLength;
    return (distance >= start && distance <= crest) || (distance >= landing && distance <= end);
  });
  const railRanges: number[][] = [];
  let railCursor = 0;
  jumpGaps.forEach(([from, to]) => {
    if (from > railCursor) railRanges.push([railCursor, from]);
    railCursor = Math.max(railCursor, to);
  });
  if (railCursor < length) railRanges.push([railCursor, length]);
  [-0.72, 0.72].forEach((offset) => {
    railRanges.forEach(([from, to]) => {
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
  for (let i = 0; i < 760; i++) {
    const d = (length * i) / 759;
    if (isInJumpGap(d) || isOnRampDeck(d)) continue;
    const u = course.getUtoTmapping(0, d);
    const p = course.getPointAt(u);
    const f = frameAt(Math.min(segments, Math.round(u * segments)));
    const matrix = new T.Matrix4().makeBasis(f.side.clone().negate(), f.normal, f.forward);
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
    [42, -8, -650, 35, 5, 38], [-45, -8, -790, 34, 5, 42],
    [20, -9, -900, 38, 5, 42], [65, -8, -980, 40, 5, 44],
    [-42, -8, -1110, 38, 5, 44], [0, -9, -1300, 42, 5, 48],
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
  const eyeMaterial = new T.MeshStandardMaterial({ color: 0x263247, roughness: 1 });
  [-0.13, 0.13].forEach((x) => {
    const eye = new T.Mesh(new T.SphereGeometry(0.045, 8, 8), eyeMaterial);
    eye.position.set(x, 0.88, -0.535);
    cart.add(eye);
  });
  const riderBody = new T.Mesh(new T.CapsuleGeometry(0.25, 0.48, 4, 8), new T.MeshStandardMaterial({ color: 0x2e6ec8, roughness: 0.95 }));
  riderBody.position.set(0, 0.55, 0.03);
  riderBody.castShadow = true;
  cart.add(riderBody);

  // Long, visible cartoon arms on pivots so they can flap independently.
  const armMaterial = new T.MeshStandardMaterial({ color: 0x2e6ec8, roughness: 0.95 });
  const leftArm = new T.Group();
  const rightArm = new T.Group();
  [-1, 1].forEach((side) => {
    const pivot = side < 0 ? leftArm : rightArm;
    pivot.position.set(side * 0.24, 0.68, -0.02);
    const upperArm = new T.Mesh(new T.CapsuleGeometry(0.105, 0.48, 4, 8), armMaterial);
    upperArm.position.set(side * 0.23, -0.23, 0);
    upperArm.rotation.z = side * -0.35;
    pivot.add(upperArm);
    const hand = new T.Mesh(new T.SphereGeometry(0.13, 10, 8), new T.MeshStandardMaterial({ color: 0xffd65a, roughness: 0.9 }));
    hand.position.set(side * 0.34, -0.48, 0);
    pivot.add(hand);
    cart.add(pivot);
  });
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

  const state = { status: "ready" as GameStatus, distance: 0, speed: 0, holding: false, flips: 0, spin: 0, coins: 0, airborne: false, airHeight: 0, takeoffY: 0, airElapsed: 0, activeJumpEnd: 0, jumpDuration: 0.9, jumpHeight: 5, landedUntil: 0, landedFlips: 0, elapsed: 0, lastTime: performance.now(), raf: 0 };
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
      // Acceleration is for the run-up; in the air, hold controls the flip only.
      if (!state.airborne) {
        state.speed = Math.min(54, state.speed + (state.holding ? 42 : -8) * dt);
        state.speed = Math.max(0, state.speed);
      }
      state.distance += state.speed * dt;
      if (!state.airborne) {
        // Trigger from the hill's actual brow. Use an inclusive crossing so a
        // frame landing exactly on the crest cannot miss the launch.
        const launch = jumpTriggers.find((crest) => previousDistance <= crest && state.distance >= crest && state.speed >= 8);
        if (launch !== undefined) {
          state.distance = launch;
          state.airborne = true;
          state.airHeight = 0;
          state.airElapsed = 0;
          // Land at the far side of the actual visible track gap.
          // The gap is fixed in course distance so the cart cannot land short
          // or keep flying over the landing section at higher speeds.
          state.activeJumpEnd = Math.min(length - 2, launch + jumpGapLength);
          state.jumpDuration = Math.max(0.48, jumpGapLength / Math.max(1, state.speed));
          state.jumpHeight = 7 + state.speed * 0.12;
          const takeoffPoint = course.getPointAt(course.getUtoTmapping(0, launch));
          state.takeoffY = takeoffPoint.y;
          state.spin = 0;
        }
      }
      if (state.distance >= length - 3) {
        state.status = "won";
        onHud({ speed: state.speed, coins: state.coins, flips: state.flips, status: state.status, level: 3 });
      }
    }

    // A predictable jump arc: the cart follows the track and rises above it.
    // Holding during the arc rotates the cart; releasing immediately stops the flip.
    if (state.airborne) {
      state.airElapsed += dt;
      const progress = Math.min(1, state.airElapsed / state.jumpDuration);
      // Fly from the exact hilltop take-off point to the landing point.
      // Do not let the descending track pull the cart down before its jump arc ends.
      state.airHeight = Math.sin(progress * Math.PI) * state.jumpHeight;
      if (state.holding) state.spin += dt * Math.PI * 2 * (2.5 + state.speed / 30);
      if (progress >= 1) {
        state.airHeight = 0;
        state.airborne = false;
        // Snap to the far-side landing track, not an arbitrary point on the
        // middle of the hill. The gap ends exactly at activeJumpEnd.
        state.distance = state.activeJumpEnd;
        const completed = Math.floor(state.spin / (Math.PI * 2));
        const landingAngle = Math.abs(Math.atan2(Math.sin(state.spin), Math.cos(state.spin)));
        // Count complete rotations and allow a broad landing window. A clean
        // touchdown is shown explicitly instead of silently returning to play.
        if (landingAngle > 2.35) {
          state.status = "crashed";
          state.speed = 0;
        } else {
          state.landedUntil = now + 1100;
          state.landedFlips = completed;
          if (completed > 0) {
            state.coins += completed * 2;
            state.flips += completed;
          }
        }
        state.spin = 0;
      }
    }

    const distance = Math.min(state.distance, length - 0.1);
    const u = course.getUtoTmapping(0, distance);
    const point = course.getPointAt(u);
    const index = Math.min(segments, Math.round(u * segments));
    const frame = frameAt(index);
    if (state.airborne) {
      const progress = Math.min(1, state.airElapsed / state.jumpDuration);
      // Blend towards the track's actual height at the current distance so
      // the wheels meet the landing track exactly as the jump finishes.
      point.y = state.takeoffY + (point.y - state.takeoffY) * progress + Math.sin(progress * Math.PI) * state.jumpHeight;
    }
    cart.position.copy(point).addScaledVector(frame.normal, 0.25);
    const basis = new T.Matrix4().makeBasis(frame.side.clone().negate(), frame.normal, frame.forward);
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

    // The rider throws both arms around in the air, with extra frantic movement
    // while the player is holding to perform flips.
    if (leftArm && rightArm) {
      const armSwing = state.airborne
        ? Math.sin(state.airElapsed * 17) * (state.holding ? 1.05 : 0.72)
        : Math.sin(now * 0.004) * 0.06;
      leftArm.rotation.z = -0.25 - armSwing;
      rightArm.rotation.z = 0.25 + armSwing;
      leftArm.rotation.x = state.airborne ? Math.sin(state.airElapsed * 13) * 0.28 : 0;
      rightArm.rotation.x = state.airborne ? -Math.sin(state.airElapsed * 13) * 0.28 : 0;
    }

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
      const level = state.distance < length / 3 ? 1 : state.distance < (length * 2) / 3 ? 2 : 3;
      onHud({ speed: state.speed, coins: state.coins, flips: state.flips, status: state.status, airborne: state.airborne, holding: state.holding, level, landed: now < state.landedUntil, landedFlips: state.landedFlips });
    }
  };
  state.raf = requestAnimationFrame(animate);

  const resetRun = () => {
    state.status = "playing";
    state.distance = 0;
    state.speed = 18;
    state.holding = false;
    state.flips = 0;
    state.spin = 0;
    state.coins = 0;
    state.airborne = false;
    state.airHeight = 0;
    state.takeoffY = 0;
    state.airElapsed = 0;
    state.activeJumpEnd = 0;
    state.jumpDuration = 1.0;
    state.jumpHeight = 9;
    state.lastTime = performance.now();
    coins.forEach((coin) => { coin.collected = false; coin.mesh.visible = true; });
    onHud({ speed: state.speed, coins: 0, flips: 0, status: "playing", airborne: false, holding: false, level: 1 });
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
  const [landed, setLanded] = useState(false);
  const [landedFlips, setLandedFlips] = useState(0);
  const [level, setLevel] = useState(1);
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
        setLanded(Boolean(v.landed));
        setLandedFlips(v.landedFlips || 0);
        setLevel(v.level || 1);
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
          <div className="loop-rush-level"><span>LEVEL 0{level}</span><b>{level === 1 ? "First Run" : level === 2 ? "Twisting Heights" : "Big Air Finale"}</b></div>
        </div>
        <div className="loop-rush-game-frame" onPointerDown={holdStart} onPointerUp={holdEnd} onPointerCancel={holdEnd} onLostPointerCapture={holdEnd} onContextMenu={(e) => e.preventDefault()}>
          <div ref={mountRef} className="loop-rush-canvas" />
          <div className="loop-rush-hud"><span>⚡ {speed} SPEED</span><span>🟡 {coins} COINS</span><span>↻ {flips} FLIPS</span><strong className="loop-rush-air-status">{airborne ? "AIRBORNE — HOLD TO FLIP!" : landed ? (landedFlips > 0 ? `LANDED! +${landedFlips} FLIPS` : "LANDED!") : "HOLD TO ACCELERATE"}</strong></div>
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
