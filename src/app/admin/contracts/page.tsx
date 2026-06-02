import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { ContractsTable } from "@/components/admin/contracts-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { addDays } from "date-fns";

export default async function AdminContractsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await verifyAdmin();
  const { status } = await searchParams;
  const where = status === "expiring"
    ? { status: "ACTIVE" as never, endDate: { lte: addDays(new Date(), 30) } }
    : status ? { status: status as never } : undefined;
  const contracts = await prisma.contract.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { vendor: { select: { businessName: true } } },
  });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contract Management</h1>
          <p className="text-slate-500 text-sm mt-1">{contracts.length} contracts{status === "expiring" ? " expiring within 30 days" : ""}</p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/contracts/new" />} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Contract
        </Button>
      </div>
      <ContractsTable contracts={contracts as never} isAdmin />
    </div>
  );
}
