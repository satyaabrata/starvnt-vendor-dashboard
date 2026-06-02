"use client";

import { useActionState } from "react";
import { createVendorByAdmin } from "@/actions/create-vendor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const CATEGORIES = [
  "DJ / Music", "Photography", "Videography", "Catering", "Decoration",
  "Anchor / Emcee", "Dance Performance", "Lighting & Sound",
  "Mehendi Artist", "Makeup Artist", "Venue Management", "General",
];

export function CreateVendorForm() {
  const [state, action, pending] = useActionState(createVendorByAdmin, undefined);

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-6">
        <form action={action} className="space-y-6">
          {state?.message && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {state.message}
            </div>
          )}

          {/* Account Details */}
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-4">Account Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" name="name" placeholder="Vendor's full name" required />
                {state?.errors?.name && <p className="text-xs text-red-500">{state.errors.name[0]}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" name="email" type="email" placeholder="vendor@example.com" required />
                {state?.errors?.email && <p className="text-xs text-red-500">{state.errors.email[0]}</p>}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="password">Initial Password *</Label>
                <Input id="password" name="password" type="password" placeholder="Min 8 characters" required />
                <p className="text-xs text-slate-400">Vendor can change this after first login.</p>
                {state?.errors?.password && <p className="text-xs text-red-500">{state.errors.password[0]}</p>}
              </div>
            </div>
          </div>

          <Separator />

          {/* Business Details */}
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-4">Business Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input id="businessName" name="businessName" placeholder="e.g. Royal DJ Services" required />
                {state?.errors?.businessName && <p className="text-xs text-red-500">{state.errors.businessName[0]}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select name="category" required>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                {state?.errors?.category && <p className="text-xs text-red-500">{state.errors.category[0]}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="City, State" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" placeholder="+91 98765 43210" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input id="gstNumber" name="gstNumber" placeholder="22AAAAA0000A1Z5" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="panNumber">PAN Number</Label>
                <Input id="panNumber" name="panNumber" placeholder="AAAAA0000A" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pricingMin">Min Pricing (₹)</Label>
                <Input id="pricingMin" name="pricingMin" type="number" min={0} placeholder="10000" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pricingMax">Max Pricing (₹)</Label>
                <Input id="pricingMax" name="pricingMax" type="number" min={0} placeholder="100000" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Approval */}
          <div className="flex items-start gap-3">
            <input
              id="autoApprove"
              name="autoApprove"
              type="checkbox"
              value="true"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary"
              defaultChecked
            />
            <div>
              <Label htmlFor="autoApprove" className="cursor-pointer">
                Auto-approve this vendor
              </Label>
              <p className="text-xs text-slate-400 mt-0.5">
                If unchecked, the vendor profile will be set to Pending and require manual approval.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              nativeButton={false}
              render={<a href="/admin/vendors" />}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating vendor…" : "Create Vendor"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
