import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { CreateContractForm } from "@/components/admin/create-contract-form";
import Link from "next/link";

export default async function NewContractPage() {
  await verifyAdmin();
  const vendors = await prisma.vendorProfile.findMany({
    where: { status: "APPROVED" },
    select: { id: true, businessName: true },
    orderBy: { businessName: "asc" },
  });
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/admin/contracts" className="text-sm text-slate-500 hover:text-slate-700">← Contracts</Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">New Contract</h1>
      </div>
      <CreateContractForm vendors={vendors} />
    </div>
  );
}
