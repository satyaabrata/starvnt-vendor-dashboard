import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { PurchaseOrdersTable } from "@/components/admin/purchase-orders-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AdminPOsPage() {
  await verifyAdmin();
  const pos = await prisma.purchaseOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: { vendor: { select: { businessName: true } } },
  });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
          <p className="text-slate-500 text-sm mt-1">{pos.length} total purchase orders</p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/purchase-orders/new" />} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create PO
        </Button>
      </div>
      <PurchaseOrdersTable pos={pos as never} isAdmin />
    </div>
  );
}
