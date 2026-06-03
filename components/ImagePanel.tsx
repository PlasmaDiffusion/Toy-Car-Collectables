"use client";

import { useState } from "react";
import Image from "next/image";
import CarBox3D, { SCALE_LENGTHS_CM } from "@/components/CarBox3D";
import ARPreview from "@/components/ARPreview";
import type { ToyCarProduct, Scale } from "@/types";
import AdminOnlyNotice from "@/components/admin/AdminOnlyNotice";

const DEFAULT_SCALE: Scale = "1:64";

const DEFAULT_SCALE_CM = SCALE_LENGTHS_CM[DEFAULT_SCALE];

interface Props {
  car: ToyCarProduct;
}

export default function ImagePanel({ car }: Props) {
  const [tab, setTab] = useState<"photos" | "3d">("photos");
  const [arOpen, setArOpen] = useState(false);
  const scale: Scale = car.scale ?? DEFAULT_SCALE;

  return (
    <div className="space-y-4">
      {arOpen && (
        <ARPreview
          images={car.images}
          scale={scale}
          onClose={() => setArOpen(false)}
        />
      )}

      {!car.scale && (
        <AdminOnlyNotice
          message={`Scale isn't set for this listing — the 3D and AR preview will default to ${DEFAULT_SCALE} (≈${DEFAULT_SCALE_CM} cm).
            \nFor reference a standard hot wheels car is about 7cm. Set scale in the form's advanced fields to get accurate real-world sizing.`}
        />
      )}

      {/* Tab switcher */}
      <div className="flex flex-wrap gap-1 rounded-xl border border-surface-border bg-surface-card p-1 w-fit">
        {(["photos", "3d"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
              tab === t
                ? "bg-brand-600 text-white shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {t === "photos" ? "📷 Photos" : "🎲 3D Preview"}
          </button>
        ))}
        <button
          onClick={() => setArOpen(true)}
          className="rounded-lg px-4 py-1.5 text-sm font-semibold transition text-gray-400 hover:text-white flex items-center gap-1.5"
          title="View in your real environment using AR"
        >
          {/* AR glasses icon */}
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 fill-none stroke-current stroke-[1.5]"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2 12c0-1.5.7-2.8 1.8-3.6C5 7.5 6.5 7 8 7c1.8 0 3.2.7 4 1.8.8-1.1 2.2-1.8 4-1.8 1.5 0 3 .5 4.2 1.4C21.3 9.2 22 10.5 22 12v1a2 2 0 01-2 2h-2.5a2 2 0 01-2-2v-.5a1.5 1.5 0 00-3 0V13a2 2 0 01-2 2H8a2 2 0 01-2-2v-1z"
            />
          </svg>
          <span>Real Life AR</span>
        </button>
      </div>

      {tab === "photos" ? (
        <>
          {/* Primary image */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-surface-border bg-surface-card">
            <Image
              src={car.images[0]}
              alt={car.name}
              fill
              priority
              className="object-contain p-6"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Thumbnail strip */}
          {car.images.length > 1 && (
            <div className="flex gap-3">
              {car.images.map((img, i) => (
                <div
                  key={i}
                  className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-surface-border bg-surface-card"
                >
                  <Image
                    src={img}
                    alt={`${car.name} view ${i + 1}`}
                    fill
                    className="object-contain p-2"
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-surface-border bg-surface-card">
          <CarBox3D images={car.images} scale={scale} className="h-80 w-full" />
          <div className="border-t border-surface-border bg-surface my-80">
            <p className="text-xs leading-relaxed text-gray-500">
              <span className="font-semibold text-gray-300">Note: </span>
              The 3D box is built from this listing&apos;s photos mapped onto
              each face. Add more angles (front, back, top, sides, bottom) to
              the listing for a better preview. Scale is approximate based on{" "}
              {car.scale ?? `${DEFAULT_SCALE} (default)`}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
