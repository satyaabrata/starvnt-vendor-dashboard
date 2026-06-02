"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ShoppingCart, FileText,
  Receipt, Star, Shield, BarChart3, Bell, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/vendors", label: "Vendors", icon: Users },
  { href: "/admin/purchase-orders", label: "Purchase Orders", icon: ShoppingCart },
  { href: "/admin/contracts", label: "Contracts", icon: FileText },
  { href: "/admin/invoices", label: "Invoices", icon: Receipt },
  { href: "/admin/performance", label: "Performance", icon: Star },
  { href: "/admin/compliance", label: "Compliance", icon: Shield },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 flex flex-col shrink-0" style={{ background: "var(--sidebar)" }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <Zap className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-white tracking-wide">StarVnt</p>
            <p className="text-[10px] font-medium" style={{ color: "oklch(0.6 0.01 264)" }}>Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest px-2 pb-2" style={{ color: "oklch(0.45 0.01 264)" }}>
          Management
        </p>
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
                active
                  ? "bg-primary text-white shadow-sm"
                  : "hover:bg-white/8 text-white/60 hover:text-white/90"
              )}
            >
              <Icon className={cn("w-3.75 h-3.75 shrink-0", active ? "opacity-100" : "opacity-60")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-3 border-t text-[10px] font-medium" style={{ borderColor: "var(--sidebar-border)", color: "oklch(0.38 0.01 264)" }}>
        StarVnt VMS Admin © 2025
      </div>
    </aside>
  );
}
