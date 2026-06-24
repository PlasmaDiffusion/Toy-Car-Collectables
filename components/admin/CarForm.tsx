"use client";

import { useActionState, useState } from "react";
import { addCar, updateCar, type CarFormState } from "@/app/admin/actions";
import Link from "next/link";
import CarImageUploader from "./CarImageUploader";
import type { ToyCarProduct } from "@/types";

// ─── Constants ───────────────────────────────────────────────────────────────

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

// ─── Shared field wrapper ─────────────────────────────────────────────────────

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

// ─── Props ────────────────────────────────────────────────────────────────────

interface AddProps {
  mode: "add";
  initialData?: never;
}

interface EditProps {
  mode: "edit";
  initialData: ToyCarProduct;
}

type Props = AddProps | EditProps;

// ─── Component ───────────────────────────────────────────────────────────────

export default function CarForm({ mode, initialData }: Props) {
  const isEditing = mode === "edit";
  const action = isEditing ? updateCar : addCar;

  const [showExtra, setShowExtra] = useState(isEditing);
  const [imageUrls, setImageUrls] = useState<string[]>(
    initialData?.images ?? []
  );
  const [state, formAction, isPending] = useActionState<CarFormState, FormData>(
    action,
    { status: "idle" }
  );

  // ── Success screen ────────────────────────────────────────────────────────
  if (state.status === "success") {
    return (
      <div className="rounded-xl border border-emerald-700 bg-emerald-900/30 p-6 text-center">
        <p className="text-lg font-semibold text-emerald-300">
          {isEditing ? "✓ Collectable updated!" : "✓ Collectable added!"}
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Link
            href={`/car/${state.id}`}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500"
          >
            View listing
          </Link>
          {!isEditing && (
            <button
              onClick={() => window.location.reload()}
              className="rounded-md border border-surface-border px-4 py-2 text-sm text-gray-300 hover:text-white"
            >
              Add another
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* Hidden id field for edit mode */}
      {isEditing && <input type="hidden" name="id" value={initialData.id} />}

      {/* ── Core fields ───────────────────────────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" required>
          <input
            name="name"
            required
            defaultValue={initialData?.name}
            placeholder="e.g. 1969 Dodge Charger"
            className={inputClass}
          />
        </Field>

        <Field
          label="Price (CAD)"
          hint="Leave blank to show 'Price on Request' · Set to 0 to mark as Sold"
        >
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={initialData?.price ?? ""}
            placeholder="e.g. 24.99"
            className={inputClass}
          />
        </Field>

        <Field label="Condition">
          <select
            name="condition"
            defaultValue={initialData?.condition ?? ""}
            className={selectClass}
          >
            <option value="">Select condition…</option>
            {CONDITIONS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>

        <Field label="Scale" hint="Used for AR to-scale preview">
          <select
            name="scale"
            defaultValue={initialData?.scale ?? ""}
            className={selectClass}
          >
            <option value="">Select scale…</option>
            {SCALES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Images" hint="Upload up to 8 images (max 4 MB each)">
          <CarImageUploader urls={imageUrls} onChange={setImageUrls} />
          <input type="hidden" name="images" value={imageUrls.join("\n")} />
        </Field>

        <Field
          label="Facebook Marketplace URL"
          hint="Leave blank if the listing isn't live yet — it will show as 'Coming Soon'"
        >
          <input
            name="facebookUrl"
            type="url"
            defaultValue={initialData?.facebookMarketplaceUrl ?? ""}
            placeholder="https://www.facebook.com/marketplace/item/…"
            className={inputClass}
          />
        </Field>

        <Field label="Description" hint="Optional — shown on the detail page">
          <textarea
            name="description"
            rows={3}
            defaultValue={initialData?.description}
            placeholder="Original blister pack, light shelf wear…"
            className={inputClass}
          />
        </Field>

        <div className="flex items-center gap-3 sm:col-span-2">
          <input
            id="featured"
            name="featured"
            type="checkbox"
            defaultChecked={initialData?.featured ?? false}
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

      {/* ── Extra toggle ───────────────────────────────────────────────── */}
      <div>
        <button
          type="button"
          onClick={() => setShowExtra((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-brand-400 hover:text-brand-300"
        >
          <svg
            className={`h-4 w-4 transition-transform ${
              showExtra ? "rotate-90" : ""
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
          {showExtra ? "Hide" : "Show"} Extra fields
        </button>

        {showExtra && (
          <div className="mt-4 grid gap-5 rounded-xl border border-surface-border bg-surface-card/50 p-5 sm:grid-cols-2">
            <Field label="Brand">
              <input
                name="brand"
                defaultValue={initialData?.brand}
                placeholder="e.g. Hot Wheels"
                className={inputClass}
              />
            </Field>

            <Field
              label="Tags"
              hint="For searching. Comma-separated, e.g. redline, treasure hunt"
            >
              <input
                name="tags"
                defaultValue={initialData?.tags.join(", ")}
                placeholder="redline, treasure hunt, blister pack"
                className={inputClass}
              />
            </Field>

            <Field label="Vehicle Type">
              <select
                name="vehicleType"
                defaultValue={initialData?.vehicleType ?? ""}
                className={selectClass}
              >
                <option value="">Select type…</option>
                {VEHICLE_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>

            <Field label="Material">
              <select
                name="material"
                defaultValue={initialData?.material ?? ""}
                className={selectClass}
              >
                <option value="">Select material…</option>
                {MATERIALS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>

            <Field label="Toy Production Year" hint="Year this toy was made">
              <input
                name="productionYear"
                type="number"
                min="1940"
                max={currentYear}
                defaultValue={initialData?.productionYear ?? ""}
                placeholder={String(currentYear)}
                className={inputClass}
              />
            </Field>

            <Field label="Real Car Model Year" hint="Year of the real vehicle">
              <input
                name="modelYear"
                type="number"
                min="1900"
                max={currentYear}
                defaultValue={initialData?.modelYear ?? ""}
                placeholder="1969"
                className={inputClass}
              />
            </Field>
          </div>
        )}
      </div>

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {state.status === "error" && (
        <p className="rounded-md border border-red-700 bg-red-900/30 px-4 py-2 text-sm text-red-300">
          {state.message}
        </p>
      )}

      {/* ── Submit ────────────────────────────────────────────────────────── */}
      <div className="flex justify-end gap-3">
        {isEditing && (
          <Link
            href={`/car/${initialData.id}`}
            className="rounded-lg border border-surface-border px-6 py-2.5 text-sm font-semibold text-gray-300 transition hover:text-white"
          >
            Cancel
          </Link>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-50"
        >
          {isPending
            ? isEditing
              ? "Saving…"
              : "Adding…"
            : isEditing
            ? "Save Changes"
            : "Add Collectable"}
        </button>
      </div>
    </form>
  );
}
