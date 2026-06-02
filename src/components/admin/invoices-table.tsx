"use client";

import { useState, useActionState, useTransition } from "react";
import { format, isPast } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { approveInvoice, recordPayment } from "@/actions/invoice";
import { toast } from "sonner";
import { CheckCircle, DollarSign } from "lucide-react";

const STATUS_COLORS: Record<string,string> = {
  PENDING:"bg-amber-100 text-amber-700",APPROVED:"bg-blue-100 text-blue-700",
  PAID:"bg-emerald-100 text-emerald-700",OVERDUE:"bg-red-100 text-red-700",CANCELLED:"bg-slate-100 text-slate-600",
};

interface Invoice { id:string;invoiceNumber:string;description:string|null;subtotal:number;tax:number;totalAmount:number;status:string;dueDate:Date|null;paidAt:Date|null;vendor:{businessName:string};purchaseOrder:{poNumber:string}|null;payments:{amount:number}[] }

export function InvoicesTable({ invoices, isAdmin }: { invoices: Invoice[]; isAdmin: boolean }) {
  const [payInvoiceId, setPayInvoiceId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [payState, payAction, payPending] = useActionState(recordPayment, undefined);

  const handleApprove = (id: string) => startTransition(async () => {
    await approveInvoice(id); toast.success("Invoice approved");
  });

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-5 overflow-x-auto">
          {invoices.length === 0 ? <p className="text-center py-12 text-slate-400 text-sm">No invoices yet.</p> : (
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-slate-500 border-b">
                <th className="pb-3 pr-4 text-left font-medium">Invoice No.</th>
                <th className="pb-3 pr-4 text-left font-medium">Vendor</th>
                <th className="pb-3 pr-4 text-left font-medium">PO</th>
                <th className="pb-3 pr-4 text-left font-medium">Amount</th>
                <th className="pb-3 pr-4 text-left font-medium">Due Date</th>
                <th className="pb-3 pr-4 text-left font-medium">Paid</th>
                <th className="pb-3 pr-4 text-left font-medium">Status</th>
                {isAdmin && <th className="pb-3 text-left font-medium">Actions</th>}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((inv) => {
                  const isOverdue = inv.dueDate && isPast(new Date(inv.dueDate)) && inv.status !== "PAID";
                  const paidSoFar = inv.payments.reduce((s, p) => s + p.amount, 0);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50">
                      <td className="py-3 pr-4 font-medium text-primary text-xs">{inv.invoiceNumber}</td>
                      <td className="py-3 pr-4 text-xs text-slate-700">{inv.vendor.businessName}</td>
                      <td className="py-3 pr-4 text-xs text-slate-500">{inv.purchaseOrder?.poNumber ?? "—"}</td>
                      <td className="py-3 pr-4 font-medium text-slate-800">₹{inv.totalAmount.toLocaleString("en-IN")}</td>
                      <td className="py-3 pr-4 text-xs">
                        {inv.dueDate ? <span className={isOverdue ? "text-red-600 font-medium" : "text-slate-500"}>{format(new Date(inv.dueDate), "dd MMM yyyy")}</span> : "—"}
                      </td>
                      <td className="py-3 pr-4 text-xs text-slate-500">
                        {paidSoFar > 0 ? `₹${paidSoFar.toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className={`text-xs capitalize ${STATUS_COLORS[isOverdue ? "OVERDUE" : inv.status] ?? ""}`}>
                          {(isOverdue ? "overdue" : inv.status.toLowerCase())}
                        </Badge>
                      </td>
                      {isAdmin && (
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            {inv.status === "PENDING" && (
                              <Button variant="ghost" size="sm" className="h-7 text-xs flex items-center gap-1 text-blue-600" onClick={() => handleApprove(inv.id)} disabled={isPending}>
                                <CheckCircle className="w-3 h-3" /> Approve
                              </Button>
                            )}
                            {["APPROVED","PENDING"].includes(inv.status) && paidSoFar < inv.totalAmount && (
                              <Button variant="ghost" size="sm" className="h-7 text-xs flex items-center gap-1 text-emerald-600" onClick={() => setPayInvoiceId(inv.id)}>
                                <DollarSign className="w-3 h-3" /> Pay
                              </Button>
                            )}
                          </div>
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

      <Dialog open={!!payInvoiceId} onOpenChange={(o) => !o && setPayInvoiceId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
          <form action={async (fd) => { fd.set("invoiceId", payInvoiceId!); await payAction(fd); toast.success("Payment recorded!"); setPayInvoiceId(null); }} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Amount (₹) *</Label>
              <Input name="amount" type="number" min={1} required />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Method *</Label>
              <Select name="method" required>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  {["Bank Transfer","UPI","NEFT","RTGS","Cheque","Cash","Other"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Reference / UTR No.</Label>
              <Input name="reference" placeholder="TXN123456" />
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Input name="notes" placeholder="Optional notes" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setPayInvoiceId(null)}>Cancel</Button>
              <Button type="submit" disabled={payPending}>{payPending ? "Recording…" : "Record Payment"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
