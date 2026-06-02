"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/dal";
import { z } from "zod";

export type ActionState = { errors?: Record<string, string[]>; message?: string; success?: boolean } | undefined;

// "0" is truthy in JS, so "0" || undefined == "0" — explicitly convert to undefined when value is 0
function optionalScore(val: FormDataEntryValue | null) {
  const n = Number(val);
  return n > 0 ? n : undefined;
}

const ReviewSchema = z.object({
  vendorId: z.string().min(1),
  overallRating: z.number().min(1, "Please select at least 1 star for overall rating").max(5),
  deliveryScore: z.number().min(1).max(5).optional(),
  qualityScore: z.number().min(1).max(5).optional(),
  communicationScore: z.number().min(1).max(5).optional(),
  comment: z.string().optional(),
});

export async function createReview(state: ActionState, formData: FormData): Promise<ActionState> {
  const session = await verifyAdmin();

  const overallRating = Number(formData.get("overallRating"));

  if (!overallRating || overallRating < 1) {
    return { errors: { overallRating: ["Please select at least 1 star for overall rating"] } };
  }

  const result = ReviewSchema.safeParse({
    vendorId: formData.get("vendorId"),
    overallRating,
    deliveryScore: optionalScore(formData.get("deliveryScore")),
    qualityScore: optionalScore(formData.get("qualityScore")),
    communicationScore: optionalScore(formData.get("communicationScore")),
    comment: formData.get("comment") || undefined,
  });

  if (!result.success) return { errors: result.error.flatten().fieldErrors };
  const d = result.data;

  await prisma.performanceReview.create({
    data: {
      vendorId: d.vendorId,
      overallRating: d.overallRating,
      deliveryScore: d.deliveryScore ?? null,
      qualityScore: d.qualityScore ?? null,
      communicationScore: d.communicationScore ?? null,
      comment: d.comment || null,
      reviewedBy: session.name ?? session.email,
    },
  });

  const agg = await prisma.performanceReview.aggregate({
    where: { vendorId: d.vendorId },
    _avg: { overallRating: true },
    _count: true,
  });
  await prisma.vendorProfile.update({
    where: { id: d.vendorId },
    data: { avgRating: agg._avg.overallRating, totalRatings: agg._count },
  });

  revalidatePath("/admin/performance");
  revalidatePath(`/admin/vendors/${d.vendorId}`);
  return { success: true, message: "Review submitted successfully!" };
}
