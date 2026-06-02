import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { ContractsTable } from "@/components/admin/contracts-table";

export default async function VendorContractsPage() {
  const session = await verifySession();
  const profile = await prisma.vendorProfile.findUnique({ where: { userId: session.userId } });
  const contracts = profile ? await prisma.contract.findMany({
    where: { vendorId: profile.id },
    orderBy: { createdAt: "desc" },
    include: { vendor: { select: { businessName: true } } },
  }) : [];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Contracts</h1>
        <p className="text-slate-500 text-sm mt-1">{contracts.length} contracts</p>
      </div>
      <ContractsTable contracts={contracts as never} isAdmin={false} />
    </div>
  );
}
