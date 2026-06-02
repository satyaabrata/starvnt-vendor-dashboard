import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, CheckCircle, Clock, DollarSign } from "lucide-react";

interface StatsCardsProps {
  totalInquiries: number;
  confirmed: number;
  pending: number;
  totalRevenue: number;
}

export function StatsCards({ totalInquiries, confirmed, pending, totalRevenue }: StatsCardsProps) {
  const stats = [
    {
      label: "Total Inquiries",
      value: totalInquiries,
      icon: ClipboardList,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Confirmed",
      value: confirmed,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Est. Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      icon: DollarSign,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color, bg }) => (
        <Card key={label} className="border-0 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`${bg} ${color} p-3 rounded-xl`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
