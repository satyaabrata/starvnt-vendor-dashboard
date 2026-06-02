import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { CreatePOForm } from "@/components/admin/create-po-form";
import Link from "next/link";

export default async function NewPOPage() {
  await verifyAdmin();
  const vendors = await prisma.vendorProfile.findMany({
    where: { status: "APPROVED" },
    select: { id: true, businessName: true, category: true },
    orderBy: { businessName: "asc" },
  });
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link href="/admin/purchase-orders" className="text-sm text-slate-500 hover:text-slate-700">← Purchase Orders</Link>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Create Purchase Order</h1>
      </div>
      <CreatePOForm vendors={vendors} />
    </div>
  );
}
