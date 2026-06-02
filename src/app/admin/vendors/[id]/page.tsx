import { verifyAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { VendorDetailView } from "@/components/admin/vendor-detail-view";

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await verifyAdmin();
  const { id } = await params;
  const vendor = await prisma.vendorProfile.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, createdAt: true } },
      documents: { orderBy: { createdAt: "desc" } },
      purchaseOrders: { orderBy: { createdAt: "desc" }, take: 5 },
      contracts: { orderBy: { createdAt: "desc" }, take: 5 },
      invoices: { orderBy: { createdAt: "desc" }, take: 5 },
      performanceReviews: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  if (!vendor) notFound();
  return <VendorDetailView vendor={vendor as never} />;
}
