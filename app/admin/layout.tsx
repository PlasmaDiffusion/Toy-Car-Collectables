import { auth } from "@/auth";
import { notFound } from "next/navigation";

// Make sure all admin pages for adding or editing toy cars are under /admin.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  // @ts-expect-error — isAdmin is our custom field
  if (!session?.user?.isAdmin) notFound();

  return <>{children}</>;
}
