"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import type { WebGLRenderer } from "three";
import type { Scale } from "@/types";
import SliderScale from "@/components/car-previews/SliderScale";
import ARScene, {
  type ScaleMultipliers,
} from "@/components/car-previews/ARScene";

interface ARPreviewProps {
  images: string[];
  scale: Scale;
  onClose: () => void;
}

export default function ARPreview({ images, scale, onClose }: ARPreviewProps) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [multipliers, setMultipliers] = useState<ScaleMultipliers>({
    x: 1,
    y: 1,
    z: 1,
  });
  // We need the WebGL renderer to exist BEFORE requesting the XR session,
  // so the context can be made XR-compatible via gl.xr.setSession().
  const glRef = useRef<WebGLRenderer | null>(null);
  const sessionRef = useRef<XRSession | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!navigator.xr) {
      setSupported(false);
      return;
    }
    navigator.xr.isSessionSupported("immersive-ar").then(setSupported);
  }, []);

  const startAR = async () => {
    const gl = glRef.current;
    if (!gl) {
      setError("Renderer not ready — please wait a moment and try again.");
      return;
    }
    try {
      const session = await navigator.xr!.requestSession("immersive-ar", {
        requiredFeatures: ["hit-test"],
        optionalFeatures: ["dom-overlay", "local", "local-floor"],
        // Passing domOverlay.root tells ARCore which element to composite
        // on top of the camera feed — without this the whole DOM disappears.
        ...(overlayRef.current
          ? { domOverlay: { root: overlayRef.current } }
          : {}),
      } as XRSessionInit);
      sessionRef.current = session;
      session.addEventListener("end", () => {
        sessionRef.current = null;
        setSessionActive(false);
        onClose();
      });
      // Three.js internally calls makeXRCompatible() here, then wires up the session.
      gl.xr.enabled = true;
      await (gl.xr.setSession as (s: XRSession) => Promise<void>)(
        session as any
      );
      setSessionActive(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to start AR");
    }
  };

  const closeAR = () => {
    sessionRef.current?.end();
    onClose();
  };

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

  if (supported === null) return null;

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-50 ${sessionActive ? "" : "bg-black"}`}
    >
      {/* Close always visible */}
      <button
        onClick={closeAR}
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

      {/* Canvas is ALWAYS mounted so the WebGL context exists before we call requestSession.
          It's invisible until the XR session is active. */}
      <div
        className="absolute inset-0"
        style={{
          opacity: sessionActive ? 1 : 0,
          // The XR session receives input directly from the OS — the canvas
          // must never intercept DOM pointer events or it will block the
          // SliderScale overlay sitting on top of it.
          pointerEvents: "none",
        }}
      >
        <Canvas
          gl={{ alpha: true, premultipliedAlpha: false, antialias: false }}
          camera={{ fov: 70 }}
          frameloop="always"
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
            glRef.current = gl;
          }}
        >
          {sessionActive && (
            <ARScene images={images} scale={scale} multipliers={multipliers} />
          )}
        </Canvas>
      </div>

      {/* Launch screen — always in DOM, hidden via CSS once session starts.
          dom-overlay requires elements to exist in the DOM tree before the
          XR session begins, so we can't conditionally mount/unmount these. */}
      <div
        className="relative z-10 flex h-full flex-col items-center justify-center gap-6 p-8 text-center transition-opacity duration-200"
        style={{
          opacity: sessionActive ? 0 : 1,
          pointerEvents: sessionActive ? "none" : "auto",
        }}
      >
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
        <div className="w-full max-w-sm">
          <SliderScale
            scale={scale}
            multipliers={multipliers}
            onChange={setMultipliers}
            locked
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          onClick={startAR}
          className="rounded-xl bg-brand-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-brand-900/50 hover:bg-brand-500"
        >
          Start AR
        </button>
      </div>

      {/* Size controls overlay during active session — always in DOM, shown via CSS */}
      <div
        className="absolute bottom-6 left-4 right-4 z-20 transition-opacity duration-200"
        style={{
          opacity: sessionActive ? 1 : 0,
          pointerEvents: sessionActive ? "auto" : "none",
        }}
      >
        <SliderScale
          scale={scale}
          multipliers={multipliers}
          onChange={setMultipliers}
        />
      </div>
    </div>
  );
}
