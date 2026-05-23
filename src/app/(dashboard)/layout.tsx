import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { getBranding } from "@/lib/branding";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const branding = await getBranding();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar branding={branding} isSuperuser={session.user?.is_superuser} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header session={session} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
