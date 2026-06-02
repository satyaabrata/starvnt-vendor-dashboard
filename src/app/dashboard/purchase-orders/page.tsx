import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { PurchaseOrdersTable } from "@/components/admin/purchase-orders-table";

export default async function VendorPOsPage() {
  const session = await verifySession();
  const profile = await prisma.vendorProfile.findUnique({ where: { userId: session.userId } });
  const pos = profile ? await prisma.purchaseOrder.findMany({
    where: { vendorId: profile.id },
    orderBy: { createdAt: "desc" },
    include: { vendor: { select: { businessName: true } } },
  }) : [];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
        <p className="text-slate-500 text-sm mt-1">{pos.length} orders received</p>
      </div>
      <PurchaseOrdersTable pos={pos as never} isAdmin={false} />
    </div>
  );
}
