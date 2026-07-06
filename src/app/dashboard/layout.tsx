import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import DashboardSidebar from "@/components/dashboard/sidebar";
import SiteHeader from "@/components/public/site-header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login");
  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader initialRole={user.role} />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <DashboardSidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
