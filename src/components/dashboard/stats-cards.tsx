import { ClipboardList, CheckCircle, Clock, IndianRupee } from "lucide-react";

interface StatsCardsProps {
  totalInquiries: number;
  confirmed: number;
  pending: number;
  totalRevenue: number;
}

const stats = [
  {
    key: "total",
    label: "Total Inquiries",
    icon: ClipboardList,
    gradient: "from-violet-500 to-indigo-600",
    bg: "bg-violet-50",
    text: "text-violet-600",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: CheckCircle,
    gradient: "from-emerald-400 to-teal-500",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
  {
    key: "pending",
    label: "Pending",
    icon: Clock,
    gradient: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  {
    key: "revenue",
    label: "Est. Revenue",
    icon: IndianRupee,
    gradient: "from-sky-400 to-blue-600",
    bg: "bg-sky-50",
    text: "text-sky-600",
  },
];

export function StatsCards({ totalInquiries, confirmed, pending, totalRevenue }: StatsCardsProps) {
  const values = [
    totalInquiries,
    confirmed,
    pending,
    `₹${totalRevenue.toLocaleString("en-IN")}`,
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div
          key={s.key}
          className="bg-white rounded-xl border border-slate-100 p-5 flex items-center gap-4 hover:shadow-md hover:shadow-slate-100 transition-shadow duration-200"
        >
          <div className={`${s.bg} ${s.text} p-2.5 rounded-xl`}>
            <s.icon className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-slate-900 tracking-tight">{values[i]}</p>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
