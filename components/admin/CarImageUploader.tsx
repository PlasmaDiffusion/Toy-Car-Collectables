"use client";

import { useCallback, useRef, useState } from "react";
import { generateUploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

const UploadDropzone = generateUploadDropzone<OurFileRouter>();

const PHOTO_ORDER = [
  { label: "1 — Left side",  hint: null },
  { label: "2 — Front",      hint: null },
  { label: "3 — Right side", hint: null },
  { label: "4 — Back",       hint: null },
  { label: "5 — Top",        hint: "front of car at top of photo" },
  { label: "6 — Bottom",     hint: "front of car at top of photo" },
];

interface Props {
  onChange: (urls: string[]) => void;
  urls: string[];
}

// Upload images, displaying thumbnails in the recommended order for AR preview. Allows drag-and-drop reordering and removal of existing photos.
export default function CarImageUploader({ onChange, urls }: Props) {
  const [uploading, setUploading] = useState(false);
  // Index of an existing photo being dragged
  const dragIndex = useRef<number | null>(null);
  // Index the dragged item is hovering over
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const remove = useCallback(
    (url: string) => onChange(urls.filter((u) => u !== url)),
    [urls, onChange]
  );

  // ── Drag handlers ──────────────────────────────────────────────────────────

  function handleDragStart(i: number) {
    dragIndex.current = i;
  }

  function handleDragEnter(i: number) {
    if (dragIndex.current === null || dragIndex.current === i) return;
    setOverIndex(i);
  }

  function handleDragOver(e: React.DragEvent) {
    // Must prevent default to allow drop
    e.preventDefault();
  }

  function handleDrop(dropIndex: number) {
    if (dragIndex.current === null || dragIndex.current === dropIndex) {
      setOverIndex(null);
      dragIndex.current = null;
      return;
    }
    const reordered = [...urls];
    const [moved] = reordered.splice(dragIndex.current, 1);
    reordered.splice(dropIndex, 0, moved);
    onChange(reordered);
    dragIndex.current = null;
    setOverIndex(null);
  }

  function handleDragEnd() {
    dragIndex.current = null;
    setOverIndex(null);
  }

  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-3">
      {/* Recommended order hint */}
      <div className="rounded-md border border-brand-800/60 bg-brand-950/40 px-3 py-2.5">
        <p className="mb-1.5 text-xs font-medium text-brand-400">
          Recommended photo order for AR preview
        </p>
        <ol className="flex flex-wrap gap-x-4 gap-y-1">
          {PHOTO_ORDER.map(({ label, hint }) => (
            <li key={label} className="text-xs text-gray-400">
              {label}
              {hint && <span className="ml-1 text-gray-500">({hint})</span>}
            </li>
          ))}
        </ol>
      </div>

      {/* Thumbnail strip with drag-to-reorder */}
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {urls.map((url, i) => {
            const isBeingDragged = dragIndex.current === i;
            const isDropTarget = overIndex === i;
            return (
              <div
                key={url}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragEnter={() => handleDragEnter(i)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(i)}
                onDragEnd={handleDragEnd}
                className={[
                  "group relative h-20 w-20 shrink-0 cursor-grab select-none rounded-md transition-all",
                  isBeingDragged ? "opacity-40 scale-95" : "opacity-100 scale-100",
                  isDropTarget ? "ring-2 ring-brand-400 ring-offset-1 ring-offset-surface" : "",
                ].join(" ")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={PHOTO_ORDER[i]?.label ?? `Image ${i + 1}`}
                  draggable={false}
                  className="h-full w-full rounded-md border border-surface-border object-cover"
                />

                {/* Position label */}
                <span className="absolute bottom-0 left-0 right-0 rounded-b-md bg-black/70 px-1 py-0.5 text-center text-[9px] leading-tight text-gray-300">
                  {PHOTO_ORDER[i] ? PHOTO_ORDER[i].label.split(" — ")[1] : `#${i + 1}`}
                </span>

                {/* Drag handle icon — top-left */}
                <span className="absolute left-1 top-1 rounded bg-black/50 p-0.5 opacity-0 transition group-hover:opacity-100">
                  <svg className="h-3 w-3 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M8.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM15.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8.5 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM15.5 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM15.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                  </svg>
                </span>

                {/* Remove button — top-right */}
                <button
                  type="button"
                  onClick={() => remove(url)}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white opacity-0 transition group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Next expected position hint */}
      {urls.length > 0 && urls.length < PHOTO_ORDER.length && (
        <p className="text-xs text-gray-500">
          Next upload will be slot{" "}
          <span className="text-brand-400">{PHOTO_ORDER[urls.length]?.label}</span>
          {" "}— drag thumbnails to reorder
        </p>
      )}
      {urls.length === 0 && (
        <p className="text-xs text-gray-500">
          Upload photos in order: Left side → Front → Right side → Back → Top → Bottom
        </p>
      )}

      {/* Dropzone */}
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
          config={{ mode: "auto" }}
          appearance={{
            container:
              "border border-dashed border-surface-border rounded-md bg-surface p-4 cursor-pointer hover:border-brand-500 transition-colors ut-uploading:opacity-60",
            label: "text-sm text-gray-400",
            allowedContent: "text-xs text-gray-500",
            uploadIcon: "text-gray-500",
            button: "hidden",
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
