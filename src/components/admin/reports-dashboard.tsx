"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";

interface Props {
  vendorSpend: { id:string; businessName:string; category:string; avgRating:number|null; totalSpend:number; pendingAmount:number; _count:{purchaseOrders:number} }[];
  monthlySpend: { month:string; amount:number }[];
  categoryBreakdown: { category:string; _count:{id:number} }[];
  invoiceStats: { status:string; _count:{id:number}; _sum:{totalAmount:number|null} }[];
  poStats: { status:string; _count:{id:number}; _sum:{totalAmount:number|null} }[];
  contractStats: { status:string; _count:{id:number} }[];
}

const COLORS = ["#6366f1","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4"];

export function ReportsDashboard({ vendorSpend, monthlySpend, categoryBreakdown, invoiceStats, poStats, contractStats }: Props) {
  const totalSpend = vendorSpend.reduce((s, v) => s + v.totalSpend, 0);
  const totalPending = vendorSpend.reduce((s, v) => s + v.pendingAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Total paid: ₹{totalSpend.toLocaleString("en-IN")} · Pending: ₹{totalPending.toLocaleString("en-IN")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold text-slate-800">Monthly Spend (₹)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlySpend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Spend"]} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold text-slate-800">Vendor Categories</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={categoryBreakdown} dataKey="_count.id" nameKey="category" cx="50%" cy="50%" outerRadius={70} paddingAngle={2}>
                  {categoryBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />)}
                </Pie>
                <Tooltip formatter={(v, _name, props) => [v, props.payload.category]} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2">
              {categoryBreakdown.slice(0, 5).map((c, i) => (
                <div key={c.category} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-600">{c.category} ({c._count.id})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-base font-semibold text-slate-800">Top Vendors by Spend</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-slate-500 border-b">
              <th className="pb-3 pr-4 text-left font-medium">Vendor</th>
              <th className="pb-3 pr-4 text-left font-medium">Category</th>
              <th className="pb-3 pr-4 text-left font-medium">POs</th>
              <th className="pb-3 pr-4 text-left font-medium">Total Paid</th>
              <th className="pb-3 pr-4 text-left font-medium">Pending</th>
              <th className="pb-3 text-left font-medium">Rating</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {vendorSpend.sort((a, b) => b.totalSpend - a.totalSpend).map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50">
                  <td className="py-3 pr-4 font-medium text-slate-800">{v.businessName}</td>
                  <td className="py-3 pr-4"><Badge variant="outline" className="text-xs">{v.category}</Badge></td>
                  <td className="py-3 pr-4 text-slate-600">{v._count.purchaseOrders}</td>
                  <td className="py-3 pr-4 font-semibold text-emerald-700">₹{v.totalSpend.toLocaleString("en-IN")}</td>
                  <td className="py-3 pr-4 text-amber-600">₹{v.pendingAmount.toLocaleString("en-IN")}</td>
                  <td className="py-3 text-amber-500">{v.avgRating ? `⭐ ${v.avgRating.toFixed(1)}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { title: "Invoice Status", data: invoiceStats.map((s) => ({ label: s.status, count: s._count.id, amount: s._sum.totalAmount ?? 0 })) },
          { title: "PO Status", data: poStats.map((s) => ({ label: s.status, count: s._count.id, amount: s._sum.totalAmount ?? 0 })) },
          { title: "Contract Status", data: contractStats.map((s) => ({ label: s.status, count: s._count.id, amount: 0 })) },
        ].map(({ title, data }) => (
          <Card key={title} className="border-0 shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-slate-800">{title}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {data.map(({ label, count, amount }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 capitalize">{label.toLowerCase().replace("_"," ")}</span>
                  <div className="text-right">
                    <span className="font-semibold text-slate-800">{count}</span>
                    {amount > 0 && <span className="text-slate-400 ml-2">₹{amount.toLocaleString("en-IN")}</span>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
