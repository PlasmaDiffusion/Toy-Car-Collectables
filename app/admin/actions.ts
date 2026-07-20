"use server";

import { auth } from "@/auth";
import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type CarFormState =
  | { status: "idle" }
  | { status: "success"; id: string }
  | { status: "error"; message: string };

/** @deprecated use CarFormState */
export type AddCarState = CarFormState;

export async function addCar(
  _prev: CarFormState,
  formData: FormData
): Promise<CarFormState> {
  const session = await auth();
  // @ts-expect-error — isAdmin is custom
  if (!session?.user?.isAdmin) return { status: "error", message: "Forbidden" };

  const name = formData.get("name") as string;
  const brand = ((formData.get("brand") as string) || "").trim();
  const price = formData.get("price") as string;
  const condition = (formData.get("condition") as string) || null;
  const scale = (formData.get("scale") as string) || null;
  const vehicleType = (formData.get("vehicleType") as string) || null;
  const material = (formData.get("material") as string) || null;
  const productionYear = formData.get("productionYear") as string;
  const modelYear = formData.get("modelYear") as string;
  const description = ((formData.get("description") as string) || "").trim();
  const facebookUrl =
    ((formData.get("facebookUrl") as string) || "").trim() || null;
  const featured = formData.get("featured") === "on";
  const imagesRaw = ((formData.get("images") as string) || "").trim();
  const tagsRaw = ((formData.get("tags") as string) || "").trim();

  if (!name?.trim()) {
    return { status: "error", message: "Name is required." };
  }

  const images = imagesRaw
    ? imagesRaw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  try {
    const rows = await sql`
      INSERT INTO cars (
        name, brand, price, condition, scale, vehicle_type, material,
        production_year, model_year, description,
        facebook_marketplace_url, featured, images, tags
      ) VALUES (
        ${name.trim()}, ${brand},
        ${price ? Number(price) : null},
        ${condition}, ${scale}, ${vehicleType}, ${material},
        ${productionYear ? Number(productionYear) : null},
        ${modelYear ? Number(modelYear) : null},
        ${description},
        ${facebookUrl}, ${featured},
        ${images}, ${tags}
      )
      RETURNING id
    `;

    revalidatePath("/");
    revalidatePath("/shop");
    return { status: "success", id: rows[0].id };
  } catch (err) {
    console.error("addCar error:", err);
    const message =
      err instanceof Error ? err.message : "Unknown database error";
    return { status: "error", message: `Database error: ${message}` };
  }
}

export async function updateCar(
  _prev: CarFormState,
  formData: FormData
): Promise<CarFormState> {
  const session = await auth();
  // @ts-expect-error — isAdmin is custom
  if (!session?.user?.isAdmin) return { status: "error", message: "Forbidden" };

  const id = (formData.get("id") as string)?.trim();
  if (!id) return { status: "error", message: "Missing car ID." };

  const name = formData.get("name") as string;
  if (!name?.trim()) return { status: "error", message: "Name is required." };

  const brand = ((formData.get("brand") as string) || "").trim();
  const price = formData.get("price") as string;
  const condition = (formData.get("condition") as string) || null;
  const scale = (formData.get("scale") as string) || null;
  const vehicleType = (formData.get("vehicleType") as string) || null;
  const material = (formData.get("material") as string) || null;
  const productionYear = formData.get("productionYear") as string;
  const modelYear = formData.get("modelYear") as string;
  const description = ((formData.get("description") as string) || "").trim();
  const facebookUrl =
    ((formData.get("facebookUrl") as string) || "").trim() || null;
  const featured = formData.get("featured") === "on";
  const imagesRaw = ((formData.get("images") as string) || "").trim();
  const tagsRaw = ((formData.get("tags") as string) || "").trim();

  const images = imagesRaw
    ? imagesRaw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  try {
    await sql`
      UPDATE cars SET
        name                     = ${name.trim()},
        brand                    = ${brand},
        price                    = ${price ? Number(price) : null},
        condition                = ${condition},
        scale                    = ${scale},
        vehicle_type             = ${vehicleType},
        material                 = ${material},
        production_year          = ${
          productionYear ? Number(productionYear) : null
        },
        model_year               = ${modelYear ? Number(modelYear) : null},
        description              = ${description},
        facebook_marketplace_url = ${facebookUrl},
        featured                 = ${featured},
        images                   = ${images},
        tags                     = ${tags},
        updated_at               = NOW()
      WHERE id = ${id}
    `;

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/car/${id}`);
    return { status: "success", id };
  } catch (err) {
    console.error("updateCar error:", err);
    const message =
      err instanceof Error ? err.message : "Unknown database error";
    return { status: "error", message: `Database error: ${message}` };
  }
}

export async function deleteCar(
  id: string
): Promise<CarFormState> {
  const session = await auth();
  // @ts-expect-error — isAdmin is custom
  if (!session?.user?.isAdmin) return { status: "error", message: "Forbidden" };

  if (!id?.trim()) {
    return { status: "error", message: "Missing car ID." };
  }

  try {
    await sql`DELETE FROM cars WHERE id = ${id}`;

    revalidatePath("/");
    revalidatePath("/shop");
    return { status: "success", id };
  } catch (err) {
    console.error("deleteCar error:", err);
    const message =
      err instanceof Error ? err.message : "Unknown database error";
    return { status: "error", message: `Database error: ${message}` };
  }
}
