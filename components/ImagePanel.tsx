"use client";

import { useState } from "react";
import Image from "next/image";
import CarBox3D, { SCALE_LENGTHS_CM } from "@/components/car-previews/CarBox3D";
import ARPreview from "@/components/car-previews/ARPreview";
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
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(car.images[0]);
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
            \nFor reference a standard hot wheels car is about 7cm. Set the Scale field in the form to get accurate real-world sizing.`}
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
              src={selectedImage}
              alt={car.name}
              fill
              priority
              className="object-contain p-6"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <button
              onClick={() => setFullscreenOpen(true)}
              className="absolute bottom-3 right-3 p-2 rounded-lg bg-black/40 hover:bg-black/60 transition text-white"
              title="View fullscreen"
            >
              <svg
                width="16px"
                height="16px"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                className="bi bi-fullscreen"
              >
                <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z" />
              </svg>
            </button>
          </div>

          {/* Fullscreen modal */}
          {fullscreenOpen && (
            <div
              className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
              onClick={() => setFullscreenOpen(false)}
            >
              <div
                className="relative w-full h-full max-w-4xl max-h-[90vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={selectedImage}
                  alt={car.name}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />

                {/* Left arrow */}
                {car.images.length > 1 && (
                  <button
                    onClick={() => {
                      const currentIndex = car.images.indexOf(selectedImage);
                      const nextIndex =
                        currentIndex > 0
                          ? currentIndex - 1
                          : car.images.length - 1;
                      setSelectedImage(car.images[nextIndex]);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-black/60 hover:bg-black/80 transition text-white"
                    title="Previous image"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6 fill-none stroke-current stroke-[2]"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                )}

                {/* Right arrow */}
                {car.images.length > 1 && (
                  <button
                    onClick={() => {
                      const currentIndex = car.images.indexOf(selectedImage);
                      const nextIndex =
                        currentIndex < car.images.length - 1
                          ? currentIndex + 1
                          : 0;
                      setSelectedImage(car.images[nextIndex]);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-black/60 hover:bg-black/80 transition text-white"
                    title="Next image"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6 fill-none stroke-current stroke-[2]"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                )}

                <button
                  onClick={() => setFullscreenOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-black/60 hover:bg-black/80 transition text-white"
                  title="Close fullscreen"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6 fill-none stroke-current stroke-[2]"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Thumbnail strip */}
          {car.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto overflow-y-hidden">
              {car.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border bg-surface-card transition ${
                    selectedImage === img
                      ? "border-brand-500 ring-1 ring-brand-500"
                      : "border-surface-border hover:border-gray-500"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${car.name} view ${i + 1}`}
                    fill
                    className="object-contain p-2"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {" "}
          {car.images.length < 5 && (
            <AdminOnlyNotice
              message={`The 3D and AR preview might look off because this listing only has ${car.images.length} photo(s). For best results, upload photos from at least the front, back, sides, and top.`}
            />
          )}
          <div className="overflow-hidden rounded-2xl border border-surface-border bg-surface-card">
            <CarBox3D
              images={car.images}
              scale={scale}
              className="h-80 w-full"
            />
            <div className="border-t border-surface-border bg-surface my-80">
              <p className="text-xs leading-relaxed text-gray-400">
                <span className="font-semibold text-gray-300">Note: </span>
                The 3D box is built from this listing&apos;s photos mapped onto
                each face. Scale is approximate based on{" "}
                {car.scale ?? `${DEFAULT_SCALE} (default)`}.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
