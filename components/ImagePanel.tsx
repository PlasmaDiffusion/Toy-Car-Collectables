"use client";

import { useState } from "react";
import Image from "next/image";
import CarBox3D from "@/components/CarBox3D";
import type { ToyCarProduct } from "@/types";

interface Props {
  car: ToyCarProduct;
}

export default function ImagePanel({ car }: Props) {
  const [tab, setTab] = useState<"photos" | "3d">("photos");

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-1 rounded-xl border border-surface-border bg-surface-card p-1 w-fit">
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
          <CarBox3D
            images={car.images}
            scale={car.scale}
            className="h-80 w-full"
          />
          <div className="border-t border-surface-border bg-surface px-4 py-3">
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-gray-300">Note: </span>
              The 3D box is built from this listing&apos;s photos mapped onto each face.
              Add more angles (front, back, top, sides, bottom) to the listing for a
              better preview. Scale is approximate based on {car.scale}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
