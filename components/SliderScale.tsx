"use client";

import { useState, useEffect } from "react";
import type { Scale } from "@/types";

interface ScaleMultipliers {
  x: number;
  y: number;
  z: number;
}

interface Dims {
  cm: string;
  inches: string;
}

interface SliderScaleProps {
  scale: Scale;
  multipliers: ScaleMultipliers;
  onChange: (multipliers: ScaleMultipliers) => void;
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

function toDim(metres: number): Dims {
  const cm = metres * 100;
  return { cm: cm.toFixed(1), inches: (cm / 2.54).toFixed(1) };
}

//This component lets a adjust the scale multiplier for the 3D box preview, either uniformly or per-axis. It also shows the resulting real-world dimensions based on the selected scale and multipliers.
export default function SliderScale({
  scale,
  multipliers,
  onChange,
}: SliderScaleProps) {
  const [uniform, setUniform] = useState(1);
  const [separate, setSeparate] = useState(false);

  const base = SCALE_LENGTHS_M[scale];
  const dims = {
    length: toDim(base * multipliers.x),
    width: toDim(base * 0.55 * multipliers.z),
    height: toDim(base * 0.4 * multipliers.y),
  };

  // Sync uniform → all axes
  useEffect(() => {
    if (!separate) onChange({ x: uniform, y: uniform, z: uniform });
  }, [separate, uniform]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUniform = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setUniform(v);
    if (!separate) onChange({ x: v, y: v, z: v });
  };

  const handleAxis =
    (axis: keyof ScaleMultipliers) => (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...multipliers, [axis]: parseFloat(e.target.value) });

  const handleSeparate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSeparate(checked);
    if (!checked) onChange({ x: uniform, y: uniform, z: uniform });
  };

  const axisSliders: { axis: keyof ScaleMultipliers; label: string; dim: Dims }[] = [
    { axis: "x", label: "Length", dim: dims.length },
    { axis: "z", label: "Width", dim: dims.width },
    { axis: "y", label: "Height", dim: dims.height },
  ];

  return (
    <div className="rounded-lg border border-surface-border bg-surface-card px-4 py-3 space-y-3">
      {/* Uniform slider */}
      {!separate && (
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
            <span className="font-medium text-white">Size</span>
            <span className="font-mono text-brand-400">
              {dims.length.cm} cm&nbsp;/&nbsp;{dims.length.inches}&Prime; long
            </span>
          </div>
          <input
            type="range"
            min={0.5}
            max={4}
            step={0.05}
            value={uniform}
            onChange={handleUniform}
            className="w-full accent-brand-500"
          />
        </div>
      )}

      {/* Per-axis sliders */}
      {separate &&
        axisSliders.map(({ axis, label, dim }) => (
          <div key={axis}>
            <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
              <span className="font-medium text-white">{label}</span>
              <span className="font-mono text-brand-400">
                {dim.cm} cm&nbsp;/&nbsp;{dim.inches}&Prime;
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={4}
              step={0.05}
              value={multipliers[axis]}
              onChange={handleAxis(axis)}
              className="w-full accent-brand-500"
            />
          </div>
        ))}

      {/* Toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
        <input
          type="checkbox"
          checked={separate}
          onChange={handleSeparate}
          className="accent-brand-500 h-3.5 w-3.5"
        />
        <span className="text-[11px] text-gray-500">
          Scale length, width &amp; height separately
        </span>
      </label>

      <p className="text-[10px] text-gray-600">
        1× = scale-accurate for {scale}
      </p>
    </div>
  );
}
