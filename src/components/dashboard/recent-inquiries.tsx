import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import type { EventInquiry } from "@/generated/prisma/client";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  completed: "bg-purple-100 text-purple-700 border-purple-200",
};

export function RecentInquiries({ inquiries }: { inquiries: EventInquiry[] }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold text-slate-800">Recent Inquiries</CardTitle>
        <Link href="/dashboard/inquiries" className="text-xs text-primary font-medium hover:underline">
          View all →
        </Link>
      </CardHeader>
      <CardContent>
        {inquiries.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No inquiries yet</p>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{inquiry.clientName}</p>
                  <p className="text-xs text-slate-500">
                    {inquiry.eventType} · {format(new Date(inquiry.eventDate), "dd MMM yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  {inquiry.budget && (
                    <span className="text-xs font-medium text-slate-600">
                      ₹{inquiry.budget.toLocaleString("en-IN")}
                    </span>
                  )}
                  <Badge
                    variant="outline"
                    className={`text-xs capitalize ${statusColors[inquiry.status] ?? ""}`}
                  >
                    {inquiry.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
