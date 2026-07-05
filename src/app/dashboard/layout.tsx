import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import DashboardSidebar from "@/components/dashboard/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session.userId) redirect("/auth/login");
  return (
    <div className="min-h-screen flex bg-bg">
      <DashboardSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
