"use client";

import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { TextureLoader } from "three";
import { Suspense } from "react";
import type { Scale } from "@/types";

// Real-world approximate length in metres for each scale,
// assuming a "standard" car body ~4.5 m long.
const SCALE_LENGTHS_M: Record<Scale, number> = {
  "1:18": 0.25,
  "1:24": 0.188,
  "1:43": 0.105,
  "1:64": 0.07,
  "1:87": 0.052,
  Other: 0.08,
};

// Width ≈ 55 % of length, height ≈ 40 % of length (typical car proportions)
function getDimensions(scale: Scale) {
  const l = SCALE_LENGTHS_M[scale];
  return { w: l, h: l * 0.4, d: l * 0.55 };
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
}

function CarBoxMesh({ faces, scale }: CarBoxMeshProps) {
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

  const { w, h, d } = getDimensions(scale);

  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[w, h, d]} />
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

/** Map whatever images we have to the 6 box faces, falling back gracefully. */
function buildFaces(images: string[]): BoxFaces {
  const get = (i: number) => images[i] ?? images[0];
  return {
    front: get(0),
    back: get(1) ?? get(0),
    top: get(2) ?? get(0),
    bottom: get(3) ?? get(0),
    right: get(4) ?? get(0),
    left: get(5) ?? get(0),
  };
}

export default function CarBox3D({ images, scale, className }: CarBox3DProps) {
  const faces = buildFaces(images);

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
          <CarBoxMesh faces={faces} scale={scale} />
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

      <p className="mt-2 text-center text-[11px] text-gray-500">
        Drag to rotate · Scroll to zoom · Scale {scale}
      </p>
    </div>
  );
}
