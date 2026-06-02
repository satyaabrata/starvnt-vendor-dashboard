import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import type { EventInquiry } from "@/generated/prisma/client";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { InquiriesLineChart } from "@/components/dashboard/inquiries-line-chart";
import { StatusDonutChart } from "@/components/dashboard/status-donut-chart";
import { RecentInquiries } from "@/components/dashboard/recent-inquiries";
import { format, subMonths, startOfMonth } from "date-fns";

export default async function DashboardPage() {
  const session = await verifySession();

  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: session.userId },
    include: {
      inquiries: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const inquiries: EventInquiry[] = profile?.inquiries ?? [];

  const totalInquiries = inquiries.length;
  const confirmed = inquiries.filter((i) => i.status === "confirmed").length;
  const pending = inquiries.filter((i) => i.status === "pending").length;
  const totalRevenue = inquiries
    .filter((i) => i.status === "confirmed" && i.budget)
    .reduce((sum, i) => sum + (i.budget ?? 0), 0);

  const monthlyData = Array.from({ length: 6 }, (_, idx) => {
    const month = subMonths(new Date(), 5 - idx);
    const start = startOfMonth(month);
    const end = startOfMonth(subMonths(month, -1));
    const count = inquiries.filter(
      (i) => i.createdAt >= start && i.createdAt < end
    ).length;
    return { month: format(month, "MMM"), count };
  });

  const statusData = [
    { name: "Pending", value: pending, color: "#f59e0b" },
    { name: "Confirmed", value: confirmed, color: "#10b981" },
    { name: "Rejected", value: inquiries.filter((i) => i.status === "rejected").length, color: "#ef4444" },
    { name: "Completed", value: inquiries.filter((i) => i.status === "completed").length, color: "#6366f1" },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {session.name ?? "Vendor"} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Here&apos;s what&apos;s happening with your bookings
        </p>
      </div>

      <StatsCards
        totalInquiries={totalInquiries}
        confirmed={confirmed}
        pending={pending}
        totalRevenue={totalRevenue}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InquiriesLineChart data={monthlyData} />
        </div>
        <div>
          <StatusDonutChart data={statusData} total={totalInquiries} />
        </div>
      </div>

      <RecentInquiries inquiries={inquiries.slice(0, 5)} />
    </div>
  );
}
