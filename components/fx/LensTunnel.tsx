"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
} from "@react-three/postprocessing";
import type { ChromaticAberrationEffect } from "postprocessing";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * Speed ramp for the fly-through: slow approach, aggressive acceleration
 * inside the dark barrel, smooth deceleration into the new scene.
 */
function speedRamp(t: number) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2;
}

/** Where things live along the optical axis (camera flies toward -Z). */
const TUNNEL = {
  camStart: 5,
  camEnd: -9.7,
  frontGlass: -1.6,
  midGlass: -4.8,
  blades: -7.8,
  sensor: -11.3,
};

type LensTunnelProps = {
  /** Combined scroll progress over hero + lens portal (0 → 1). */
  progress: MotionValue<number>;
};

/**
 * The portal: a real 3D flight through the inside of the lens. The virtual
 * camera's Z position travels down the barrel — past curved refractive glass
 * elements and an aperture iris that dilates open as you reach it — and
 * decelerates onto the sensor, where the next scene (a real photograph)
 * is waiting. Nothing is scaled; the depth is genuine.
 */
export function LensTunnel({ progress }: LensTunnelProps) {
  const [mounted, setMounted] = useState(false);
  const wrapperOpacity = useMotionValue(0);

  // Mount the GL scene only around the dive so the hero stays light.
  useMotionValueEvent(progress, "change", (v) => {
    const shouldMount = v > 0.24 && v < 0.74;
    setMounted((m) => (m === shouldMount ? m : shouldMount));
  });

  if (!mounted) return null;

  return (
    <motion.div
      style={{ opacity: wrapperOpacity }}
      className="pointer-events-none fixed inset-0 z-[35]"
      aria-hidden
    >
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.75]}
        camera={{ fov: 40, position: [0, 0, TUNNEL.camStart], near: 0.05, far: 40 }}
      >
        <TunnelScene progress={progress} wrapperOpacity={wrapperOpacity} />
      </Canvas>
    </motion.div>
  );
}

function TunnelScene({
  progress,
  wrapperOpacity,
}: LensTunnelProps & { wrapperOpacity: MotionValue<number> }) {
  const bladeGroup = useRef<THREE.Group>(null);
  const headlight = useRef<THREE.PointLight>(null);
  const caRef = useRef<ChromaticAberrationEffect>(null);
  const flareRefs = useRef<(THREE.Group | null)[]>([]);
  const lastZ = useRef(TUNNEL.camStart);

  const photo = useLoader(THREE.TextureLoader, "/assets/photography/diablo-03.jpg");

  const blades = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        angle: (i / 9) * Math.PI * 2,
      })),
    []
  );

  useFrame((state) => {
    const P = progress.get();

    // Local flight progress: P 0.40 → 0.64 maps to the full barrel run.
    const q = clamp01((P - 0.4) / 0.24);

    // Visibility: fade in over the 2D camera, fade out onto the DOM photo.
    const fadeIn = smooth(clamp01((P - 0.38) / 0.06));
    const fadeOut = 1 - smooth(clamp01((P - 0.6) / 0.06));
    wrapperOpacity.set(fadeIn * fadeOut);

    // --- TRUE Z TRAVEL with exponential speed ramp (no scaling).
    const ramp = speedRamp(q);
    const z = lerp(TUNNEL.camStart, TUNNEL.camEnd, ramp);
    state.camera.position.z = z;

    // --- DOLLY ZOOM: FOV widens through the barrel for the vertigo pull,
    // settling tighter as we land in the scene.
    const cam = state.camera as THREE.PerspectiveCamera;
    cam.fov = 40 + 16 * q + 32 * Math.pow(Math.sin(Math.PI * q), 2);
    cam.updateProjectionMatrix();

    // Subtle roll through the glass
    state.camera.rotation.z = Math.sin(q * Math.PI * 2) * 0.045;

    // Headlight travels with the camera so the barrel walls read as we pass.
    if (headlight.current) {
      headlight.current.position.z = z - 0.4;
      headlight.current.intensity = 6 + ramp * 10;
    }

    // --- APERTURE IRIS dilates open as the camera reaches it.
    const open = smooth(clamp01((-5.0 - z) / 2.2));
    if (bladeGroup.current) {
      bladeGroup.current.children.forEach((blade, i) => {
        const angle = blades[i].angle;
        const r = lerp(1.0, 2.35, open);
        blade.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0);
        blade.rotation.z = angle + Math.PI / 2 + open * 0.7;
      });
      bladeGroup.current.rotation.z = open * 0.35;
    }

    // --- FLARES pop as the camera crosses each glass element.
    flareRefs.current.forEach((flare) => {
      if (!flare) return;
      const d = Math.abs(z - flare.position.z);
      const k = clamp01(1 - d / 1.3);
      flare.scale.setScalar(0.6 + k * 1.5);
      flare.children.forEach((c) => {
        const mat = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
        mat.opacity = k * 0.8;
      });
    });

    // --- CHROMATIC ABERRATION scales with flight speed.
    const speed = Math.abs(z - lastZ.current);
    lastZ.current = z;
    if (caRef.current) {
      const off = 0.0006 + Math.min(0.006, speed * 0.02);
      caRef.current.offset.set(off, off * 0.6);
    }
  });

  const glassMaterial = (
    <meshPhysicalMaterial
      color="#ffffff"
      transmission={1}
      thickness={0.7}
      roughness={0.06}
      ior={1.46}
      transparent
    />
  );

  return (
    <>
      <ambientLight intensity={0.14} />
      <pointLight ref={headlight} color="#ffe8ea" intensity={6} decay={2} />
      <pointLight color="#ff2244" position={[0, 0, -3]} intensity={14} decay={2} />
      <pointLight color="#ff5a1f" position={[0.6, -0.5, -6.5]} intensity={10} decay={2} />

      {/* Barrel — long open cylinder, seen from inside */}
      <mesh position={[0, 0, -4.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.85, 1.6, 14.5, 64, 1, true]} />
        <meshStandardMaterial
          color="#0d0a0b"
          metalness={0.75}
          roughness={0.38}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Knurled entry rim */}
      <mesh position={[0, 0, 0.4]}>
        <torusGeometry args={[1.86, 0.14, 14, 72]} />
        <meshStandardMaterial color="#171114" metalness={0.5} roughness={0.8} />
      </mesh>

      {/* Red guide rings lighting the path */}
      {[-0.8, -2.4, -4, -5.6, -7.2].map((ringZ, i) => (
        <mesh key={ringZ} position={[0, 0, ringZ]}>
          <torusGeometry args={[i % 2 ? 1.66 : 1.72, 0.016, 10, 72]} />
          <meshStandardMaterial
            color="#e8002d"
            emissive="#e8002d"
            emissiveIntensity={1.6}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Curved glass elements — real refraction via transmission */}
      <mesh position={[0, 0, TUNNEL.frontGlass]} scale={[1, 1, 0.24]}>
        <sphereGeometry args={[1.78, 48, 32]} />
        {glassMaterial}
      </mesh>
      <mesh position={[0, 0, TUNNEL.midGlass]} scale={[1, 1, 0.2]}>
        <sphereGeometry args={[1.55, 48, 32]} />
        {glassMaterial}
      </mesh>

      {/* Flares at each element crossing: core glint + anamorphic streak */}
      {[TUNNEL.frontGlass, TUNNEL.midGlass].map((flareZ, i) => (
        <group
          key={flareZ}
          position={[0, 0, flareZ + 0.1]}
          ref={(el) => {
            flareRefs.current[i] = el;
          }}
        >
          <mesh>
            <circleGeometry args={[0.22, 32]} />
            <meshBasicMaterial
              color="#ff2244"
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh>
            <planeGeometry args={[3.4, 0.05]} />
            <meshBasicMaterial
              color="#ff5a1f"
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}

      {/* Aperture iris — nine blades dilating as you arrive */}
      <group position={[0, 0, TUNNEL.blades]}>
        <mesh>
          <torusGeometry args={[1.7, 0.09, 12, 72]} />
          <meshStandardMaterial color="#171114" metalness={0.6} roughness={0.5} />
        </mesh>
        <group ref={bladeGroup}>
          {blades.map((blade) => (
            <mesh key={blade.angle}>
              <boxGeometry args={[1.7, 0.95, 0.035]} />
              <meshStandardMaterial color="#131013" metalness={0.55} roughness={0.45} />
            </mesh>
          ))}
        </group>
      </group>

      {/* The sensor: the next scene, waiting in the dark */}
      <mesh position={[0, 0, TUNNEL.sensor - 0.05]}>
        <planeGeometry args={[30, 30]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0, 0, TUNNEL.sensor]}>
        <planeGeometry args={[7.2, 4.8]} />
        <meshBasicMaterial
          map={photo}
          map-colorSpace={THREE.SRGBColorSpace}
          map-anisotropy={8}
          toneMapped={false}
        />
      </mesh>
      {/* Sensor frame glow */}
      <mesh position={[0, 0, TUNNEL.sensor + 0.01]}>
        <ringGeometry args={[2.6, 2.66, 64]} />
        <meshBasicMaterial
          color="#ff2244"
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <EffectComposer>
        <Bloom intensity={0.65} luminanceThreshold={0.18} mipmapBlur />
        <ChromaticAberration ref={caRef} offset={[0.0008, 0.0005]} />
      </EffectComposer>
    </>
  );
}
