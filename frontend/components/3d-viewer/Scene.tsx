
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Sparkles, useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface SceneProps {
  modelUrl: string;
}

interface HeartModelProps {
  modelUrl: string;
  selectedName: string | null;
  explodeAmount: number;
  onSelect: (name: string) => void;
}

interface ExplodablePart {
  object: THREE.Mesh;
  originalPosition: THREE.Vector3;
  direction: THREE.Vector3;
}

function HeartModel({
  modelUrl,
  selectedName,
  explodeAmount,
  onSelect,
}: HeartModelProps) {
  const { scene } = useGLTF(modelUrl);

  const model = useMemo(() => {
    const clonedScene = scene.clone(true);

    clonedScene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;

        if (Array.isArray(object.material)) {
          object.material = object.material.map((material) =>
            material.clone()
          );
        } else {
          object.material = object.material.clone();
        }
      }
    });

    return clonedScene;
  }, [scene]);

  // Calculate the model's original size and centre.
  const { scale, position } = useMemo(() => {
    const bounds = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    bounds.getSize(size);
    bounds.getCenter(center);

    const largestDimension = Math.max(size.x, size.y, size.z);
    const calculatedScale =
      largestDimension > 0 ? 3.2 / largestDimension : 1;

    return {
      scale: calculatedScale,
      position: [
        -center.x * calculatedScale,
        -center.y * calculatedScale,
        -center.z * calculatedScale,
      ] as [number, number, number],
    };
  }, [model]);

  // Store the original position and explosion direction of each mesh.
  const parts = useMemo<ExplodablePart[]>(() => {
    model.updateMatrixWorld(true);

    const bounds = new THREE.Box3().setFromObject(model);
    const modelCenter = new THREE.Vector3();
    bounds.getCenter(modelCenter);

    const result: ExplodablePart[] = [];

    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      const meshBounds = new THREE.Box3().setFromObject(object);
      const meshCenter = new THREE.Vector3();
      meshBounds.getCenter(meshCenter);

      const direction = meshCenter.sub(modelCenter);

      if (direction.lengthSq() < 0.000001) {
        direction.set(0, 1, 0);
      } else {
        direction.normalize();
      }

      result.push({
        object,
        originalPosition: object.position.clone(),
        direction,
      });
    });

    return result;
  }, [model]);

  // Move meshes when the explosion slider changes.
  useEffect(() => {
    const maximumDistance = 1.1;

    parts.forEach((part) => {
      part.object.position.copy(part.originalPosition);

      part.object.position.addScaledVector(
        part.direction,
        maximumDistance * explodeAmount
      );
    });

    model.updateMatrixWorld(true);
  }, [parts, explodeAmount, model]);

  // Preserve selection highlighting.
  useEffect(() => {
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      materials.forEach((material) => {
        if ("emissive" in material) {
          const standardMaterial =
            material as THREE.MeshStandardMaterial;

          if (object.name === selectedName) {
            standardMaterial.emissive.set("#32d6a0");
            standardMaterial.emissiveIntensity = 0.65;
          } else {
            standardMaterial.emissive.set("#000000");
            standardMaterial.emissiveIntensity = 0;
          }
        }
      });
    });
  }, [model, selectedName]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();

    const clickedObject = event.object;

    console.log("Clicked object:", clickedObject.name);
    console.log("Object type:", clickedObject.type);

    onSelect(clickedObject.name || "Unnamed mesh");
  };

  return (
    <primitive
      object={model}
      scale={scale}
      position={position}
      onClick={handleClick}
    />
  );
}

function ModelLoading() {
  return (
    <mesh>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshBasicMaterial color="#4df2c8" wireframe />
    </mesh>
  );
}

export default function Scene({ modelUrl }: SceneProps) {
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [explodeAmount, setExplodeAmount] = useState(0);

  const isExploded = explodeAmount > 0;

  return (
    <div className="relative h-full w-full">
      <Canvas
        key={modelUrl}
        camera={{ position: [0, 0, 5], fov: 45, near: 0.1, far: 100 }}
        shadows
        gl={{ alpha: true }}
        style={{ background: "transparent" }}
        onPointerMissed={() => setSelectedName(null)}
      >
        <ambientLight intensity={1.5} />

        <directionalLight
          position={[5, 8, 5]}
          intensity={2}
          castShadow
        />

        <directionalLight position={[-5, 2, -5]} intensity={0.8} />

        <pointLight
          position={[-4, -2, 3]}
          intensity={6}
          color="#8b7bff"
        />

        <pointLight
          position={[4, 3, -3]}
          intensity={5}
          color="#4df2c8"
        />

        <Sparkles
          count={70}
          scale={[7, 5, 7]}
          size={2.4}
          speed={0.35}
          opacity={0.7}
          color="#4df2c8"
        />

        <Sparkles
          count={30}
          scale={[8, 6, 8]}
          size={3.2}
          speed={0.25}
          opacity={0.5}
          color="#8b7bff"
        />

        <Suspense fallback={<ModelLoading />}>
          <HeartModel
            modelUrl={modelUrl}
            selectedName={selectedName}
            explodeAmount={explodeAmount}
            onSelect={setSelectedName}
          />
        </Suspense>

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          enablePan
          enableZoom
          enableRotate
          minDistance={2.5}
          maxDistance={12}
        />
      </Canvas>

      {/* Combined selected structure and exploded view panel */}
      <div className="absolute left-8 top-8 z-10 w-72 max-w-[calc(100%-4rem)] overflow-hidden rounded-xl border border-[#4df2c8]/20 bg-[#0b1424]/85 p-4 text-white shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-md">

        <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4df2c8] to-transparent" />

        {/* Selected structure information */}
        <p className="mb-2 font-[family-name:var(--font-mono)] text-[10px] font-medium uppercase tracking-[2px] text-[#4df2c8]">
          Selected structure
        </p>

        {selectedName ? (
          <>
            <p className="break-words font-[family-name:var(--font-display)] text-lg font-semibold">
              {selectedName}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              This is the 3D mesh object name. Its anatomical identity has
              not yet been verified.
            </p>

            <button
              onClick={() => setSelectedName(null)}
              className="mt-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm transition hover:border-[#4df2c8]/50 hover:bg-[#4df2c8]/10"
            >
              Clear selection
            </button>
          </>
        ) : (
          <p className="text-sm text-slate-400">
            Click any part of the model to select it.
          </p>
        )}

        {/* Exploded view controls */}
        <div className="mt-5 border-t border-white/10 pt-4">

          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[2px] text-[#4df2c8]">
                Model exploration
              </p>

              <p className="mt-1 text-sm font-semibold">
                Exploded view
              </p>
            </div>

            <span className="rounded-md border border-[#4df2c8]/20 bg-[#4df2c8]/10 px-2 py-1 font-mono text-xs text-[#4df2c8]">
              {Math.round(explodeAmount * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={explodeAmount}
            onChange={(event) =>
              setExplodeAmount(Number(event.target.value))
            }
            className="w-full cursor-pointer accent-[#4df2c8]"
            aria-label="Exploded view separation"
          />

          <div className="mt-2 flex justify-between text-[10px] text-slate-400">
            <span>Assembled</span>
            <span>Separated</span>
          </div>

          <button
            onClick={() => setExplodeAmount(isExploded ? 0 : 1)}
            className="mt-4 w-full rounded-lg border border-[#4df2c8]/30 bg-[#4df2c8]/10 px-3 py-2.5 text-sm font-medium text-[#4df2c8] transition hover:bg-[#4df2c8]/20"
          >
            {isExploded ? "Reassemble heart" : "Explode heart"}
          </button>

        </div>
      </div>
    </div>
  );
}
