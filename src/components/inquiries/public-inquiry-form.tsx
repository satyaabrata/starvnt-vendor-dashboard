"use client";

import { useActionState } from "react";
import { submitInquiry } from "@/actions/inquiry";
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

const EVENT_TYPES = [
  "Wedding",
  "Birthday Party",
  "Corporate Event",
  "Engagement",
  "Baby Shower",
  "Anniversary",
  "Product Launch",
  "Cultural Program",
  "Other",
];

export function PublicInquiryForm({ vendorId }: { vendorId: string }) {
  const boundAction = submitInquiry.bind(null, vendorId);
  const [state, action, pending] = useActionState(boundAction, undefined);

  if (state?.success) {
    return (
      <div className="text-center py-10 space-y-3">
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900">Inquiry Sent!</h3>
        <p className="text-sm text-slate-500">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state?.message && !state.success && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="clientName">Your Name *</Label>
          <Input id="clientName" name="clientName" placeholder="Full name" required />
          {state?.errors?.clientName && <p className="text-xs text-red-500">{state.errors.clientName[0]}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="clientEmail">Email *</Label>
          <Input id="clientEmail" name="clientEmail" type="email" placeholder="you@example.com" required />
          {state?.errors?.clientEmail && <p className="text-xs text-red-500">{state.errors.clientEmail[0]}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="clientPhone">Phone</Label>
          <Input id="clientPhone" name="clientPhone" placeholder="+91 98765 43210" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="eventType">Event Type *</Label>
          <Select name="eventType" required>
            <SelectTrigger id="eventType">
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state?.errors?.eventType && <p className="text-xs text-red-500">{state.errors.eventType[0]}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="eventDate">Event Date *</Label>
          <Input id="eventDate" name="eventDate" type="date" required min={new Date().toISOString().split("T")[0]} />
          {state?.errors?.eventDate && <p className="text-xs text-red-500">{state.errors.eventDate[0]}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="venue">Venue</Label>
          <Input id="venue" name="venue" placeholder="Venue or city" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="guestCount">Expected Guests</Label>
          <Input id="guestCount" name="guestCount" type="number" placeholder="100" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="budget">Budget (₹)</Label>
          <Input id="budget" name="budget" type="number" placeholder="25000" />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="message">Message</Label>
          <textarea
            id="message"
            name="message"
            rows={3}
            placeholder="Any specific requirements or details..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Submitting…" : "Submit Inquiry"}
      </Button>
    </form>
  );
}
