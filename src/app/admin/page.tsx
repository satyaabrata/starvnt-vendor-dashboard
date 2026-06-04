import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ShoppingCart, FileText, Receipt, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { addDays } from "date-fns";

export default async function AdminDashboardPage() {
  await verifyAdmin();

  const [
    totalVendors, pendingVendors,
    , totalPOs, activePOs,
    totalContracts, expiringContracts,
    , pendingInvoices, overdueInvoices,
    totalSpend, recentVendors,
  ] = await Promise.all([
    prisma.vendorProfile.count(),
    prisma.vendorProfile.count({ where: { status: "PENDING" } }),
    prisma.vendorProfile.count({ where: { status: "APPROVED" } }),
    prisma.purchaseOrder.count(),
    prisma.purchaseOrder.count({ where: { status: { in: ["SENT", "ACKNOWLEDGED", "IN_PROGRESS"] } } }),
    prisma.contract.count(),
    prisma.contract.count({ where: { status: "ACTIVE", endDate: { lte: addDays(new Date(), 30) } } }),
    prisma.invoice.count(),
    prisma.invoice.count({ where: { status: "PENDING" } }),
    prisma.invoice.count({ where: { status: "OVERDUE" } }),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.vendorProfile.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const stats = [
    { label: "Total Vendors", value: totalVendors, sub: `${pendingVendors} pending approval`, icon: Users, color: "text-blue-600", bg: "bg-blue-50", href: "/admin/vendors" },
    { label: "Purchase Orders", value: totalPOs, sub: `${activePOs} active`, icon: ShoppingCart, color: "text-purple-600", bg: "bg-purple-50", href: "/admin/purchase-orders" },
    { label: "Contracts", value: totalContracts, sub: `${expiringContracts} expiring soon`, icon: FileText, color: "text-amber-600", bg: "bg-amber-50", href: "/admin/contracts" },
    { label: "Total Paid", value: `₹${(totalSpend?._sum?.amount ?? 0).toLocaleString("en-IN")}`, sub: `${pendingInvoices} invoices pending`, icon: Receipt, color: "text-emerald-600", bg: "bg-emerald-50", href: "/admin/invoices" },
  ];

  const alerts = [
    pendingVendors > 0 && { type: "warning", msg: `${pendingVendors} vendor${pendingVendors > 1 ? "s" : ""} waiting for approval`, href: "/admin/vendors?status=PENDING" },
    expiringContracts > 0 && { type: "warning", msg: `${expiringContracts} contract${expiringContracts > 1 ? "s" : ""} expiring within 30 days`, href: "/admin/contracts?status=expiring" },
    overdueInvoices > 0 && { type: "error", msg: `${overdueInvoices} overdue invoice${overdueInvoices > 1 ? "s" : ""} need attention`, href: "/admin/invoices?status=OVERDUE" },
  ].filter(Boolean) as { type: string; msg: string; href: string }[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">StarVnt Vendor Management System</p>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a) => (
            <Link key={a.href} href={a.href}>
              <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm font-medium cursor-pointer sm:items-center ${a.type === "error" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="leading-5">{a.msg} →</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href}>
            <Card className="h-full cursor-pointer border-0 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="flex h-full items-start gap-3 p-4 sm:gap-4 sm:p-5">
                <div className={`${bg} ${color} mt-0.5 rounded-xl p-3 shrink-0`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="break-words text-[clamp(1.75rem,6vw,2.25rem)] font-bold leading-[1.05] tracking-tight text-slate-900">
                    {value}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-5 text-slate-700 sm:text-[0.95rem]">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">{sub}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-slate-800">Recent Vendors</CardTitle>
            <Link href="/admin/vendors" className="text-xs text-primary font-medium hover:underline">View all →</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentVendors.map((v) => (
                <Link key={v.id} href={`/admin/vendors/${v.id}`}>
                  <div className="flex flex-col gap-3 rounded-lg bg-slate-50 p-3 transition-colors hover:bg-slate-100 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800 sm:text-base">{v.businessName}</p>
                      <p className="break-all text-xs text-slate-500 sm:text-sm">{v.category} · {v.user.email}</p>
                    </div>
                    <Badge variant="outline" className={`text-xs capitalize ${
                      v.status === "APPROVED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      v.status === "REJECTED" ? "bg-red-50 text-red-700 border-red-200" :
                      v.status === "SUSPENDED" ? "bg-orange-50 text-orange-700 border-orange-200" :
                      "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {v.status.toLowerCase()}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-800">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Add Vendor", href: "/admin/vendors/new", icon: Users, color: "bg-blue-50 text-blue-700" },
                { label: "Create PO", href: "/admin/purchase-orders/new", icon: ShoppingCart, color: "bg-purple-50 text-purple-700" },
                { label: "New Contract", href: "/admin/contracts/new", icon: FileText, color: "bg-amber-50 text-amber-700" },
                { label: "View Reports", href: "/admin/reports", icon: Receipt, color: "bg-emerald-50 text-emerald-700" },
              ].map(({ label, href, icon: Icon, color }) => (
                <Link key={href} href={href}>
                  <div className={`${color} flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl p-4 text-center cursor-pointer transition-opacity hover:opacity-80`}>
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-semibold leading-5">{label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
