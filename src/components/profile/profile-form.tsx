"use client";

import { useActionState } from "react";
import { updateVendorProfile } from "@/actions/vendor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useEffect } from "react";
import type { VendorProfile } from "@/generated/prisma/client";

const CATEGORIES = [
  "DJ / Music",
  "Photography",
  "Videography",
  "Catering",
  "Decoration",
  "Anchor / Emcee",
  "Dance Performance",
  "Lighting & Sound",
  "Mehendi Artist",
  "Makeup Artist",
  "Venue Management",
  "General",
];

export function ProfileForm({ profile }: { profile: VendorProfile | null }) {
  const [state, action, pending] = useActionState(updateVendorProfile, undefined);

  useEffect(() => {
    if (state?.success) toast.success(state.message ?? "Profile updated!");
    if (state?.message && !state.success) toast.error(state.message);
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="businessName">Business Name *</Label>
          <Input
            id="businessName"
            name="businessName"
            defaultValue={profile?.businessName ?? ""}
            required
          />
          {state?.errors?.businessName && (
            <p className="text-xs text-red-500">{state.errors.businessName[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="category">Category *</Label>
          <Select name="category" defaultValue={profile?.category ?? "General"}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            defaultValue={profile?.description ?? ""}
            rows={3}
            placeholder="Tell clients about your services..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={profile?.location ?? ""} placeholder="City, State" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={profile?.phone ?? ""} placeholder="+91 98765 43210" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contactEmail">Contact Email</Label>
          <Input id="contactEmail" name="contactEmail" type="email" defaultValue={profile?.contactEmail ?? ""} placeholder="business@example.com" />
          {state?.errors?.contactEmail && (
            <p className="text-xs text-red-500">{state.errors.contactEmail[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="website">Website</Label>
          <Input id="website" name="website" type="url" defaultValue={profile?.website ?? ""} placeholder="https://yoursite.com" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pricingMin">Min Pricing (₹)</Label>
          <Input id="pricingMin" name="pricingMin" type="number" defaultValue={profile?.pricingMin ?? ""} placeholder="5000" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pricingMax">Max Pricing (₹)</Label>
          <Input id="pricingMax" name="pricingMax" type="number" defaultValue={profile?.pricingMax ?? ""} placeholder="50000" />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save Profile"}
        </Button>
      </div>
    </form>
  );
}
