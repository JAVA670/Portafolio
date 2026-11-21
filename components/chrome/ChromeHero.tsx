"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import {
  ferrofluidFragment,
  ferrofluidVertex,
  particlesFragment,
  particlesVertex,
} from "@/lib/shaders/ferrofluid";

type ChromeHeroProps = {
  /** Hero scroll progress 0..1 — grows the spikes and pushes the camera in. */
  progress: MotionValue<number>;
  /** Freeze on a single still frame (reduced motion). */
  still?: boolean;
};

/**
 * Full-bleed WebGL centerpiece: a raymarched liquid-chrome ferrofluid with
 * a particle field drifting around it. Renders at a reduced pixel ratio
 * (the chrome is all soft reflections, so it holds up) and stops rendering
 * entirely while the hero is off screen.
 */
export function ChromeHero({ progress, still = false }: ChromeHeroProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const io = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting)
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0" aria-hidden>
      <Canvas
        dpr={mobile ? 0.5 : 0.72}
        frameloop={still || !visible ? "demand" : "always"}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        camera={{ fov: 36, position: [0, 0, 3.6], near: 0.1, far: 30 }}
      >
        <ChromeScene progress={progress} still={still} mobile={mobile} />
      </Canvas>
    </div>
  );
}

/** Deterministic PRNG so the particle field is pure and identical per load. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PARTICLE_COUNT = 2600;

function buildParticles() {
  const rand = mulberry32(670);
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const seeds = new Float32Array(PARTICLE_COUNT);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Shell between r=1.3 and r=6, flattened slightly so it frames the form
    const r = 1.3 + Math.pow(rand(), 0.7) * 4.7;
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi) * 0.7;
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 1;
    seeds[i] = rand();
  }
  return { positions, seeds };
}

const PARTICLES = buildParticles();

function ChromeScene({
  progress,
  still,
  mobile,
}: ChromeHeroProps & { mobile: boolean }) {
  const quadMat = useRef<THREE.ShaderMaterial>(null);
  const particleMat = useRef<THREE.ShaderMaterial>(null);
  const mouse = useRef(new THREE.Vector2());
  const target = useRef(new THREE.Vector2());

  const quadUniforms = useMemo(
    () => ({
      uTime: { value: 8 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2() },
      uScroll: { value: 0 },
      uOffset: { value: 0 },
      uDist: { value: 3.6 },
    }),
    []
  );
  const particleUniforms = useMemo(
    () => ({
      uTime: { value: 8 },
      uPixelRatio: { value: 1 },
      uScroll: { value: 0 },
    }),
    []
  );

  useEffect(() => {
    if (still) return;
    const onMove = (e: PointerEvent) => {
      target.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1)
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [still]);

  useFrame((state) => {
    const q = quadMat.current;
    const pm = particleMat.current;
    if (!q || !pm) return;

    const time = still ? 8 : 8 + state.clock.elapsedTime;
    const scroll = progress.get();
    mouse.current.lerp(target.current, 0.045);

    const { width, height } = state.size;
    const dpr = state.viewport.dpr;
    q.uniforms.uTime.value = time;
    q.uniforms.uRes.value.set(width * dpr, height * dpr);
    q.uniforms.uMouse.value.copy(mouse.current);
    q.uniforms.uScroll.value = scroll;
    // Desktop: the form sits right of center, opposite the type block.
    q.uniforms.uOffset.value = mobile ? 0 : 0.34;
    q.uniforms.uDist.value = mobile ? 5.4 : 3.6;

    pm.uniforms.uTime.value = time;
    pm.uniforms.uPixelRatio.value = dpr * 2;
    pm.uniforms.uScroll.value = scroll;

    // Keep the particle camera aligned with the raymarch camera.
    const cam = state.camera;
    cam.position.z = (mobile ? 5.4 : 3.6) - scroll * 1.2;
    cam.position.x = mobile ? 0 : -0.34 * (cam.position.z / 1.54);
    cam.lookAt(cam.position.x, 0, 0);
  });

  return (
    <>
      <mesh frustumCulled={false} renderOrder={-1}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={quadMat}
          vertexShader={ferrofluidVertex}
          fragmentShader={ferrofluidFragment}
          uniforms={quadUniforms}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[PARTICLES.positions, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[PARTICLES.seeds, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={particleMat}
          vertexShader={particlesVertex}
          fragmentShader={particlesFragment}
          uniforms={particleUniforms}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}
