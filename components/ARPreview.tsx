"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";
import { TextureLoader, Mesh, Matrix4 } from "three";
import { Suspense } from "react";
import type { Scale } from "@/types";

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
}

function CarMesh({ images, scale, hitMatrix }: CarMeshProps) {
  const ref = useRef<Mesh>(null);
  const l = SCALE_LENGTHS_M[scale];
  const [w, h, d] = [l, l * 0.4, l * 0.55];

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

function ARScene({ images, scale }: { images: string[]; scale: Scale }) {
  const { gl, camera } = useThree();
  const [hitMatrix, setHitMatrix] = useState<Matrix4 | null>(null);
  const hitTestSourceRef = useRef<XRHitTestSource | null>(null);
  const sessionRef = useRef<XRSession | null>(null);

  // When the AR session starts, set up the hit-test source — the thing that detects flat surfaces through the camera.
  useEffect(() => {
    const session = gl.xr.getSession();
    if (!session) return;
    sessionRef.current = session;

    // Asks for a coordinate space relative to the device's camera/viewpoint
    session.requestReferenceSpace("viewer").then((viewerSpace) => {
      // Every frame, cast a ray from the camera forward to be able to tell where it hits a real surface
      session.requestHitTestSource?.({ space: viewerSpace })?.then((source) => {
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
        <CarMesh images={images} scale={scale} hitMatrix={hitMatrix} />
      </Suspense>
      <Reticle hitMatrix={hitMatrix} />
    </>
  );
}

interface ARPreviewProps {
  images: string[];
  scale: Scale;
  onClose: () => void;
}

export default function ARPreview({ images, scale, onClose }: ARPreviewProps) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!navigator.xr) {
      setSupported(false);
      return;
    }
    navigator.xr.isSessionSupported("immersive-ar").then(setSupported);
  }, []);

  const startAR = async () => {
    try {
      setSessionActive(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to start AR");
      setSessionActive(false);
    }
  };

  // Not supported fallback
  if (supported === false) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
        <div className="max-w-sm rounded-2xl border border-surface-border bg-surface-card p-6 text-center space-y-4">
          <div className="text-4xl">📱</div>
          <h2 className="text-lg font-bold text-white">AR Not Available</h2>
          <p className="text-sm text-gray-400">
            WebXR AR requires{" "}
            <strong className="text-white">Android Chrome</strong> or{" "}
            <strong className="text-white">iOS WebXR Viewer</strong> on a device
            with ARCore / ARKit support.
          </p>
          <p className="text-xs text-gray-500">
            Try opening this page on your phone.
          </p>
          <button
            onClick={onClose}
            className="mt-2 rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-500"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (supported === null) return null; // still checking

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Close button always visible */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-2 text-white backdrop-blur-sm"
        aria-label="Close AR"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 fill-none stroke-current stroke-2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {!sessionActive ? (
        <div className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
          <div className="text-6xl">📱</div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">
              Real Life AR Preview
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Point your camera at a flat surface — the car will appear at true{" "}
              <span className="text-brand-400">{scale}</span> scale.
            </p>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            onClick={startAR}
            className="rounded-xl bg-brand-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-brand-900/50 hover:bg-brand-500"
          >
            Start AR
          </button>
        </div>
      ) : (
        <div ref={canvasRef} className="h-full w-full">
          <Canvas
            gl={{ alpha: true }}
            camera={{ fov: 70 }}
            onCreated={({ gl }) => {
              gl.xr.enabled = true;
              navigator
                .xr!.requestSession("immersive-ar", {
                  requiredFeatures: ["hit-test"],
                  optionalFeatures: ["dom-overlay"],
                })
                .then((session) => {
                  gl.xr.setSession(session as any);
                  session.addEventListener("end", () => {
                    setSessionActive(false);
                    onClose();
                  });
                })
                .catch((e: unknown) => {
                  setError(
                    e instanceof Error ? e.message : "AR session failed"
                  );
                  setSessionActive(false);
                });
            }}
          >
            <ARScene images={images} scale={scale} />
          </Canvas>
        </div>
      )}
    </div>
  );
}
