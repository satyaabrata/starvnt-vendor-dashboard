import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComplianceActions } from "@/components/admin/compliance-actions";
import { addDays, format, isPast } from "date-fns";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default async function AdminCompliancePage() {
  await verifyAdmin();
  const documents = await prisma.vendorDocument.findMany({
    orderBy: { createdAt: "desc" },
    include: { vendor: { select: { businessName: true, id: true } } },
  });

  const expiringSoon = documents.filter((d) => d.expiryDate && !isPast(d.expiryDate) && d.expiryDate <= addDays(new Date(), 30));
  const expired = documents.filter((d) => d.expiryDate && isPast(d.expiryDate));
  const unverified = documents.filter((d) => !d.isVerified);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Compliance Management</h1>
        <p className="text-slate-500 text-sm mt-1">Track document validity and certifications</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Expired Documents", count: expired.length, icon: AlertTriangle, color: "text-red-600 bg-red-50" },
          { label: "Expiring in 30 days", count: expiringSoon.length, icon: Clock, color: "text-amber-600 bg-amber-50" },
          { label: "Awaiting Verification", count: unverified.length, icon: CheckCircle, color: "text-blue-600 bg-blue-50" },
        ].map(({ label, count, icon: Icon, color }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`${color} p-3 rounded-xl`}><Icon className="w-5 h-5" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{count}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-800">All Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b">
                  <th className="pb-3 pr-4 text-left font-medium">Vendor</th>
                  <th className="pb-3 pr-4 text-left font-medium">Document</th>
                  <th className="pb-3 pr-4 text-left font-medium">Type</th>
                  <th className="pb-3 pr-4 text-left font-medium">Expiry</th>
                  <th className="pb-3 pr-4 text-left font-medium">Verified</th>
                  <th className="pb-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {documents.map((doc) => {
                  const isExpired = doc.expiryDate && isPast(doc.expiryDate);
                  const isExpiringSoon = doc.expiryDate && !isExpired && doc.expiryDate <= addDays(new Date(), 30);
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/50">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-slate-800 text-xs">{doc.vendor.businessName}</p>
                      </td>
                      <td className="py-3 pr-4 text-slate-600 text-xs">{doc.name}</td>
                      <td className="py-3 pr-4"><Badge variant="outline" className="text-xs">{doc.type}</Badge></td>
                      <td className="py-3 pr-4 text-xs">
                        {doc.expiryDate ? (
                          <span className={isExpired ? "text-red-600 font-medium" : isExpiringSoon ? "text-amber-600 font-medium" : "text-slate-600"}>
                            {format(new Date(doc.expiryDate), "dd MMM yyyy")}
                            {isExpired ? " (EXPIRED)" : isExpiringSoon ? " (soon)" : ""}
                          </span>
                        ) : "No expiry"}
                      </td>
                      <td className="py-3 pr-4">
                        {doc.isVerified ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">Verified</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-slate-500">Unverified</Badge>
                        )}
                      </td>
                      <td className="py-3">
                        <ComplianceActions docId={doc.id} fileUrl={doc.fileUrl} isVerified={doc.isVerified} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
