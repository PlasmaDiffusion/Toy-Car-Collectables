"use client";

import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { TextureLoader } from "three";
import { Suspense, useState } from "react";
import type { Scale } from "@/types";
import SliderScale from "@/components/car-previews/SliderScale";

// Real-world approximate length in metres for each scale,
// assuming a "standard" car body ~4.5 m long.
export const SCALE_LENGTHS_CM: Record<Scale, number> = {
  "1:18": 25,
  "1:24": 18.8,
  "1:43": 10.5,
  "1:64": 7,
  "1:87": 5.2,
  Other: 8,
};

const SCALE_LENGTHS_M: Record<Scale, number> = {
  "1:18": 0.25,
  "1:24": 0.188,
  "1:43": 0.105,
  "1:64": 0.07,
  "1:87": 0.052,
  Other: 0.08,
};

// Convert Three.js metres → real-world cm/inches at a given multiplier
function getDimensions(scale: Scale, multiplier: number) {
  const l = SCALE_LENGTHS_M[scale] * multiplier;
  return { w: l, h: l * 0.4, d: l * 0.55 };
}

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface BoxFaces {
  /** front, back, top, bottom, right, left — each a URL */
  front: string;
  back: string;
  top: string;
  bottom: string;
  right: string;
  left: string;
}

interface CarBoxMeshProps {
  faces: BoxFaces;
  scale: Scale;
  multipliers: Vector3;
}

function CarBoxMesh({ faces, scale, multipliers }: CarBoxMeshProps) {
  // Load all 6 textures. Order must match BoxGeometry face order:
  // +X (right), -X (left), +Y (top), -Y (bottom), +Z (front), -Z (back)
  const textures = useLoader(TextureLoader, [
    faces.right,
    faces.left,
    faces.top,
    faces.bottom,
    faces.front,
    faces.back,
  ]);

  // Three.js UV mapping for top (index 2) and bottom (index 3) is rotated
  // 90° relative to the side faces — correct it so the car nose points forward.
  textures[2].rotation = Math.PI / 2;
  textures[2].center.set(0.5, 0.5);
  textures[3].rotation = Math.PI / 2;
  textures[3].center.set(0.5, 0.5);

  const { w, h, d } = getDimensions(scale, 1);
  const [fw, fh, fd] = [
    w * multipliers.x,
    h * multipliers.y,
    d * multipliers.z,
  ];

  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[fw, fh, fd]} />
      {textures.map((tex, i) => (
        <meshStandardMaterial key={i} attach={`material-${i}`} map={tex} />
      ))}
    </mesh>
  );
}

interface CarBox3DProps {
  /** Car images array — we'll map them to faces as best we can */
  images: string[];
  scale: Scale;
  className?: string;
}

/** Map whatever images we have to the 6 box faces, falling back gracefully.
 * Make sure the order of the indexes matches the array in CarImageUploader for best results.
 */
function buildFaces(images: string[]): BoxFaces {
  const get = (i: number) => images[i] ?? images[0];
  return {
    left: get(1),
    front: get(0),
    right: get(3),
    back: get(2),
    top: get(4),
    bottom: get(5),
  };
}

export default function CarBox3D({ images, scale, className }: CarBox3DProps) {
  const faces = buildFaces(images);
  const [scaleMultipliers, setScaleMultipliers] = useState<Vector3>({
    x: 1,
    y: 1,
    z: 1,
  });

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0.3, 0.2, 0.4], fov: 40 }}
        shadows
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[1, 2, 2]} intensity={1.2} castShadow />

        <Suspense fallback={null}>
          <CarBoxMesh
            faces={faces}
            scale={scale}
            multipliers={scaleMultipliers}
          />
          <ContactShadows
            position={[0, -0.06, 0]}
            opacity={0.45}
            scale={0.8}
            blur={2}
          />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={0.15}
          maxDistance={1.2}
          autoRotate
          autoRotateSpeed={1.2}
        />
      </Canvas>

      <div className="mt-4">
        <SliderScale
          scale={scale}
          multipliers={scaleMultipliers}
          onChange={setScaleMultipliers}
        />
      </div>

      <p className="mt-2 text-center text-[11px] text-gray-400">
        Drag to rotate · Scroll to zoom
      </p>
    </div>
  );
}
