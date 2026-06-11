"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { motion, useMotionValue, type MotionValue } from "framer-motion";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);

type SharedCamera3DProps = {
  /** Combined scroll progress over hero + lens portal (0 → 1). */
  progress: MotionValue<number>;
};

/**
 * The one camera of the opening act, in real 3D. It orbits the brand name in
 * perspective space — lens aimed at the title, so you see its back when it
 * crosses in front and its glass when it swings behind — strobe-popping as
 * it shoots. Scrolling pulls it out of orbit, turns it to face you, and
 * flies it through the viewport until its lens becomes the portal.
 */
export function SharedCamera3D({ progress }: SharedCamera3DProps) {
  const [mounted, setMounted] = useState(false);
  const wrapperOpacity = useMotionValue(0);
  const flash = useMotionValue(0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Full-screen spill of the strobe pop */}
      <motion.div
        style={{ opacity: flash }}
        className="pointer-events-none fixed inset-0 z-[14] bg-strobe/20 mix-blend-screen"
        aria-hidden
      />
      <motion.div
        style={{ opacity: wrapperOpacity }}
        className="pointer-events-none fixed inset-0 z-[15]"
        aria-hidden
      >
        <Canvas
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          camera={{ fov: 35, position: [0, 0, 9] }}
        >
          <fog attach="fog" args={["#000000", 8.5, 17]} />
          <ambientLight intensity={0.3} />
          {/* Blood key light + ember fill + white specular for the glass */}
          <pointLight color="#ff2244" position={[5, 3, 4]} intensity={90} decay={2} />
          <pointLight color="#ff5a1f" position={[-5, -2.5, 2]} intensity={40} decay={2} />
          <spotLight color="#ffffff" position={[0, 6, 9]} angle={0.5} intensity={120} decay={2} />
          <CameraRig progress={progress} flash={flash} wrapperOpacity={wrapperOpacity} />
        </Canvas>
      </motion.div>
    </>
  );
}

function CameraRig({
  progress,
  flash,
  wrapperOpacity,
}: SharedCamera3DProps & {
  flash: MotionValue<number>;
  wrapperOpacity: MotionValue<number>;
}) {
  const group = useRef<THREE.Group>(null);
  const strobeLight = useRef<THREE.PointLight>(null);
  const recMat = useRef<THREE.MeshStandardMaterial>(null);
  const ringMat = useRef<THREE.MeshStandardMaterial>(null);

  const { dummy, orbitQ, faceQ } = useMemo(
    () => ({
      dummy: new THREE.Object3D(),
      orbitQ: new THREE.Quaternion(),
      faceQ: new THREE.Quaternion(),
    }),
    []
  );

  useFrame((state) => {
    const g = group.current;
    if (!g) return;

    const P = progress.get();
    const tSec = state.clock.elapsedTime;

    if (P > 0.66) {
      wrapperOpacity.set(0);
      flash.set(0);
      return;
    }

    // --- ORBIT: true 3D ellipse around the title (origin), drifting in Z.
    const theta = tSec * 0.5;
    const ox = Math.sin(theta) * 4.8;
    const oz = Math.cos(theta) * 3.2;
    const oy = Math.sin(tSec * 0.8) * 0.4 - 0.1;

    // --- DESCENT: scroll dissolves the orbit into dead center.
    const blend = ease(clamp01((P - 0.12) / 0.18));

    // --- APPROACH + THROUGH: fly at the viewer until the lens swallows the frame.
    const zoom = clamp01((P - 0.42) / 0.16);
    const tz = lerp(2.0, 8.45, zoom * zoom);

    g.position.set(lerp(ox, 0, blend), lerp(oy, 0, blend), lerp(oz, tz, blend));

    // Bigger presence: full scale in orbit, growing on approach.
    const s = 1.55 * lerp(1, 1.3, ease(clamp01((P - 0.3) / 0.12)));
    g.scale.setScalar(s);

    // Rotation: lens tracks the title while orbiting (you see its back when
    // it crosses in front), then slerps to face the viewer for the dive.
    dummy.position.copy(g.position);
    dummy.lookAt(0, 0.1, 0);
    orbitQ.copy(dummy.quaternion);
    dummy.lookAt(state.camera.position);
    faceQ.copy(dummy.quaternion);
    g.quaternion.copy(orbitQ.slerp(faceQ, blend));
    // Banking roll into the turns
    g.rotateZ(Math.sin(theta + 0.6) * 0.1 * (1 - blend));

    // Entrance after the preloader, exit through the glass.
    const intro = clamp01((tSec - 1.1) / 0.8);
    const exit = 1 - clamp01((P - 0.555) / 0.05);
    wrapperOpacity.set(intro * exit);

    // Strobe pop every 2.6s while shooting the name.
    const cycle = (tSec * 1000) % 2600;
    const pop = cycle < 150 ? 1 - cycle / 150 : 0;
    const shooting = pop * (1 - blend) * intro;
    flash.set(shooting);
    if (strobeLight.current) strobeLight.current.intensity = shooting * 260;

    // REC tally blink + red ring pulse
    if (recMat.current) {
      recMat.current.emissiveIntensity = Math.sin(tSec * 6) > 0 ? 2.4 : 0.25;
    }
    if (ringMat.current) {
      ringMat.current.emissiveIntensity = 1.8 + Math.sin(tSec * 2.2) * 0.7;
    }
  });

  const bodyMat = { color: "#141014", metalness: 0.55, roughness: 0.42 };
  const darkMat = { color: "#0b0809", metalness: 0.5, roughness: 0.5 };

  return (
    <group ref={group}>
      {/* Strobe source sitting at the flash hotshoe */}
      <pointLight ref={strobeLight} color="#ffffff" position={[0.1, 1.7, 0.6]} intensity={0} decay={2} />

      {/* Body */}
      <RoundedBox args={[3.6, 2.3, 1.3]} radius={0.18} smoothness={4}>
        <meshStandardMaterial {...bodyMat} />
      </RoundedBox>

      {/* Grip */}
      <RoundedBox args={[0.85, 2.1, 1.5]} radius={0.2} smoothness={4} position={[-1.5, -0.06, 0.06]}>
        <meshStandardMaterial {...darkMat} />
      </RoundedBox>

      {/* Viewfinder hump + eyepiece */}
      <RoundedBox args={[1.25, 0.6, 1]} radius={0.12} smoothness={4} position={[0.1, 1.32, -0.08]}>
        <meshStandardMaterial {...bodyMat} />
      </RoundedBox>
      <mesh position={[0.1, 1.3, -0.56]}>
        <boxGeometry args={[0.55, 0.32, 0.06]} />
        <meshStandardMaterial color="#020202" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Mode dial + shutter with red cap */}
      <mesh position={[1.25, 1.28, 0.18]}>
        <cylinderGeometry args={[0.3, 0.3, 0.22, 24]} />
        <meshStandardMaterial color="#0e0a0c" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[-1.05, 1.26, 0.32]}>
        <cylinderGeometry args={[0.16, 0.16, 0.14, 20]} />
        <meshStandardMaterial color="#e8002d" emissive="#e8002d" emissiveIntensity={0.8} roughness={0.3} />
      </mesh>

      {/* REC tally */}
      <mesh position={[1.45, 0.95, 0.68]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial ref={recMat} color="#e8002d" emissive="#e8002d" emissiveIntensity={2} />
      </mesh>

      {/* Red rim strip on the grip edge */}
      <mesh position={[-1.92, 0, 0.4]}>
        <boxGeometry args={[0.05, 2.05, 0.05]} />
        <meshStandardMaterial color="#e8002d" emissive="#e8002d" emissiveIntensity={1.6} />
      </mesh>

      {/* Lens assembly, pointing +Z */}
      <group position={[0.15, 0, 0.95]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.98, 0.92, 1.25, 48]} />
          <meshStandardMaterial color="#0c090b" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Knurled focus ring */}
        <mesh position={[0, 0, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.99, 0.08, 12, 64]} />
          <meshStandardMaterial color="#171114" metalness={0.4} roughness={0.85} />
        </mesh>
        {/* Blood accent ring */}
        <mesh position={[0, 0, 0.52]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.93, 0.025, 10, 64]} />
          <meshStandardMaterial ref={ringMat} color="#e8002d" emissive="#e8002d" emissiveIntensity={2} />
        </mesh>
        {/* Front glass — deep, with clearcoat glints */}
        <mesh position={[0, 0, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.82, 0.82, 0.08, 48]} />
          <meshPhysicalMaterial
            color="#0a0407"
            metalness={0.9}
            roughness={0.06}
            clearcoat={1}
            clearcoatRoughness={0.08}
          />
        </mesh>
        {/* Inner element — faint red iris at the core */}
        <mesh position={[0, 0, 0.66]}>
          <circleGeometry args={[0.46, 40]} />
          <meshStandardMaterial color="#1c060c" emissive="#3a0a14" emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[0, 0, 0.67]}>
          <ringGeometry args={[0.2, 0.24, 40]} />
          <meshStandardMaterial color="#e8002d" emissive="#e8002d" emissiveIntensity={1.4} />
        </mesh>
      </group>
    </group>
  );
}
