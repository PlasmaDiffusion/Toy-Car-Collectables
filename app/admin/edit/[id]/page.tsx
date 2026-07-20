import { notFound } from "next/navigation";
import { getCarById } from "@/lib/api";
import CarForm from "@/components/admin/CarForm";
import AdminHelp from "@/components/admin/AdminHelp";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = await getCarById(id);
  return { title: car ? `Edit — ${car.name}` : "Not Found" };
}

export default async function AdminEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = await getCarById(id);
  if (!car) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            Edit Collectable
          </h1>
          <p className="mt-1 text-sm text-gray-400 truncate">{car.name}</p>
          <p className="mt-1 text-sm text-gray-400 truncate">
            (Only admins can access this page or see the button that links to
            it.)
          </p>
        </div>
        <AdminHelp />
      </div>

      <div className="rounded-xl border border-surface-border bg-surface-card p-6">
        <CarForm mode="edit" initialData={car} />
      </div>
    </div>
  );
}
