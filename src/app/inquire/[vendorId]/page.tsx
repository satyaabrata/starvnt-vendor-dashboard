import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { PublicInquiryForm } from "@/components/inquiries/public-inquiry-form";
import { MapPin, Phone, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cacheLife } from "next/cache";

async function getVendor(vendorId: string) {
  "use cache";
  cacheLife("minutes");
  return prisma.vendorProfile.findUnique({
    where: { id: vendorId },
    include: { user: { select: { name: true, email: true } } },
  });
}

async function VendorContent({ params }: { params: Promise<{ vendorId: string }> }) {
  const { vendorId } = await params;
  const vendor = await getVendor(vendorId);

  if (!vendor || !vendor.isActive) notFound();

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shrink-0">
            <Star className="w-7 h-7 text-white fill-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900">{vendor.businessName}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">{vendor.category}</Badge>
              {vendor.location && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="w-3 h-3" /> {vendor.location}
                </span>
              )}
              {vendor.phone && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Phone className="w-3 h-3" /> {vendor.phone}
                </span>
              )}
            </div>
            {vendor.description && (
              <p className="text-sm text-slate-600 mt-2 line-clamp-2">{vendor.description}</p>
            )}
            {vendor.pricingMin != null && (
              <p className="text-xs text-slate-500 mt-2">
                Pricing: ₹{vendor.pricingMin.toLocaleString("en-IN")}
                {vendor.pricingMax ? ` – ₹${vendor.pricingMax.toLocaleString("en-IN")}` : "+"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Send Booking Inquiry</h2>
        <p className="text-sm text-slate-500 mb-6">
          Fill in the details below and {vendor.businessName} will get back to you.
        </p>
        <PublicInquiryForm vendorId={vendor.id} />
      </div>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-xl space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 rounded-lg" />
          ))}
        </div>
      </div>
    </>
  );
}

export default function PublicInquiryPage({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Suspense fallback={<LoadingSkeleton />}>
          <VendorContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}
