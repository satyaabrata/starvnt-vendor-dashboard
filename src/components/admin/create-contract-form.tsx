"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createContract } from "@/actions/contract";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export function CreateContractForm({ vendors }: { vendors: { id: string; businessName: string }[] }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createContract, undefined);
  useEffect(() => {
    if (state?.success) { toast.success(state.message); router.push("/admin/contracts"); }
    if (state?.message && !state.success) toast.error(state.message);
  }, [state, router]);

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-6">
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Vendor *</Label>
            <Select name="vendorId" required>
              <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
              <SelectContent>{vendors.map((v) => <SelectItem key={v.id} value={v.id}>{v.businessName}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Contract Title *</Label>
            <Input name="title" placeholder="e.g. Annual DJ Services Agreement" required />
            {state?.errors?.title && <p className="text-xs text-red-500">{state.errors.title[0]}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <textarea name="description" rows={3} placeholder="Scope and terms…" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Start Date *</Label>
              <Input name="startDate" type="date" required />
            </div>
            <div className="space-y-1.5">
              <Label>End Date *</Label>
              <Input name="endDate" type="date" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Contract Value (₹)</Label>
              <Input name="value" type="number" min={0} placeholder="500000" />
            </div>
            <div className="space-y-1.5">
              <Label>Document URL</Label>
              <Input name="fileUrl" type="url" placeholder="https://drive.google.com/…" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create Contract"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
