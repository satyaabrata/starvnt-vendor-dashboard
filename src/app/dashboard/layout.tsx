import { Suspense } from "react";
import { verifySession } from "@/lib/dal";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarProvider, SidebarOverlay } from "@/components/dashboard/mobile-nav";

async function DashboardShell({ children }: { children: React.ReactNode }) {
  const session = await verifySession();
  return (
    <>
      <Header userName={session.name ?? session.email} role="VENDOR" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <SidebarOverlay />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Suspense
            fallback={
              <>
                <div className="h-14 bg-white border-b border-slate-100 px-6 flex items-center justify-end shrink-0">
                  <Skeleton className="w-32 h-8 rounded-lg" />
                </div>
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-4 w-80" />
                  </div>
                </main>
              </>
            }
          >
            <DashboardShell>{children}</DashboardShell>
          </Suspense>
        </div>
      </div>
    </SidebarProvider>
  );
}
