import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Zap } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#0f0c29] via-[#1a1040] to-[#0f0c29] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">

        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight">Welcome back</h1>
            <p className="text-white/40 text-sm mt-0.5">Sign in to StarVnt</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl shadow-black/40 p-6">
          <LoginForm />
          <p className="mt-5 text-center text-xs text-slate-400">
            No account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
