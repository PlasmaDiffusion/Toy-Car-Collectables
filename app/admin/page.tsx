import { auth } from "@/auth";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold text-white">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-gray-400">
        Signed in as {session!.user!.email}
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Coming soon"
          value="—"
          description="Listings management"
        />
        <StatCard label="Coming soon" value="—" description="User management" />
        <StatCard
          label="Coming soon"
          value="—"
          description="Analytics overview"
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">
        {label}
      </p>
      <p className="mt-1 text-3xl font-extrabold text-white">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}
