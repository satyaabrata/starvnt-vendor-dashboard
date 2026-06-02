import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { CreateInvoiceForm } from "@/components/admin/create-invoice-form";
import Link from "next/link";

export default async function NewInvoicePage() {
  await verifyAdmin();
  const vendors = await prisma.vendorProfile.findMany({ where: { status: "APPROVED" }, select: { id: true, businessName: true }, orderBy: { businessName: "asc" } });
  const pos = await prisma.purchaseOrder.findMany({ where: { status: { in: ["SENT", "ACKNOWLEDGED", "IN_PROGRESS", "DELIVERED"] } }, select: { id: true, poNumber: true, title: true, vendorId: true }, orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/admin/invoices" className="text-sm text-slate-500 hover:text-slate-700">← Invoices</Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">New Invoice</h1>
      </div>
      <CreateInvoiceForm vendors={vendors} pos={pos} />
    </div>
  );
}
