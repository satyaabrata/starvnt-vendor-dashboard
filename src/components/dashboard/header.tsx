"use client";

import { logout } from "@/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, ChevronDown, Menu } from "lucide-react";
import Link from "next/link";
import { useSidebar } from "./mobile-nav";

interface HeaderProps {
  userName: string;
  role?: "ADMIN" | "VENDOR";
}

export function Header({ userName, role = "VENDOR" }: HeaderProps) {
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const profileHref = role === "ADMIN" ? "/admin" : "/dashboard/profile";
  const { toggle } = useSidebar();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-3 sm:px-6">
      {/* Hamburger — mobile only */}
      <button
        onClick={toggle}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Toggle menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden lg:block" />

      {/* Right side */}
      <div className="flex min-w-0 items-center gap-2">
        {role === "ADMIN" && (
          <Badge className="rounded-md border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-600">
            Admin
          </Badge>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="flex h-8 min-w-0 items-center gap-2 rounded-lg px-2 hover:bg-slate-50"
              />
            }
          >
            <Avatar className="w-7 h-7">
              <AvatarFallback className="bg-primary text-white text-[11px] font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[9rem] truncate text-[13px] font-medium text-slate-700 sm:block">{userName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem render={<Link href={profileHref} />} className="flex items-center gap-2 text-[13px]">
              <User className="w-3.5 h-3.5" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 text-[13px] text-red-500 focus:text-red-500"
              onClick={() => logout()}
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
