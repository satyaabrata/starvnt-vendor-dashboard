"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updatePOStatus, acknowledgePO } from "@/actions/purchase-order";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  DRAFT:"bg-slate-100 text-slate-700",SENT:"bg-blue-100 text-blue-700",
  ACKNOWLEDGED:"bg-purple-100 text-purple-700",IN_PROGRESS:"bg-amber-100 text-amber-700",
  DELIVERED:"bg-emerald-100 text-emerald-700",CANCELLED:"bg-red-100 text-red-700",
};

interface PO { id:string;poNumber:string;title:string;status:string;totalAmount:number;orderDate:Date;expectedDate:Date|null;vendor:{businessName:string} }

export function PurchaseOrdersTable({ pos, isAdmin }: { pos: PO[]; isAdmin: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleStatus = (id: string, status: string) => startTransition(async () => {
    const r = await updatePOStatus(id, status);
    r.success ? toast.success("Status updated") : toast.error(r.message);
  });

  const handleAck = (id: string) => startTransition(async () => {
    await acknowledgePO(id);
    toast.success("PO acknowledged");
  });

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-5 overflow-x-auto">
        {pos.length === 0 ? <p className="text-center py-12 text-slate-400 text-sm">No purchase orders yet.</p> : (
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-slate-500 border-b">
              <th className="pb-3 pr-4 text-left font-medium">PO Number</th>
              <th className="pb-3 pr-4 text-left font-medium">Vendor</th>
              <th className="pb-3 pr-4 text-left font-medium">Title</th>
              <th className="pb-3 pr-4 text-left font-medium">Amount</th>
              <th className="pb-3 pr-4 text-left font-medium">Order Date</th>
              <th className="pb-3 pr-4 text-left font-medium">Expected</th>
              <th className="pb-3 pr-4 text-left font-medium">Status</th>
              {isAdmin && <th className="pb-3 text-left font-medium">Update</th>}
              {!isAdmin && <th className="pb-3 text-left font-medium">Actions</th>}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {pos.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50/50">
                  <td className="py-3 pr-4 font-medium text-primary text-xs">{po.poNumber}</td>
                  <td className="py-3 pr-4 text-slate-700 text-xs">{po.vendor.businessName}</td>
                  <td className="py-3 pr-4 text-slate-700">{po.title}</td>
                  <td className="py-3 pr-4 font-medium text-slate-800">₹{po.totalAmount.toLocaleString("en-IN")}</td>
                  <td className="py-3 pr-4 text-slate-500 text-xs whitespace-nowrap">{format(new Date(po.orderDate), "dd MMM yyyy")}</td>
                  <td className="py-3 pr-4 text-slate-500 text-xs whitespace-nowrap">{po.expectedDate ? format(new Date(po.expectedDate), "dd MMM yyyy") : "—"}</td>
                  <td className="py-3 pr-4">
                    <Badge variant="outline" className={`text-xs capitalize ${STATUS_COLORS[po.status] ?? ""}`}>{po.status.toLowerCase().replace("_"," ")}</Badge>
                  </td>
                  {isAdmin && (
                    <td className="py-3">
                      <Select value={po.status} onValueChange={(v) => v && v !== po.status && handleStatus(po.id, v)}>
                        <SelectTrigger className="h-7 text-xs w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["DRAFT","SENT","ACKNOWLEDGED","IN_PROGRESS","DELIVERED","CANCELLED"].map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">{s.toLowerCase().replace("_"," ")}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  )}
                  {!isAdmin && po.status === "SENT" && (
                    <td className="py-3">
                      <Button size="sm" className="h-7 text-xs" onClick={() => handleAck(po.id)} disabled={isPending}>Acknowledge</Button>
                    </td>
                  )}
                  {!isAdmin && po.status !== "SENT" && <td className="py-3" />}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
