"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createInvoice } from "@/actions/invoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export function CreateInvoiceForm({ vendors, pos }: { vendors: { id: string; businessName: string }[]; pos: { id: string; poNumber: string; title: string; vendorId: string }[] }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createInvoice, undefined);
  useEffect(() => {
    if (state?.success) { toast.success(state.message); router.push("/admin/invoices"); }
    if (state?.message && !state.success) toast.error(state.message);
  }, [state, router]);

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-6">
        <form action={action} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Vendor *</Label>
              <Select name="vendorId" required>
                <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                <SelectContent>{vendors.map((v) => <SelectItem key={v.id} value={v.id}>{v.businessName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Linked Purchase Order</Label>
              <Select name="poId">
                <SelectTrigger><SelectValue placeholder="Select PO (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {pos.map((p) => <SelectItem key={p.id} value={p.id}>{p.poNumber} — {p.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Description</Label>
              <Input name="description" placeholder="Invoice description" />
            </div>
            <div className="space-y-1.5">
              <Label>Subtotal (₹) *</Label>
              <Input name="subtotal" type="number" min={0} required placeholder="50000" />
              {state?.errors?.subtotal && <p className="text-xs text-red-500">{state.errors.subtotal[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Tax (%)</Label>
              <Input name="tax" type="number" min={0} max={100} defaultValue={18} />
            </div>
            <div className="space-y-1.5">
              <Label>Due Date</Label>
              <Input name="dueDate" type="date" />
            </div>
            <div className="space-y-1.5">
              <Label>Invoice File URL</Label>
              <Input name="fileUrl" type="url" placeholder="https://…" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Notes</Label>
              <Input name="notes" placeholder="Payment terms, bank details…" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create Invoice"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
