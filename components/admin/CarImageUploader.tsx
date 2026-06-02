"use client";

import { useCallback, useState } from "react";
import { generateUploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

const UploadDropzone = generateUploadDropzone<OurFileRouter>();

const PHOTO_ORDER = [
  "1 — Left side",
  "2 — Front",
  "3 — Right side",
  "4 — Back",
  "5 — Top",
];

interface Props {
  onChange: (urls: string[]) => void;
  urls: string[];
}

export default function CarImageUploader({ onChange, urls }: Props) {
  const [uploading, setUploading] = useState(false);

  const remove = useCallback(
    (url: string) => onChange(urls.filter((u) => u !== url)),
    [urls, onChange]
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Recommended order hint */}
      <div className="rounded-md border border-brand-800/60 bg-brand-950/40 px-3 py-2.5">
        <p className="mb-1.5 text-xs font-medium text-brand-400">
          Recommended photo order for AR preview
        </p>
        <ol className="flex flex-wrap gap-x-4 gap-y-1">
          {PHOTO_ORDER.map((label) => (
            <li key={label} className="text-xs text-gray-400">
              {label}
            </li>
          ))}
        </ol>
      </div>

      {/* Thumbnail strip */}
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {urls.map((url, i) => (
            <div key={url} className="group relative h-20 w-20 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={PHOTO_ORDER[i] ?? `Image ${i + 1}`}
                className="h-full w-full rounded-md border border-surface-border object-cover"
              />
              {/* Position label */}
              {PHOTO_ORDER[i] && (
                <span className="absolute bottom-0 left-0 right-0 rounded-b-md bg-black/60 px-1 py-0.5 text-center text-[9px] leading-tight text-gray-300">
                  {PHOTO_ORDER[i].split(" — ")[1]}
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(url)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white opacity-0 transition group-hover:opacity-100"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Next expected position hint */}
      {urls.length < PHOTO_ORDER.length && (
        <p className="text-xs text-gray-500">
          Next upload will be slot{" "}
          <span className="text-brand-400">{PHOTO_ORDER[urls.length]}</span>
        </p>
      )}

      {/* Dropzone — hide once 8 images reached */}
      {urls.length < 8 && (
        <UploadDropzone
          endpoint="carImageUploader"
          onUploadBegin={() => setUploading(true)}
          onClientUploadComplete={(res) => {
            setUploading(false);
            onChange([...urls, ...res.map((f) => f.ufsUrl)]);
          }}
          onUploadError={(err) => {
            setUploading(false);
            console.error("Upload error:", err);
          }}
          appearance={{
            container:
              "border border-dashed border-surface-border rounded-md bg-surface p-4 cursor-pointer hover:border-brand-500 transition-colors ut-uploading:opacity-60",
            label: "text-sm text-gray-400",
            allowedContent: "text-xs text-gray-500",
            uploadIcon: "text-gray-500",
            button:
              "bg-brand-600 text-white text-sm rounded-md px-4 py-1.5 hover:bg-brand-500 transition ut-readying:bg-brand-800",
          }}
          content={{
            label: uploading
              ? "Uploading…"
              : urls.length === 0
                ? "Drag & drop or click to upload images"
                : `Add more (${urls.length}/8)`,
          }}
        />
      )}
    </div>
  );
}
