"use server";

import { auth } from "@/auth";
import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type AddCarState =
  | { status: "idle" }
  | { status: "success"; id: string }
  | { status: "error"; message: string };

export async function addCar(
  _prev: AddCarState,
  formData: FormData
): Promise<AddCarState> {
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
