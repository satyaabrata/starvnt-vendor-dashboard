import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { InvoicesTable } from "@/components/admin/invoices-table";

export default async function VendorInvoicesPage() {
  const session = await verifySession();
  const profile = await prisma.vendorProfile.findUnique({ where: { userId: session.userId } });
  const invoices = profile ? await prisma.invoice.findMany({
    where: { vendorId: profile.id },
    orderBy: { createdAt: "desc" },
    include: { vendor: { select: { businessName: true } }, purchaseOrder: { select: { poNumber: true } }, payments: true },
  }) : [];
  const totalReceived = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.totalAmount, 0);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Invoices</h1>
        <p className="text-slate-500 text-sm mt-1">Total received: ₹{totalReceived.toLocaleString("en-IN")}</p>
      </div>
      <InvoicesTable invoices={invoices as never} isAdmin={false} />
    </div>
  );
}
