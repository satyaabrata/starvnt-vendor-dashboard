"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, User, ClipboardList, ShoppingCart,
  FileText, Receipt, Star, Zap, Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./mobile-nav";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/inquiries", label: "Inquiries", icon: ClipboardList },
  { href: "/dashboard/purchase-orders", label: "Purchase Orders", icon: ShoppingCart },
  { href: "/dashboard/contracts", label: "Contracts", icon: FileText },
  { href: "/dashboard/invoices", label: "Invoices", icon: Receipt },
  { href: "/dashboard/performance", label: "Performance", icon: Star },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export function Sidebar() {
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
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shadow-sm shrink-0">
              <Zap className="w-3 h-3 text-white fill-white" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold tracking-wide text-white leading-none">StarVnt</p>
              <p className="truncate text-[10px] font-medium" style={{ color: "oklch(0.6 0.01 264)" }}>
                Vendor Portal
              </p>
            </div>
          </div>
        )}

        {desktopCollapsed && (
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shadow-sm">
            <Zap className="w-3 h-3 text-white fill-white" />
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={cn("flex-1 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden", desktopCollapsed ? "lg:px-1.5 px-3" : "px-3")}>
        {!desktopCollapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-widest px-2 pb-2" style={{ color: "oklch(0.45 0.01 264)" }}>
            Menu
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
                "flex items-center rounded-lg text-[13px] font-medium transition-all duration-150 group relative",
                desktopCollapsed ? "justify-center px-2 py-2.5 lg:px-2.5" : "gap-2.5 px-2.5 py-2",
                active
                  ? "bg-primary text-white shadow-sm"
                  : "hover:bg-white/8 text-white/60 hover:text-white/90"
              )}
            >
              <Icon className={cn("w-3.75 h-3.75 shrink-0", active ? "opacity-100" : "opacity-60")} />
              {!desktopCollapsed && <span className="truncate">{label}</span>}

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
        <div className="px-5 py-3 border-t text-[10px] font-medium" style={{ borderColor: "var(--sidebar-border)", color: "oklch(0.38 0.01 264)" }}>
          StarVnt Entertainment © 2025
        </div>
      )}
    </aside>
  );
}
