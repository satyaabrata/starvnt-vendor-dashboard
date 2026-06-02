import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";

export default async function AdminPerformancePage() {
  await verifyAdmin();
  const vendors = await prisma.vendorProfile.findMany({
    where: { status: "APPROVED" },
    include: { performanceReviews: { orderBy: { createdAt: "desc" } } },
    orderBy: { avgRating: { sort: "desc", nulls: "last" } },
  });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Performance Evaluation</h1>
        <p className="text-slate-500 text-sm mt-1">Vendor ratings and review history</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {vendors.map((v) => (
          <Card key={v.id} className="border-0 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">{v.businessName}</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">{v.category}</p>
              </div>
              <div className="text-right">
                {v.avgRating ? (
                  <>
                    <p className="text-xl font-bold text-amber-500">{"★".repeat(Math.round(v.avgRating))}</p>
                    <p className="text-xs text-slate-500">{v.avgRating.toFixed(1)} ({v.totalRatings} reviews)</p>
                  </>
                ) : <p className="text-xs text-slate-400">No reviews</p>}
              </div>
            </CardHeader>
            <CardContent>
              {v.performanceReviews.slice(0, 2).map((r) => (
                <div key={r.id} className="bg-slate-50 rounded-lg p-3 mb-2 text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="text-amber-500">{"★".repeat(r.overallRating)}{"☆".repeat(5 - r.overallRating)}</span>
                    <span className="text-slate-400">{format(new Date(r.reviewedAt), "dd MMM yyyy")}</span>
                  </div>
                  {r.comment && <p className="text-slate-600">{r.comment}</p>}
                  <div className="flex gap-3 mt-1.5 text-slate-400">
                    {r.deliveryScore && <span>Delivery: {r.deliveryScore}/5</span>}
                    {r.qualityScore && <span>Quality: {r.qualityScore}/5</span>}
                    {r.communicationScore && <span>Comm: {r.communicationScore}/5</span>}
                  </div>
                </div>
              ))}
              <Link href={`/admin/vendors/${v.id}?tab=performance`} className="text-xs text-primary hover:underline">
                View all reviews → Add review
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
