import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { InvoicesTable } from "@/components/admin/invoices-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AdminInvoicesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await verifyAdmin();
  const { status } = await searchParams;
  const invoices = await prisma.invoice.findMany({
    where: status ? { status: status as never } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      vendor: { select: { businessName: true } },
      purchaseOrder: { select: { poNumber: true } },
      payments: true,
    },
  });
  const totalPaid = await prisma.payment.aggregate({ _sum: { amount: true } });
  const pendingAmount = await prisma.invoice.aggregate({ where: { status: { in: ["PENDING", "APPROVED"] } }, _sum: { totalAmount: true } });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoice & Payment Tracking</h1>
          <p className="text-slate-500 text-sm mt-1">
            Total paid: ₹{(totalPaid?._sum?.amount ?? 0).toLocaleString("en-IN")} · Pending: ₹{(pendingAmount?._sum?.totalAmount ?? 0).toLocaleString("en-IN")}
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/invoices/new" />} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Invoice
        </Button>
      </div>
      <InvoicesTable invoices={invoices as never} isAdmin />
    </div>
  );
}
