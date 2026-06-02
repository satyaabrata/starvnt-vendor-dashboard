"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/dal";
import { PerformanceReviewSchema } from "@/lib/validations";

export type ActionState = { errors?: Record<string, string[]>; message?: string; success?: boolean } | undefined;

export async function createReview(state: ActionState, formData: FormData): Promise<ActionState> {
  const session = await verifyAdmin();
  const result = PerformanceReviewSchema.safeParse({
    vendorId: formData.get("vendorId"), overallRating: formData.get("overallRating"),
    deliveryScore: formData.get("deliveryScore") || undefined,
    qualityScore: formData.get("qualityScore") || undefined,
    communicationScore: formData.get("communicationScore") || undefined,
    comment: formData.get("comment"),
  });
  if (!result.success) return { errors: result.error.flatten().fieldErrors };
  const d = result.data;

  await prisma.performanceReview.create({
    data: { vendorId: d.vendorId, overallRating: d.overallRating, deliveryScore: d.deliveryScore ?? null, qualityScore: d.qualityScore ?? null, communicationScore: d.communicationScore ?? null, comment: d.comment, reviewedBy: session.name ?? session.email },
  });

  // Recalculate average rating
  const agg = await prisma.performanceReview.aggregate({ where: { vendorId: d.vendorId }, _avg: { overallRating: true }, _count: true });
  await prisma.vendorProfile.update({ where: { id: d.vendorId }, data: { avgRating: agg._avg.overallRating, totalRatings: agg._count } });

  revalidatePath("/admin/performance");
  revalidatePath(`/admin/vendors/${d.vendorId}`);
  return { success: true, message: "Review submitted!" };
}
