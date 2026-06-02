import { Suspense } from "react";
import { verifyAdmin } from "@/lib/dal";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Header } from "@/components/dashboard/header";
import { Skeleton } from "@/components/ui/skeleton";

async function AdminShell({ children }: { children: React.ReactNode }) {
  const session = await verifyAdmin();
  return (
    <>
      <Header userName={session.name ?? session.email} role="ADMIN" />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Suspense
          fallback={
            <>
              <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-end shrink-0">
                <Skeleton className="w-32 h-8 rounded-lg" />
              </div>
              <main className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-56" />
                  <Skeleton className="h-4 w-80" />
                </div>
              </main>
            </>
          }
        >
          <AdminShell>{children}</AdminShell>
        </Suspense>
      </div>
    </div>
  );
}
