import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { VendorManagementTable } from "@/components/admin/vendor-management-table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export default async function AdminVendorsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await verifyAdmin();
  const { status } = await searchParams;
  const vendors = await prisma.vendorProfile.findMany({
    where: status ? { status: status as never } : undefined,
    include: { user: { select: { name: true, email: true, createdAt: true } }, documents: true, _count: { select: { purchaseOrders: true, contracts: true, invoices: true } } },
    orderBy: { createdAt: "desc" },
  });

  const counts = await Promise.all(["PENDING","APPROVED","REJECTED","SUSPENDED"].map(async (s) => ({
    status: s, count: await prisma.vendorProfile.count({ where: { status: s as never } })
  })));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendor Management</h1>
          <p className="text-slate-500 text-sm mt-1">{vendors.length} vendor{vendors.length !== 1 ? "s" : ""}{status ? ` · ${status.toLowerCase()}` : ""}</p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/vendors/new" />} className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Add Vendor
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[{ label: "All", val: "" }, ...counts.map((c) => ({ label: c.status.charAt(0) + c.status.slice(1).toLowerCase(), val: c.status, count: c.count }))].map((f) => (
          <Link key={f.val} href={f.val ? `/admin/vendors?status=${f.val}` : "/admin/vendors"}>
            <Badge variant="outline" className={`cursor-pointer px-3 py-1.5 text-xs ${(!status && !f.val) || status === f.val ? "bg-primary text-primary-foreground border-primary" : "hover:bg-slate-100"}`}>
              {f.label}{"count" in f ? ` (${f.count})` : ""}
            </Badge>
          </Link>
        ))}
      </div>

      <VendorManagementTable vendors={vendors as never} />
    </div>
  );
}
