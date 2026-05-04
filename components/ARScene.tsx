"use client";

import { useEffect, useRef } from "react";
import { useLoader, useFrame, useThree } from "@react-three/fiber";
import { TextureLoader, Mesh, Matrix4 } from "three";
import type { MutableRefObject } from "react";
import { Suspense } from "react";
import type { Scale } from "@/types";

export interface ScaleMultipliers {
  x: number;
  y: number;
  z: number;
}

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
  hitMatrixRef: MutableRefObject<Matrix4 | null>;
  multipliers: ScaleMultipliers;
}

// hitMatrixRef is a ref (not a prop value) so useFrame reads it every frame
// without needing a React re-render cycle in between.
function CarMesh({ images, scale, hitMatrixRef, multipliers }: CarMeshProps) {
  const ref = useRef<Mesh>(null);
  const l = SCALE_LENGTHS_M[scale];

  const multipliersRef = useRef(multipliers);
  useEffect(() => { multipliersRef.current = multipliers; }, [multipliers]);

  const get = (i: number) => images[i] ?? images[0];
  const textures = useLoader(TextureLoader, [
    get(4), get(5), get(2), get(3), get(0), get(1),
    // right, left, top, bottom, front, back
  ]);

  useFrame(() => {
    if (!ref.current) return;
    const hm = hitMatrixRef.current;
    if (hm) {
      ref.current.position.setFromMatrixPosition(hm);
      ref.current.visible = true;
    }
    const m = multipliersRef.current;
    ref.current.scale.set(l * m.x, l * 0.4 * m.y, l * 0.55 * m.z);
  });

  return (
    <mesh ref={ref} visible={false} castShadow>
      {/* Unit box — actual size is controlled via mesh.scale above */}
      <boxGeometry args={[1, 1, 1]} />
      {textures.map((tex, i) => (
        <meshStandardMaterial key={i} attach={`material-${i}`} map={tex} />
      ))}
    </mesh>
  );
}

// Reticle reads the same hitMatrixRef — no prop/state delay, shows up on the
// very first frame that has a hit result, before textures have finished loading.
function Reticle({ hitMatrixRef }: { hitMatrixRef: MutableRefObject<Matrix4 | null> }) {
  const ref = useRef<Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;
    const hm = hitMatrixRef.current;
    if (hm) {
      ref.current.position.setFromMatrixPosition(hm);
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
  // Single Matrix4 ref shared between ARScene (writer) and children (readers).
  // Bypasses React state entirely so the reticle updates on the same frame as
  // the hit-test result — no re-render delay.
  const hitMatrixRef = useRef<Matrix4 | null>(null);
  const hitTestSourceRef = useRef<XRHitTestSource | null>(null);

  useEffect(() => {
    const session = gl.xr.getSession();
    if (!session) return;

    // "viewer" preferred; fall back to "local" for devices like Galaxy A23
    const getHitTestSpace = () =>
      session.requestReferenceSpace("viewer").catch(() =>
        session.requestReferenceSpace("local")
      );

    getHitTestSpace().then((space) => {
      session.requestHitTestSource?.({ space })?.then((source) => {
        hitTestSourceRef.current = source;
      });
    });

    return () => { hitTestSourceRef.current?.cancel(); };
  }, [gl]);

  useFrame((state) => {
    const frame = state.gl.xr.getFrame() as XRFrame | null;
    if (!frame || !hitTestSourceRef.current) return;

    const refSpace = state.gl.xr.getReferenceSpace();
    if (!refSpace) return;

    const results = frame.getHitTestResults(hitTestSourceRef.current);
    if (results.length > 0) {
      const pose = results[0].getPose(refSpace);
      if (pose) {
        // Reuse the same Matrix4 object to avoid per-frame allocations
        if (!hitMatrixRef.current) hitMatrixRef.current = new Matrix4();
        hitMatrixRef.current.fromArray(pose.transform.matrix);
      }
    }
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[1, 2, 2]} intensity={1} />
      {/* Reticle is outside Suspense so it shows immediately, before textures load */}
      <Reticle hitMatrixRef={hitMatrixRef} />
      <Suspense fallback={null}>
        <CarMesh
          images={images}
          scale={scale}
          hitMatrixRef={hitMatrixRef}
          multipliers={multipliers}
        />
      </Suspense>
    </>
  );
}
