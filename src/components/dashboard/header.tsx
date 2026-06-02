"use client";

import { logout } from "@/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  userName: string;
  role?: "ADMIN" | "VENDOR";
}

export function Header({ userName, role = "VENDOR" }: HeaderProps) {
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const profileHref = role === "ADMIN" ? "/admin" : "/dashboard/profile";

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      <div />
      <div className="flex items-center gap-3">
        {role === "ADMIN" && (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">Admin</Badge>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" className="flex items-center gap-2 h-auto py-1.5 px-2" />}
          >
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">{userName}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem render={<Link href={profileHref} />} className="flex items-center gap-2">
              <User className="w-4 h-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 text-red-600 focus:text-red-600"
              onClick={() => logout()}
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
