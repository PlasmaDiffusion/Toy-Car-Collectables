import { auth } from "@/auth";
import CarForm from "@/components/admin/CarForm";

export const metadata = { title: "Admin — Add Collectable" };

export default async function AdminPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white">Add Collectable</h1>
        <p className="mt-1 text-sm text-gray-400">
          Signed in as {session!.user!.email}
        </p>
      </div>

      <div className="rounded-xl border border-surface-border bg-surface-card p-6">
        <CarForm mode="add" />
      </div>
    </div>
  );
}
