"use client";

import { logout } from "@/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, ChevronDown } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  userName: string;
  role?: "ADMIN" | "VENDOR";
}

export function Header({ userName, role = "VENDOR" }: HeaderProps) {
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const profileHref = role === "ADMIN" ? "/admin" : "/dashboard/profile";

  return (
    <header className="h-14 bg-white border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
      <div />
      <div className="flex items-center gap-2">
        {role === "ADMIN" && (
          <Badge className="bg-violet-50 text-violet-600 border-violet-200 text-[11px] font-semibold px-2 py-0.5 rounded-md">
            Admin
          </Badge>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-8 px-2 rounded-lg hover:bg-slate-50"
              />
            }
          >
            <Avatar className="w-7 h-7">
              <AvatarFallback className="bg-primary text-white text-[11px] font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-[13px] font-medium text-slate-700 hidden sm:block">{userName}</span>
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
