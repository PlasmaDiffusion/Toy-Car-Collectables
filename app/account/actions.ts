"use server";

import { auth, signOut } from "@/auth";
import { deleteUserAccount, addToWishlist, removeFromWishlist, isInWishlist } from "@/lib/api";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function deleteAccount() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  await deleteUserAccount(session.user.id);

  // Sign out and send to home — account is gone
  await signOut({ redirect: false });
  redirect("/");
}

export async function toggleWishlist(carId: string, currentlyWishlisted: boolean) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  if (currentlyWishlisted) {
    await removeFromWishlist(session.user.id, carId);
  } else {
    await addToWishlist(session.user.id, carId);
  }

  revalidatePath("/account");
}

export async function getWishlistStatus(carId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  return isInWishlist(session.user.id, carId);
}
