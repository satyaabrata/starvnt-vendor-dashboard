import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Bell } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  CONTRACT_EXPIRY: "bg-amber-100 text-amber-700",
  DOCUMENT_EXPIRY: "bg-red-100 text-red-700",
  INVOICE_DUE: "bg-orange-100 text-orange-700",
  NEW_INQUIRY: "bg-blue-100 text-blue-700",
  PO_UPDATE: "bg-purple-100 text-purple-700",
  VENDOR_APPROVED: "bg-emerald-100 text-emerald-700",
  VENDOR_REJECTED: "bg-red-100 text-red-700",
  GENERAL: "bg-slate-100 text-slate-700",
};

export default async function AdminNotificationsPage() {
  const session = await verifyAdmin();
  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        <p className="text-slate-500 text-sm mt-1">{notifications.filter((n) => !n.isRead).length} unread</p>
      </div>
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-5">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No notifications yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <div key={n.id} className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${n.isRead ? "bg-slate-50" : "bg-blue-50/50 border border-blue-100"}`}>
                  <div className="mt-0.5">
                    <Badge className={`text-xs ${TYPE_COLORS[n.type] ?? "bg-slate-100 text-slate-700"}`}>
                      {n.type.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${n.isRead ? "text-slate-700" : "text-slate-900"}`}>{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                  </div>
                  <p className="text-xs text-slate-400 whitespace-nowrap shrink-0">{format(new Date(n.createdAt), "dd MMM, HH:mm")}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
