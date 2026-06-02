import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await getSession();
  if (session?.userId) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-2 text-purple-300 text-sm font-medium">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            StarVnt Entertainment
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Vendor Booking
            <span className="block text-purple-400">Dashboard</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            Manage your vendor profile, track event inquiries, and grow your entertainment business.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="text-base px-8" nativeButton={false} render={<Link href="/login" />}>
            Sign In
          </Button>
          <Button size="lg" variant="outline" className="text-base px-8 bg-transparent border-white/20 text-white hover:bg-white/10" nativeButton={false} render={<Link href="/register" />}>
            Create Account
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6 pt-8">
          {[
            { label: "Profile Management", desc: "Showcase your services" },
            { label: "Event Inquiries", desc: "Track client requests" },
            { label: "Analytics", desc: "Monitor your growth" },
          ].map((f) => (
            <div key={f.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
              <p className="text-white font-semibold text-sm">{f.label}</p>
              <p className="text-slate-400 text-xs mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
