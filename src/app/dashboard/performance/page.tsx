import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default async function VendorPerformancePage() {
  const session = await verifySession();
  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: session.userId },
    include: { performanceReviews: { orderBy: { createdAt: "desc" } } },
  });

  const reviews = profile?.performanceReviews ?? [];
  const avgDelivery = reviews.filter((r) => r.deliveryScore).reduce((s, r) => s + (r.deliveryScore ?? 0), 0) / (reviews.filter((r) => r.deliveryScore).length || 1);
  const avgQuality = reviews.filter((r) => r.qualityScore).reduce((s, r) => s + (r.qualityScore ?? 0), 0) / (reviews.filter((r) => r.qualityScore).length || 1);
  const avgComm = reviews.filter((r) => r.communicationScore).reduce((s, r) => s + (r.communicationScore ?? 0), 0) / (reviews.filter((r) => r.communicationScore).length || 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Performance</h1>
        <p className="text-slate-500 text-sm mt-1">{reviews.length} reviews · Overall: {profile?.avgRating ? `⭐ ${profile.avgRating.toFixed(1)}/5` : "No reviews yet"}</p>
      </div>

      {profile?.avgRating && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Overall", value: profile.avgRating },
            { label: "Delivery", value: avgDelivery },
            { label: "Quality", value: avgQuality },
            { label: "Communication", value: avgComm },
          ].map(({ label, value }) => (
            <Card key={label} className="border-0 shadow-sm text-center">
              <CardContent className="pt-5 pb-4">
                <p className="text-3xl font-bold text-amber-500">{value.toFixed(1)}</p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
                <div className="flex justify-center gap-0.5 mt-1.5">
                  {[1,2,3,4,5].map((s) => <span key={s} className={`text-sm ${s <= Math.round(value) ? "text-amber-400" : "text-slate-200"}`}>★</span>)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-base font-semibold text-slate-800">All Reviews</CardTitle></CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No performance reviews yet. Complete events to receive ratings.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-amber-500 text-lg">{"★".repeat(r.overallRating)}{"☆".repeat(5 - r.overallRating)}</span>
                      {r.reviewedBy && <p className="text-xs text-slate-400 mt-0.5">Reviewed by {r.reviewedBy}</p>}
                    </div>
                    <p className="text-xs text-slate-400">{format(new Date(r.reviewedAt), "dd MMM yyyy")}</p>
                  </div>
                  {r.comment && <p className="text-sm text-slate-700">{r.comment}</p>}
                  <div className="flex gap-4 mt-2 text-xs text-slate-500">
                    {r.deliveryScore && <span>Delivery: {r.deliveryScore}/5</span>}
                    {r.qualityScore && <span>Quality: {r.qualityScore}/5</span>}
                    {r.communicationScore && <span>Communication: {r.communicationScore}/5</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
