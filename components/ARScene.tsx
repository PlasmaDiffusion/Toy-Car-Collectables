"use client";

import { useEffect, useRef, useState } from "react";
import { useLoader, useFrame, useThree } from "@react-three/fiber";
import { TextureLoader, Mesh, Matrix4 } from "three";
import { Suspense } from "react";
import type { Scale } from "@/types";

export interface ScaleMultipliers {
  x: number;
  y: number;
  z: number;
}

// Real-world approximate length in metres for each scale
const SCALE_LENGTHS_M: Record<Scale, number> = {
  "1:18": 0.25,
  "1:24": 0.188,
  "1:43": 0.105,
  "1:64": 0.07,
  "1:87": 0.052,
  Other: 0.08,
};

interface CarMeshProps {
  images: string[];
  scale: Scale;
  hitMatrix: Matrix4 | null;
  multipliers: ScaleMultipliers;
}

// A simple box with 6 textures, positioned using the hit-test results to appear anchored to real-world surfaces. The box's dimensions are determined by the selected scale and multipliers.
function CarMesh({ images, scale, hitMatrix, multipliers }: CarMeshProps) {
  const ref = useRef<Mesh>(null);
  const l = SCALE_LENGTHS_M[scale];
  const [w, h, d] = [
    l * multipliers.x,
    l * 0.4 * multipliers.y,
    l * 0.55 * multipliers.z,
  ];

  // Load all 6 textures, falling back to first image
  const get = (i: number) => images[i] ?? images[0];
  const textures = useLoader(TextureLoader, [
    get(4),
    get(5),
    get(2),
    get(3),
    get(0),
    get(1), // right, left, top, bottom, front, back
  ]);

  useFrame(() => {
    if (ref.current && hitMatrix) {
      ref.current.position.setFromMatrixPosition(hitMatrix);
      ref.current.visible = true;
    }
  });

  return (
    <mesh ref={ref} visible={false} castShadow>
      <boxGeometry args={[w, h, d]} />
      {textures.map((tex, i) => (
        <meshStandardMaterial key={i} attach={`material-${i}`} map={tex} />
      ))}
    </mesh>
  );
}

// Reticle that follows the hit-test surface
function Reticle({ hitMatrix }: { hitMatrix: Matrix4 | null }) {
  const ref = useRef<Mesh>(null);
  useFrame(() => {
    if (ref.current && hitMatrix) {
      ref.current.position.setFromMatrixPosition(hitMatrix);
      ref.current.visible = true;
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <ringGeometry args={[0.03, 0.04, 32]} />
      <meshBasicMaterial color="white" />
    </mesh>
  );
}

interface ARSceneProps {
  images: string[];
  scale: Scale;
  multipliers: ScaleMultipliers;
}

export default function ARScene({ images, scale, multipliers }: ARSceneProps) {
  const { gl } = useThree();
  const [hitMatrix, setHitMatrix] = useState<Matrix4 | null>(null);
  const hitTestSourceRef = useRef<XRHitTestSource | null>(null);
  const sessionRef = useRef<XRSession | null>(null);

  // When the AR session starts, set up the hit-test source — the thing that detects flat surfaces through the camera.
  useEffect(() => {
    const session = gl.xr.getSession();
    if (!session) return;
    sessionRef.current = session;

    // "viewer" is preferred for hit-test (ray from camera centre) but some
    // Android devices (e.g. Galaxy A23) only support "local". Try viewer first.
    const getHitTestSpace = () =>
      session.requestReferenceSpace("viewer").catch(() =>
        session.requestReferenceSpace("local")
      );

    getHitTestSpace().then((space) => {
      session.requestHitTestSource?.({ space })?.then((source) => {
        hitTestSourceRef.current = source;
      });
    });

    return () => {
      hitTestSourceRef.current?.cancel();
    };
  }, [gl]);

  // Get hit-test results every frame and update the hitMatrix, which both the car and reticle use to position themselves in the real world
  useFrame((state) => {
    const frame = state.gl.xr.getFrame() as XRFrame | null;
    if (!frame || !hitTestSourceRef.current) return;

    const refSpace = state.gl.xr.getReferenceSpace();
    if (!refSpace) return;

    const results = frame.getHitTestResults(hitTestSourceRef.current);
    if (results.length > 0) {
      const pose = results[0].getPose(refSpace);
      if (pose) {
        const m = new Matrix4();
        m.fromArray(pose.transform.matrix);
        setHitMatrix(m);
      }
    }
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[1, 2, 2]} intensity={1} />
      <Suspense fallback={null}>
        <CarMesh
          images={images}
          scale={scale}
          hitMatrix={hitMatrix}
          multipliers={multipliers}
        />
      </Suspense>
      <Reticle hitMatrix={hitMatrix} />
    </>
  );
}
