"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ShoppingCart, FileText,
  Receipt, Star, Shield, BarChart3, Bell, Zap, Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/dashboard/mobile-nav";

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
  const { isOpen, isCollapsed, close, toggleCollapse } = useSidebar();
  const desktopCollapsed = isCollapsed;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col shrink-0 overflow-hidden transition-all duration-300 ease-in-out",
        "lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "w-[min(18rem,calc(100vw-1rem))] lg:w-60",
        desktopCollapsed && "lg:w-14"
      )}
      style={{ background: "var(--sidebar)" }}
    >
      {/* Logo + Toggle */}
      <div
        className={cn(
          "border-b py-4",
          desktopCollapsed
            ? "px-2 lg:flex lg:flex-col lg:items-center lg:gap-3"
            : "flex items-center gap-2.5 px-3"
        )}
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        <button
          onClick={toggleCollapse}
          className={cn(
            "hidden items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white lg:flex",
            desktopCollapsed ? "h-8 w-8" : "h-7 w-7 shrink-0"
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu className="w-4 h-4" />
        </button>

        {!desktopCollapsed && (
          <div className="flex min-w-0 items-center gap-2 overflow-hidden">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary shadow-sm">
              <Zap className="w-3 h-3 text-white fill-white" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-none tracking-wide text-white">StarVnt</p>
              <p className="truncate text-[11px] font-medium" style={{ color: "oklch(0.6 0.01 264)" }}>
                Admin Portal
              </p>
            </div>
          </div>
        )}

        {desktopCollapsed && (
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary shadow-sm">
            <Zap className="w-3 h-3 text-white fill-white" />
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={cn("flex-1 space-y-1 overflow-y-auto overflow-x-hidden py-4", desktopCollapsed ? "lg:px-1.5 px-3" : "px-3")}>
        {!desktopCollapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-widest px-2 pb-2" style={{ color: "oklch(0.45 0.01 264)" }}>
            Management
          </p>
        )}
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={close}
              title={desktopCollapsed ? label : undefined}
              className={cn(
                "group relative flex items-center rounded-lg text-sm font-medium transition-all duration-150",
                desktopCollapsed ? "justify-center px-2 py-2.5 lg:px-2.5" : "gap-2.5 px-3 py-2.5",
                active
                  ? "bg-primary text-white shadow-sm"
                  : "hover:bg-white/8 text-white/60 hover:text-white/90"
              )}
            >
              <Icon className={cn("w-3.75 h-3.75 shrink-0", active ? "opacity-100" : "opacity-60")} />
              {!desktopCollapsed && <span className="truncate">{label}</span>}

              {/* Tooltip when collapsed */}
              {desktopCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {!desktopCollapsed && (
        <div className="px-4 py-3 text-[10px] font-medium border-t" style={{ borderColor: "var(--sidebar-border)", color: "oklch(0.38 0.01 264)" }}>
          StarVnt VMS Admin © 2025
        </div>
      )}
    </aside>
  );
}
