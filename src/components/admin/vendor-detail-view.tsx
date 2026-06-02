"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { approveVendor, rejectVendor, verifyDocument } from "@/actions/vendor";
import { createReview } from "@/actions/performance";
import { toast } from "sonner";
import { CheckCircle, XCircle, Star, MapPin, Phone, Mail, Globe, FileCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STATUS_COLORS: Record<string, string> = {
  PENDING:  "bg-amber-100 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
  SUSPENDED:"bg-orange-100 text-orange-700 border-orange-200",
};

function StarRating({ name, label }: { name: string; label: string }) {
  const [val, setVal] = useState(0);
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-1">
        {[1,2,3,4,5].map((s) => (
          <button key={s} type="button" onClick={() => setVal(s)} className={`text-lg ${s <= val ? "text-amber-400" : "text-slate-300"}`}>★</button>
        ))}
        <input type="hidden" name={name} value={val} />
      </div>
    </div>
  );
}

export function VendorDetailView({ vendor }: { vendor: never }) {
  const v = vendor as {
    id: string; businessName: string; category: string; status: string;
    description: string | null; location: string | null; phone: string | null;
    contactEmail: string | null; website: string | null; gstNumber: string | null;
    panNumber: string | null; licenseNumber: string | null;
    pricingMin: number | null; pricingMax: number | null;
    avgRating: number | null; totalRatings: number; rejectionNote: string | null;
    user: { name: string | null; email: string; createdAt: Date };
    documents: { id: string; type: string; name: string; fileUrl: string; expiryDate: Date | null; isVerified: boolean }[];
    purchaseOrders: { id: string; poNumber: string; title: string; status: string; totalAmount: number; orderDate: Date }[];
    contracts: { id: string; contractNumber: string; title: string; status: string; endDate: Date; value: number | null }[];
    invoices: { id: string; invoiceNumber: string; totalAmount: number; status: string; dueDate: Date | null }[];
    performanceReviews: { id: string; overallRating: number; comment: string | null; reviewedBy: string | null; reviewedAt: Date }[];
  };

  const [isPending, startTransition] = useTransition();
  const [rejectNote, setRejectNote] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [reviewState, reviewAction, reviewPending] = useActionState(createReview, undefined);

  const handleApprove = () => startTransition(() => {
    approveVendor(v.id).then((r) => { r.success ? toast.success("Vendor approved!") : toast.error("Failed"); });
  });

  const handleReject = () => {
    if (!rejectNote.trim()) { toast.error("Add a rejection reason"); return; }
    startTransition(() => {
      rejectVendor(v.id, rejectNote).then(() => { toast.success("Vendor rejected"); setShowReject(false); });
    });
  };

  const handleVerifyDoc = (docId: string) => startTransition(() => {
    verifyDocument(docId).then(() => toast.success("Document verified"));
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/vendors" className="text-sm text-slate-500 hover:text-slate-700">← Vendors</Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-2xl font-bold text-slate-900">{v.businessName}</h1>
          <Badge variant="outline" className={`text-xs capitalize ${STATUS_COLORS[v.status]}`}>{v.status.toLowerCase()}</Badge>
        </div>
        <div className="flex gap-2">
          {v.status === "PENDING" && (
            <>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5" onClick={handleApprove} disabled={isPending}>
                <CheckCircle className="w-3.5 h-3.5" /> Approve
              </Button>
              <Button size="sm" variant="outline" className="text-red-600 border-red-200 flex items-center gap-1.5" onClick={() => setShowReject(!showReject)} disabled={isPending}>
                <XCircle className="w-3.5 h-3.5" /> Reject
              </Button>
            </>
          )}
        </div>
      </div>

      {showReject && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <Input placeholder="Rejection reason (will be shown to vendor)…" value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} className="flex-1" />
          <Button size="sm" onClick={handleReject} disabled={isPending} className="bg-red-600 hover:bg-red-700">Confirm Reject</Button>
        </div>
      )}

      {v.rejectionNote && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          <strong>Rejection note:</strong> {v.rejectionNote}
        </div>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents ({v.documents.length})</TabsTrigger>
          <TabsTrigger value="orders">Orders ({v.purchaseOrders.length})</TabsTrigger>
          <TabsTrigger value="contracts">Contracts ({v.contracts.length})</TabsTrigger>
          <TabsTrigger value="invoices">Invoices ({v.invoices.length})</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Business Details</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[["Category", v.category], ["GST No.", v.gstNumber], ["PAN No.", v.panNumber], ["License", v.licenseNumber]].map(([l, val]) => val && (
                  <div key={l} className="flex justify-between"><span className="text-slate-500">{l}</span><span className="font-medium text-slate-800">{val}</span></div>
                ))}
                {v.pricingMin && <div className="flex justify-between"><span className="text-slate-500">Pricing</span><span className="font-medium">₹{v.pricingMin?.toLocaleString("en-IN")} – ₹{v.pricingMax?.toLocaleString("en-IN")}</span></div>}
                {v.avgRating && <div className="flex justify-between"><span className="text-slate-500">Rating</span><span className="font-medium">⭐ {v.avgRating.toFixed(1)} ({v.totalRatings} reviews)</span></div>}
                <Separator />
                {v.location && <div className="flex items-center gap-2 text-slate-600"><MapPin className="w-3.5 h-3.5" />{v.location}</div>}
                {v.phone && <div className="flex items-center gap-2 text-slate-600"><Phone className="w-3.5 h-3.5" />{v.phone}</div>}
                {v.contactEmail && <div className="flex items-center gap-2 text-slate-600"><Mail className="w-3.5 h-3.5" />{v.contactEmail}</div>}
                {v.website && <div className="flex items-center gap-2 text-slate-600"><Globe className="w-3.5 h-3.5" /><a href={v.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{v.website}</a></div>}
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Description</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">{v.description ?? "No description provided."}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5 space-y-3">
              {v.documents.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">No documents uploaded.</p> : v.documents.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{d.name}</p>
                    <p className="text-xs text-slate-500">{d.type} {d.expiryDate ? `· Expires ${format(new Date(d.expiryDate), "dd MMM yyyy")}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">View</a>
                    {d.isVerified ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs flex items-center gap-1"><FileCheck className="w-3 h-3" /> Verified</Badge>
                    ) : (
                      <Button size="sm" className="h-6 text-xs" onClick={() => handleVerifyDoc(d.id)} disabled={isPending}>Verify</Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <Card className="border-0 shadow-sm"><CardContent className="pt-5 overflow-x-auto">
            {v.purchaseOrders.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">No purchase orders.</p> : (
              <table className="w-full text-sm"><thead><tr className="text-xs text-slate-500 border-b"><th className="pb-3 pr-4 text-left font-medium">PO Number</th><th className="pb-3 pr-4 text-left font-medium">Title</th><th className="pb-3 pr-4 text-left font-medium">Amount</th><th className="pb-3 text-left font-medium">Status</th></tr></thead>
              <tbody className="divide-y divide-slate-50">{v.purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 pr-4 text-primary font-medium">{po.poNumber}</td>
                  <td className="py-2.5 pr-4 text-slate-700">{po.title}</td>
                  <td className="py-2.5 pr-4 text-slate-700">₹{po.totalAmount.toLocaleString("en-IN")}</td>
                  <td className="py-2.5"><Badge variant="outline" className="text-xs capitalize">{po.status.toLowerCase()}</Badge></td>
                </tr>))}</tbody></table>)}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="contracts" className="mt-4">
          <Card className="border-0 shadow-sm"><CardContent className="pt-5 overflow-x-auto">
            {v.contracts.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">No contracts.</p> : (
              <table className="w-full text-sm"><thead><tr className="text-xs text-slate-500 border-b"><th className="pb-3 pr-4 text-left font-medium">Contract No.</th><th className="pb-3 pr-4 text-left font-medium">Title</th><th className="pb-3 pr-4 text-left font-medium">End Date</th><th className="pb-3 text-left font-medium">Status</th></tr></thead>
              <tbody className="divide-y divide-slate-50">{v.contracts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 pr-4 text-primary font-medium">{c.contractNumber}</td>
                  <td className="py-2.5 pr-4 text-slate-700">{c.title}</td>
                  <td className="py-2.5 pr-4 text-slate-700">{format(new Date(c.endDate), "dd MMM yyyy")}</td>
                  <td className="py-2.5"><Badge variant="outline" className="text-xs capitalize">{c.status.toLowerCase()}</Badge></td>
                </tr>))}</tbody></table>)}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <Card className="border-0 shadow-sm"><CardContent className="pt-5 overflow-x-auto">
            {v.invoices.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">No invoices.</p> : (
              <table className="w-full text-sm"><thead><tr className="text-xs text-slate-500 border-b"><th className="pb-3 pr-4 text-left font-medium">Invoice No.</th><th className="pb-3 pr-4 text-left font-medium">Amount</th><th className="pb-3 pr-4 text-left font-medium">Due Date</th><th className="pb-3 text-left font-medium">Status</th></tr></thead>
              <tbody className="divide-y divide-slate-50">{v.invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 pr-4 text-primary font-medium">{inv.invoiceNumber}</td>
                  <td className="py-2.5 pr-4 text-slate-700">₹{inv.totalAmount.toLocaleString("en-IN")}</td>
                  <td className="py-2.5 pr-4 text-slate-700">{inv.dueDate ? format(new Date(inv.dueDate), "dd MMM yyyy") : "—"}</td>
                  <td className="py-2.5"><Badge variant="outline" className="text-xs capitalize">{inv.status.toLowerCase()}</Badge></td>
                </tr>))}</tbody></table>)}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Add Performance Review</CardTitle></CardHeader>
              <CardContent>
                <form action={reviewAction} className="space-y-4">
                  <input type="hidden" name="vendorId" value={v.id} />
                  <StarRating name="overallRating" label="Overall Rating *" />
                  <StarRating name="deliveryScore" label="Delivery" />
                  <StarRating name="qualityScore" label="Quality" />
                  <StarRating name="communicationScore" label="Communication" />
                  <div className="space-y-1.5">
                    <Label htmlFor="comment" className="text-xs">Comment</Label>
                    <textarea id="comment" name="comment" rows={3} placeholder="Write your review…" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
                  </div>
                  <Button type="submit" size="sm" disabled={reviewPending} className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5" /> {reviewPending ? "Submitting…" : "Submit Review"}
                  </Button>
                  {reviewState?.success && <p className="text-xs text-emerald-600">{reviewState.message}</p>}
                </form>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Review History</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {v.performanceReviews.length === 0 ? <p className="text-sm text-slate-400 text-center py-6">No reviews yet.</p> : v.performanceReviews.map((r) => (
                  <div key={r.id} className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-amber-500">{"★".repeat(r.overallRating)}{"☆".repeat(5 - r.overallRating)}</span>
                      <span className="text-xs text-slate-400">{format(new Date(r.reviewedAt), "dd MMM yyyy")}</span>
                    </div>
                    {r.comment && <p className="text-xs text-slate-600 mt-1">{r.comment}</p>}
                    {r.reviewedBy && <p className="text-xs text-slate-400 mt-1">by {r.reviewedBy}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
