"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { VendorProfileSchema } from "@/lib/validations";

export type VendorState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
} | undefined;

export async function updateVendorProfile(
  state: VendorState,
  formData: FormData
): Promise<VendorState> {
  const session = await verifySession();

  const raw = {
    businessName: formData.get("businessName"),
    category: formData.get("category"),
    description: formData.get("description"),
    location: formData.get("location"),
    phone: formData.get("phone"),
    contactEmail: formData.get("contactEmail"),
    website: formData.get("website"),
    pricingMin: formData.get("pricingMin") || undefined,
    pricingMax: formData.get("pricingMax") || undefined,
  };

  const result = VendorProfileSchema.safeParse(raw);
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const data = result.data;

  await prisma.vendorProfile.upsert({
    where: { userId: session.userId },
    update: {
      businessName: data.businessName,
      category: data.category,
      description: data.description || null,
      location: data.location || null,
      phone: data.phone || null,
      contactEmail: data.contactEmail || null,
      website: data.website || null,
      pricingMin: data.pricingMin ?? null,
      pricingMax: data.pricingMax ?? null,
    },
    create: {
      userId: session.userId,
      businessName: data.businessName,
      category: data.category,
      description: data.description || null,
      location: data.location || null,
      phone: data.phone || null,
      contactEmail: data.contactEmail || null,
      website: data.website || null,
      pricingMin: data.pricingMin ?? null,
      pricingMax: data.pricingMax ?? null,
    },
  });

  revalidatePath("/dashboard/profile");
  return { success: true, message: "Profile updated successfully!" };
}
