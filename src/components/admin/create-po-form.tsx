"use client";

import { useActionState, useState } from "react";
import { createPurchaseOrder } from "@/actions/purchase-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface POItem { name: string; qty: number; unitPrice: number; total: number }

export function CreatePOForm({ vendors }: { vendors: { id: string; businessName: string; category: string }[] }) {
  const [items, setItems] = useState<POItem[]>([{ name: "", qty: 1, unitPrice: 0, total: 0 }]);
  const [tax, setTax] = useState(0);
  const router = useRouter();

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const taxAmt = (subtotal * tax) / 100;
  const total = subtotal + taxAmt;

  const updateItem = (idx: number, field: keyof POItem, val: string) => {
    setItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: field === "name" ? val : parseFloat(val) || 0 };
      updated.total = updated.qty * updated.unitPrice;
      return updated;
    }));
  };

  const wrappedAction = async (_prev: Parameters<typeof createPurchaseOrder>[0], fd: FormData) => {
    fd.set("items", JSON.stringify(items.filter((i) => i.name)));
    fd.set("tax", String(tax));
    return createPurchaseOrder(_prev, fd);
  };
  const [state, action, pending] = useActionState(wrappedAction, undefined);

  useEffect(() => {
    if (state?.success) { toast.success(state.message); router.push("/admin/purchase-orders"); }
    if (state?.message && !state.success) toast.error(state.message);
  }, [state, router]);

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-6">
        <form action={action} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Vendor *</Label>
              <Select name="vendorId" required>
                <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                <SelectContent>{vendors.map((v) => <SelectItem key={v.id} value={v.id}>{v.businessName} ({v.category})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>PO Title *</Label>
              <Input name="title" placeholder="e.g. DJ Services for Wedding" required />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Description</Label>
              <textarea name="description" rows={2} placeholder="Scope of work…" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label>Expected Delivery Date</Label>
              <Input name="expectedDate" type="date" />
            </div>
            <div className="space-y-1.5">
              <Label>Tax (%)</Label>
              <Input type="number" value={tax} onChange={(e) => setTax(parseFloat(e.target.value) || 0)} min={0} max={100} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Line Items *</Label>
              <Button type="button" size="sm" variant="outline" className="h-7 text-xs flex items-center gap-1" onClick={() => setItems((p) => [...p, { name: "", qty: 1, unitPrice: 0, total: 0 }])}>
                <Plus className="w-3 h-3" /> Add Item
              </Button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs text-slate-500 pb-1 border-b">
                <span className="col-span-5">Item Name</span><span className="col-span-2">Qty</span><span className="col-span-2">Unit Price (₹)</span><span className="col-span-2">Total</span><span className="col-span-1" />
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <Input className="col-span-5 h-8 text-sm" placeholder="Item description" value={item.name} onChange={(e) => updateItem(idx, "name", e.target.value)} />
                  <Input className="col-span-2 h-8 text-sm" type="number" min={1} value={item.qty} onChange={(e) => updateItem(idx, "qty", e.target.value)} />
                  <Input className="col-span-2 h-8 text-sm" type="number" min={0} value={item.unitPrice} onChange={(e) => updateItem(idx, "unitPrice", e.target.value)} />
                  <p className="col-span-2 text-sm font-medium text-slate-700">₹{item.total.toLocaleString("en-IN")}</p>
                  <Button type="button" variant="ghost" size="sm" className="col-span-1 h-7 w-7 p-0 text-red-400" onClick={() => setItems((p) => p.filter((_, i) => i !== idx))} disabled={items.length === 1}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between text-slate-600"><span>Tax ({tax}%)</span><span>₹{taxAmt.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1.5"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create Purchase Order"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
