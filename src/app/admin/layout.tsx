import { verifyAdmin } from "@/lib/dal";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Header } from "@/components/dashboard/header";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyAdmin();
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName={session.name ?? session.email} role="ADMIN" />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
