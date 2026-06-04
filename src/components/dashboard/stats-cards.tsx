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
    <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
      {stats.map((s, i) => (
        <div
          key={s.key}
          className="flex items-start gap-4 rounded-xl border border-slate-100 bg-white p-4 transition-shadow duration-200 hover:shadow-md hover:shadow-slate-100 sm:p-5"
        >
          <div className={`${s.bg} ${s.text} rounded-xl p-2.5 shrink-0`}>
            <s.icon className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="break-words text-[clamp(1.75rem,6vw,2.25rem)] font-semibold leading-[1.05] tracking-tight text-slate-900">
              {values[i]}
            </p>
            <p className="mt-1 text-sm font-medium leading-5 text-slate-400">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
