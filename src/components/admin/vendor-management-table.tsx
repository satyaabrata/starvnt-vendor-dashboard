"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { approveVendor, rejectVendor } from "@/actions/vendor";
import { toast } from "sonner";
import { Search, CheckCircle, XCircle, Eye } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  PENDING:  "bg-amber-100 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
  SUSPENDED:"bg-orange-100 text-orange-700 border-orange-200",
};

interface Vendor {
  id: string; businessName: string; category: string; status: string; avgRating: number | null;
  user: { name: string | null; email: string; createdAt: Date };
  documents: { id: string }[];
  _count: { purchaseOrders: number; contracts: number; invoices: number };
}

export function VendorManagementTable({ vendors }: { vendors: Vendor[] }) {
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const filtered = vendors.filter((v) =>
    !search || v.businessName.toLowerCase().includes(search.toLowerCase()) || v.user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = (id: string) => startTransition(() => {
    approveVendor(id).then((r) => { r.success ? toast.success("Vendor approved!") : toast.error("Failed to approve"); });
  });

  const handleReject = (id: string) => {
    if (!rejectNote.trim()) { toast.error("Please add a rejection note"); return; }
    startTransition(() => {
      rejectVendor(id, rejectNote).then((r) => { if (r.success) { toast.success("Vendor rejected"); setRejectId(null); setRejectNote(""); } });
    });
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-5">
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search vendors…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {filtered.length === 0 ? (
          <p className="text-center py-12 text-slate-400 text-sm">No vendors found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                  <th className="pb-3 pr-4 font-medium">Vendor</th>
                  <th className="pb-3 pr-4 font-medium">Category</th>
                  <th className="pb-3 pr-4 font-medium">Documents</th>
                  <th className="pb-3 pr-4 font-medium">Orders / Contracts</th>
                  <th className="pb-3 pr-4 font-medium">Rating</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-800">{v.businessName}</p>
                      <p className="text-xs text-slate-400">{v.user.email}</p>
                      <p className="text-xs text-slate-400">{format(new Date(v.user.createdAt), "dd MMM yyyy")}</p>
                    </td>
                    <td className="py-3 pr-4 text-slate-600 text-xs">{v.category}</td>
                    <td className="py-3 pr-4">
                      <Badge variant="outline" className="text-xs">{v.documents.length} docs</Badge>
                    </td>
                    <td className="py-3 pr-4 text-xs text-slate-500">
                      {v._count.purchaseOrders} POs · {v._count.contracts} contracts
                    </td>
                    <td className="py-3 pr-4 text-xs font-medium text-slate-700">
                      {v.avgRating ? `⭐ ${v.avgRating.toFixed(1)}` : "—"}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant="outline" className={`text-xs capitalize ${STATUS_COLORS[v.status] ?? ""}`}>{v.status.toLowerCase()}</Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" nativeButton={false} render={<Link href={`/admin/vendors/${v.id}`} />} title="View">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {v.status === "PENDING" && (
                          <>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-emerald-600" onClick={() => handleApprove(v.id)} disabled={isPending} title="Approve">
                              <CheckCircle className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => setRejectId(v.id)} disabled={isPending} title="Reject">
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                        {v.status === "REJECTED" && (
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-emerald-600" onClick={() => handleApprove(v.id)} disabled={isPending} title="Re-approve">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                      {rejectId === v.id && (
                        <div className="mt-2 space-y-1.5 min-w-48">
                          <Input placeholder="Rejection reason…" value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} className="text-xs h-7" />
                          <div className="flex gap-1">
                            <Button size="sm" className="h-6 text-xs flex-1" onClick={() => handleReject(v.id)} disabled={isPending}>Confirm</Button>
                            <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => setRejectId(null)}>Cancel</Button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
