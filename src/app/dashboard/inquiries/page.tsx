import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { InquiriesTable } from "@/components/inquiries/inquiries-table";

export default async function InquiriesPage() {
  const session = await verifySession();

  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: session.userId },
    include: {
      inquiries: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const inquiries = profile?.inquiries ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Event Inquiries</h1>
          <p className="text-slate-500 text-sm mt-1">
            {inquiries.length} total · manage and respond to booking requests
          </p>
        </div>
      </div>

      <InquiriesTable inquiries={inquiries} />
    </div>
  );
}
