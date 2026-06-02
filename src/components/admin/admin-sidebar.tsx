"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ShoppingCart, FileText,
  Receipt, Star, Shield, BarChart3, Bell,
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
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shrink-0">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">StarVnt</p>
            <p className="text-xs text-sidebar-foreground/60">Admin Portal</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/40 text-center">
        StarVnt VMS Admin © 2025
      </div>
    </aside>
  );
}
