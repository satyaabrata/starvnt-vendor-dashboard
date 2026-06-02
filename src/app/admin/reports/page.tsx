import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { ReportsDashboard } from "@/components/admin/reports-dashboard";
import { subMonths, startOfMonth, format } from "date-fns";

export default async function ReportsPage() {
  await verifyAdmin();

  const [
    spendByVendor, monthlySpend, categoryBreakdown,
    invoiceStats, poStats, contractStats,
  ] = await Promise.all([
    // Top vendors by spend
    prisma.vendorProfile.findMany({
      select: { id: true, businessName: true, category: true, avgRating: true, _count: { select: { purchaseOrders: true } }, invoices: { select: { totalAmount: true, status: true } } },
      orderBy: { avgRating: { sort: "desc", nulls: "last" } },
      take: 10,
    }),
    // Monthly spend (last 6 months)
    Promise.all(Array.from({ length: 6 }, (_, i) => {
      const month = subMonths(new Date(), 5 - i);
      const start = startOfMonth(month);
      const end = startOfMonth(subMonths(month, -1));
      return prisma.payment.aggregate({ where: { paidAt: { gte: start, lt: end } }, _sum: { amount: true } })
        .then((r) => ({ month: format(month, "MMM"), amount: r._sum.amount ?? 0 }));
    })),
    // Vendor category breakdown
    prisma.vendorProfile.groupBy({ by: ["category"], _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
    // Invoice stats
    prisma.invoice.groupBy({ by: ["status"], _count: { id: true }, _sum: { totalAmount: true } }),
    // PO stats
    prisma.purchaseOrder.groupBy({ by: ["status"], _count: { id: true }, _sum: { totalAmount: true } }),
    // Contract stats
    prisma.contract.groupBy({ by: ["status"], _count: { id: true } }),
  ]);

  const vendorSpend = spendByVendor.map((v) => ({
    ...v,
    totalSpend: v.invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.totalAmount, 0),
    pendingAmount: v.invoices.filter((i) => ["PENDING","APPROVED"].includes(i.status)).reduce((s, i) => s + i.totalAmount, 0),
  }));

  return <ReportsDashboard vendorSpend={vendorSpend} monthlySpend={monthlySpend} categoryBreakdown={categoryBreakdown as never} invoiceStats={invoiceStats as never} poStats={poStats as never} contractStats={contractStats as never} />;
}
