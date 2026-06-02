"use client";

import { useTransition } from "react";
import { format, isPast, differenceInDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateContractStatus } from "@/actions/contract";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  DRAFT:"bg-slate-100 text-slate-700",ACTIVE:"bg-emerald-100 text-emerald-700",
  EXPIRED:"bg-red-100 text-red-700",TERMINATED:"bg-orange-100 text-orange-700",
};

interface Contract { id:string;contractNumber:string;title:string;status:string;value:number|null;startDate:Date;endDate:Date;vendor:{businessName:string} }

export function ContractsTable({ contracts, isAdmin }: { contracts: Contract[]; isAdmin: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleStatus = (id: string, status: string) => startTransition(async () => {
    await updateContractStatus(id, status);
    toast.success("Contract status updated");
  });

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-5 overflow-x-auto">
        {contracts.length === 0 ? <p className="text-center py-12 text-slate-400 text-sm">No contracts yet.</p> : (
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-slate-500 border-b">
              <th className="pb-3 pr-4 text-left font-medium">Contract No.</th>
              <th className="pb-3 pr-4 text-left font-medium">Vendor</th>
              <th className="pb-3 pr-4 text-left font-medium">Title</th>
              <th className="pb-3 pr-4 text-left font-medium">Value</th>
              <th className="pb-3 pr-4 text-left font-medium">End Date</th>
              <th className="pb-3 pr-4 text-left font-medium">Days Left</th>
              <th className="pb-3 pr-4 text-left font-medium">Status</th>
              {isAdmin && <th className="pb-3 text-left font-medium">Update</th>}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {contracts.map((c) => {
                const daysLeft = differenceInDays(new Date(c.endDate), new Date());
                const isExpired = isPast(new Date(c.endDate));
                return (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="py-3 pr-4 font-medium text-primary text-xs">{c.contractNumber}</td>
                    <td className="py-3 pr-4 text-slate-700 text-xs">{c.vendor.businessName}</td>
                    <td className="py-3 pr-4 text-slate-700">{c.title}</td>
                    <td className="py-3 pr-4 text-slate-700">{c.value ? `₹${c.value.toLocaleString("en-IN")}` : "—"}</td>
                    <td className="py-3 pr-4 text-slate-500 text-xs whitespace-nowrap">{format(new Date(c.endDate), "dd MMM yyyy")}</td>
                    <td className="py-3 pr-4 text-xs">
                      <span className={isExpired ? "text-red-600 font-medium" : daysLeft <= 30 ? "text-amber-600 font-medium" : "text-slate-500"}>
                        {isExpired ? "Expired" : `${daysLeft}d`}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant="outline" className={`text-xs capitalize ${STATUS_COLORS[c.status] ?? ""}`}>{c.status.toLowerCase()}</Badge>
                    </td>
                    {isAdmin && (
                      <td className="py-3">
                        <Select value={c.status} onValueChange={(v) => v && v !== c.status && handleStatus(c.id, v)}>
                          <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["DRAFT","ACTIVE","EXPIRED","TERMINATED"].map((s) => (
                              <SelectItem key={s} value={s} className="text-xs capitalize">{s.toLowerCase()}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
