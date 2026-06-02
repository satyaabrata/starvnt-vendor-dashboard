import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Zap, BarChart3, ClipboardList, User } from "lucide-react";

export default async function Home() {
  const session = await getSession();
  if (session?.userId) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0f0c29] via-[#1a1040] to-[#0f0c29] flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <div className="text-center">
            <p className="text-white/50 text-xs font-medium tracking-widest uppercase mb-1">StarVnt Entertainment</p>
            <h1 className="text-3xl font-semibold text-white tracking-tight">Vendor Management</h1>
            <p className="text-white/40 text-sm mt-1.5">Sign in to access your dashboard</p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-3">
          <Button
            size="lg"
            className="w-full font-medium text-sm"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Sign In
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full font-medium text-sm bg-transparent border-white/15 text-white/80 hover:bg-white/8 hover:text-white"
            nativeButton={false}
            render={<Link href="/register" />}
          >
            Create Vendor Account
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: User, label: "Profile", desc: "Manage your business" },
            { icon: ClipboardList, label: "Inquiries", desc: "Track bookings" },
            { icon: BarChart3, label: "Analytics", desc: "Monitor growth" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white/4 border border-white/8 rounded-xl p-3.5 text-center">
              <Icon className="w-4 h-4 text-primary mx-auto mb-1.5" />
              <p className="text-white text-xs font-semibold">{label}</p>
              <p className="text-white/40 text-[10px] mt-0.5">{desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
