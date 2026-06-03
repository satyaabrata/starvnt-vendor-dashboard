"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, ClipboardList, ShoppingCart, FileText, Receipt, Star, Zap } from "lucide-react";
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
  const { isOpen, close } = useSidebar();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-60 flex flex-col shrink-0 transition-transform duration-300 lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
      style={{ background: "var(--sidebar)" }}
    >
      <div className="px-5 py-5 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <Zap className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-white tracking-wide">StarVnt</p>
            <p className="text-[10px] font-medium" style={{ color: "oklch(0.6 0.01 264)" }}>Vendor Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest px-2 pb-2" style={{ color: "oklch(0.45 0.01 264)" }}>
          Menu
        </p>
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={close}
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
        StarVnt Entertainment © 2025
      </div>
    </aside>
  );
}
