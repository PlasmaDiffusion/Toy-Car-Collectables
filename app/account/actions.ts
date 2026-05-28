"use server";

import { auth } from "@/auth";
import {
  deleteUserAccount,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
} from "@/lib/api";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function deleteAccount() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  await deleteUserAccount(session.user.id);
  // Caller is responsible for signing out on the client side
}

export async function toggleWishlist(
  carId: string,
  currentlyWishlisted: boolean
) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  const userId = session.user.id!;

  if (currentlyWishlisted) {
    await removeFromWishlist(userId, carId);
  } else {
    await addToWishlist(userId, carId);
  }

  revalidatePath("/account");
}

export async function getWishlistStatus(carId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  return isInWishlist(session.user.id, carId);
}
