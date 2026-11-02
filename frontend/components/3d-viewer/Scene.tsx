
"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";

function CellModel() {
  return (
    <group>
      {/* Outer cell membrane */}
      <mesh scale={[1.5, 1.1, 1.1]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhysicalMaterial
          color="#55dfbd"
          transparent
          opacity={0.22}
          roughness={0.2}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Nucleus */}
      <mesh position={[0, 0, 0]} scale={0.48}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial
          color="#9d83ed"
          roughness={0.3}
        />
      </mesh>

      {/* Nucleolus */}
      <mesh position={[0.12, 0.12, 0.38]} scale={0.15}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#f5a6cf" />
      </mesh>

      {/* Mitochondria 1 */}
      <mesh
        position={[0.85, 0.35, 0.15]}
        rotation={[0.5, 0.3, 0.8]}
        scale={[0.35, 0.16, 0.16]}
      >
        <torusGeometry args={[0.7, 0.3, 16, 48]} />
        <meshStandardMaterial color="#ed9b58" />
      </mesh>

      {/* Mitochondria 2 */}
      <mesh
        position={[-0.85, -0.3, 0.1]}
        rotation={[0.8, 0.4, -0.5]}
        scale={[0.3, 0.15, 0.15]}
      >
        <torusGeometry args={[0.7, 0.3, 16, 48]} />
        <meshStandardMaterial color="#ed9b58" />
      </mesh>

      {/* Small vesicles */}
      <mesh position={[-0.5, 0.65, 0.3]} scale={0.12}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color="#f0cf78" />
      </mesh>

      <mesh position={[0.45, -0.65, 0.35]} scale={0.1}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color="#f0cf78" />
      </mesh>

      <mesh position={[0.9, -0.5, -0.3]} scale={0.13}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color="#f0cf78" />
      </mesh>
    </group>
  );
}

export default function Scene() {
  return (
    <div className="h-full w-full">
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 45,
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
        }}
      >
        <color attach="background" args={["#101827"]} />

        <ambientLight intensity={1.5} />

        <directionalLight
          position={[5, 5, 5]}
          intensity={2}
        />

        <pointLight
          position={[-4, -3, -3]}
          intensity={1}
          color="#55dfbd"
        />

        <Suspense fallback={null}>
          <CellModel />
        </Suspense>

        <OrbitControls
          enableRotate
          enableZoom
          enablePan
          enableDamping
          dampingFactor={0.08}
          minDistance={2.5}
          maxDistance={9}
        />
      </Canvas>
    </div>
  );
}
