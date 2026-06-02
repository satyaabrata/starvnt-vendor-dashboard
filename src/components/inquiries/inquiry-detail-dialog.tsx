"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { updateInquiryStatus } from "@/actions/inquiry";
import type { EventInquiry } from "@/generated/prisma/client";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  completed: "bg-purple-100 text-purple-700 border-purple-200",
};

interface Props {
  inquiry: EventInquiry | null;
  onClose: () => void;
}

export function InquiryDetailDialog({ inquiry, onClose }: Props) {
  const [status, setStatus] = useState(inquiry?.status ?? "pending");
  const [notes, setNotes] = useState(inquiry?.notes ?? "");
  const [isPending, startTransition] = useTransition();

  if (!inquiry) return null;

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateInquiryStatus(inquiry.id, status, notes);
      if (result.success) {
        toast.success("Status updated successfully");
        onClose();
      } else {
        toast.error(result.message);
      }
    });
  };

  const rows = [
    { label: "Client", value: inquiry.clientName },
    { label: "Email", value: inquiry.clientEmail },
    { label: "Phone", value: inquiry.clientPhone ?? "—" },
    { label: "Event Type", value: inquiry.eventType },
    { label: "Event Date", value: format(new Date(inquiry.eventDate), "dd MMMM yyyy") },
    { label: "Venue", value: inquiry.venue ?? "—" },
    { label: "Guests", value: inquiry.guestCount?.toLocaleString() ?? "—" },
    { label: "Budget", value: inquiry.budget ? `₹${inquiry.budget.toLocaleString("en-IN")}` : "—" },
  ];

  return (
    <Dialog open={!!inquiry} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Inquiry from {inquiry.clientName}
            <Badge
              variant="outline"
              className={`text-xs capitalize font-normal ${STATUS_COLORS[inquiry.status] ?? ""}`}
            >
              {inquiry.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {rows.map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                <p className="text-sm font-medium text-slate-800">{value}</p>
              </div>
            ))}
          </div>

          {inquiry.message && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-slate-500 mb-1">Message from client</p>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{inquiry.message}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-3">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-slate-700">Update Status</p>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v ?? "pending")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-slate-700">Internal Notes</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Add notes for your records..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
