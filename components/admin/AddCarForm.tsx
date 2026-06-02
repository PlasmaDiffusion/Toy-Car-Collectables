"use client";

import { useActionState, useState } from "react";
import { addCar, type AddCarState } from "@/app/admin/actions";
import Link from "next/link";
import CarImageUploader from "./CarImageUploader";

const CONDITIONS = ["Mint in Box", "Near Mint", "Excellent", "Good", "Fair"];
const SCALES: { value: string; label: string }[] = [
  { value: "1:18", label: "1:18 (25 cm)" },
  { value: "1:24", label: "1:24 (18.8 cm)" },
  { value: "1:43", label: "1:43 (10.5 cm)" },
  { value: "1:64", label: "1:64 (7 cm) — Hot Wheels standard" },
  { value: "1:87", label: "1:87 (5.2 cm)" },
  { value: "Other", label: "Other (~8 cm)" },
];
const VEHICLE_TYPES = [
  "Muscle Car",
  "Sports Car",
  "Race Car",
  "Movie & TV",
  "Truck & Van",
  "Emergency Vehicle",
  "Motorcycle",
  "Classic",
];
const MATERIALS = ["Diecast", "Plastic", "Tin", "Resin"];

const currentYear = new Date().getFullYear();

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-300">
        {label}
        {required && <span className="ml-1 text-brand-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-500";
const selectClass = inputClass;

export default function AddCarForm() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [state, action, isPending] = useActionState<AddCarState, FormData>(
    addCar,
    { status: "idle" }
  );

  if (state.status === "success") {
    return (
      <div className="rounded-xl border border-emerald-700 bg-emerald-900/30 p-6 text-center">
        <p className="text-lg font-semibold text-emerald-300">
          ✓ Collectable added!
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Link
            href={`/car/${state.id}`}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500"
          >
            View listing
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md border border-surface-border px-4 py-2 text-sm text-gray-300 hover:text-white"
          >
            Add another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      {/* ── Core fields ─────────────────────────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" required>
          <input
            name="name"
            required
            placeholder="e.g. 1969 Dodge Charger"
            className={inputClass}
          />
        </Field>

        <Field
          label="Price (CAD)"
          hint="Leave blank to show 'Price on Request'"
        >
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 24.99"
            className={inputClass}
          />
        </Field>

        <Field label="Condition">
          <select name="condition" defaultValue="" className={selectClass}>
            <option value="">Select condition…</option>
            {CONDITIONS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>

        <Field label="Images" hint="Upload up to 8 images (max 4 MB each)">
          <CarImageUploader urls={imageUrls} onChange={setImageUrls} />
          {/* Hidden input so the server action receives the URLs as newline-separated text */}
          <input type="hidden" name="images" value={imageUrls.join("\n")} />
        </Field>

        <Field label="Tags" hint="Comma-separated, e.g. redline, treasure hunt">
          <input
            name="tags"
            placeholder="redline, treasure hunt, blister pack"
            className={inputClass}
          />
        </Field>

        <Field
          label="Facebook Marketplace URL"
          hint="Leave blank if the listing isn't live yet — it will show as 'Coming Soon'"
        >
          <input
            name="facebookUrl"
            type="url"
            placeholder="https://www.facebook.com/marketplace/item/…"
            className={inputClass}
          />
        </Field>

        <Field label="Description" hint="Optional — shown on the detail page">
          <textarea
            name="description"
            rows={3}
            placeholder="Original blister pack, light shelf wear…"
            className={inputClass}
          />
        </Field>

        <div className="flex items-center gap-3 sm:col-span-2">
          <input
            id="featured"
            name="featured"
            type="checkbox"
            className="h-4 w-4 rounded border-surface-border accent-brand-500"
          />
          <label
            htmlFor="featured"
            className="text-sm font-medium text-gray-300"
          >
            Feature this listing on the homepage
          </label>
        </div>
      </div>

      {/* ── Advanced toggle ──────────────────────────────────────────────── */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-brand-400 hover:text-brand-300"
        >
          <svg
            className={`h-4 w-4 transition-transform ${
              showAdvanced ? "rotate-90" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          {showAdvanced ? "Hide" : "Show"} advanced fields
        </button>

        {showAdvanced && (
          <div className="mt-4 grid gap-5 rounded-xl border border-surface-border bg-surface-card/50 p-5 sm:grid-cols-2">
            <Field label="Brand">
              <input
                name="brand"
                placeholder="e.g. Hot Wheels"
                className={inputClass}
              />
            </Field>

            <Field label="Scale" hint="Used for AR to-scale preview">
              <select name="scale" defaultValue="" className={selectClass}>
                <option value="">Select scale…</option>
                {SCALES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Vehicle Type">
              <select
                name="vehicleType"
                defaultValue=""
                className={selectClass}
              >
                <option value="">Select type…</option>
                {VEHICLE_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>

            <Field label="Material">
              <select name="material" defaultValue="" className={selectClass}>
                <option value="">Select material…</option>
                {MATERIALS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>

            <Field label="Production Year" hint="Year this toy was made">
              <input
                name="productionYear"
                type="number"
                min="1940"
                max={currentYear}
                placeholder={String(currentYear)}
                className={inputClass}
              />
            </Field>

            <Field label="Model Year" hint="Year of the real vehicle">
              <input
                name="modelYear"
                type="number"
                min="1900"
                max={currentYear}
                placeholder="1969"
                className={inputClass}
              />
            </Field>
          </div>
        )}
      </div>

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {state.status === "error" && (
        <p className="rounded-md border border-red-700 bg-red-900/30 px-4 py-2 text-sm text-red-300">
          {state.message}
        </p>
      )}

      {/* ── Submit ───────────────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-50"
        >
          {isPending ? "Adding…" : "Add Collectable"}
        </button>
      </div>
    </form>
  );
}
