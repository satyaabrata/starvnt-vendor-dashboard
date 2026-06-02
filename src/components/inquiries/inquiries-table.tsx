"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InquiryDetailDialog } from "./inquiry-detail-dialog";
import { Search } from "lucide-react";
import type { EventInquiry } from "@/generated/prisma/client";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  completed: "bg-purple-100 text-purple-700 border-purple-200",
};

export function InquiriesTable({ inquiries }: { inquiries: EventInquiry[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<EventInquiry | null>(null);

  const filtered = inquiries.filter((i) => {
    const matchSearch =
      !search ||
      i.clientName.toLowerCase().includes(search.toLowerCase()) ||
      i.clientEmail.toLowerCase().includes(search.toLowerCase()) ||
      i.eventType.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-5">
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, email or event type…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              {inquiries.length === 0 ? "No inquiries yet. Share your public link to receive bookings." : "No matching inquiries found."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                    <th className="pb-3 font-medium pr-4">Client</th>
                    <th className="pb-3 font-medium pr-4">Event</th>
                    <th className="pb-3 font-medium pr-4">Date</th>
                    <th className="pb-3 font-medium pr-4">Budget</th>
                    <th className="pb-3 font-medium pr-4">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((inquiry) => (
                    <tr key={inquiry.id} className="hover:bg-slate-50/50">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-slate-800">{inquiry.clientName}</p>
                        <p className="text-xs text-slate-400">{inquiry.clientEmail}</p>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{inquiry.eventType}</td>
                      <td className="py-3 pr-4 text-slate-600 whitespace-nowrap">
                        {format(new Date(inquiry.eventDate), "dd MMM yyyy")}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {inquiry.budget ? `₹${inquiry.budget.toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant="outline"
                          className={`text-xs capitalize ${STATUS_COLORS[inquiry.status] ?? ""}`}
                        >
                          {inquiry.status}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => setSelected(inquiry)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <InquiryDetailDialog
        inquiry={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
