"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifySession, verifyAdmin } from "@/lib/dal";
import { VendorProfileSchema, DocumentSchema } from "@/lib/validations";

export type ActionState = { errors?: Record<string, string[]>; message?: string; success?: boolean } | undefined;

export async function updateVendorProfile(state: ActionState, formData: FormData): Promise<ActionState> {
  const session = await verifySession();
  const result = VendorProfileSchema.safeParse(Object.fromEntries(
    ["businessName","category","description","location","phone","contactEmail","website","gstNumber","panNumber","licenseNumber","pricingMin","pricingMax"]
      .map((k) => [k, formData.get(k) || undefined])
  ));
  if (!result.success) return { errors: result.error.flatten().fieldErrors };
  const d = result.data;
  await prisma.vendorProfile.upsert({
    where: { userId: session.userId },
    update: { ...d, pricingMin: d.pricingMin ?? null, pricingMax: d.pricingMax ?? null, contactEmail: d.contactEmail || null, website: d.website || null },
    create: { userId: session.userId, businessName: d.businessName, category: d.category, description: d.description, location: d.location, phone: d.phone, contactEmail: d.contactEmail || null, website: d.website || null, gstNumber: d.gstNumber, panNumber: d.panNumber, licenseNumber: d.licenseNumber, pricingMin: d.pricingMin ?? null, pricingMax: d.pricingMax ?? null },
  });
  revalidatePath("/dashboard/profile");
  return { success: true, message: "Profile updated successfully!" };
}

export async function addDocument(state: ActionState, formData: FormData): Promise<ActionState> {
  const session = await verifySession();
  const profile = await prisma.vendorProfile.findUnique({ where: { userId: session.userId } });
  if (!profile) return { message: "Profile not found" };
  const result = DocumentSchema.safeParse({
    type: formData.get("type"), name: formData.get("name"),
    fileUrl: formData.get("fileUrl"), expiryDate: formData.get("expiryDate") || undefined,
    notes: formData.get("notes"),
  });
  if (!result.success) return { errors: result.error.flatten().fieldErrors };
  const d = result.data;
  await prisma.vendorDocument.create({
    data: { vendorId: profile.id, type: d.type as never, name: d.name, fileUrl: d.fileUrl, expiryDate: d.expiryDate ? new Date(d.expiryDate) : null, notes: d.notes },
  });
  revalidatePath("/dashboard/profile");
  revalidatePath("/admin/compliance");
  return { success: true, message: "Document added!" };
}

export async function deleteDocument(docId: string): Promise<{ success: boolean }> {
  const session = await verifySession();
  const doc = await prisma.vendorDocument.findFirst({ where: { id: docId, vendor: { userId: session.userId } } });
  if (!doc) return { success: false };
  await prisma.vendorDocument.delete({ where: { id: docId } });
  revalidatePath("/dashboard/profile");
  return { success: true };
}

// Admin actions
export async function approveVendor(vendorId: string): Promise<{ success: boolean }> {
  const session = await verifyAdmin();
  await prisma.vendorProfile.update({
    where: { id: vendorId },
    data: { status: "APPROVED", approvedAt: new Date(), approvedById: session.userId, rejectionNote: null },
  });
  const vendor = await prisma.vendorProfile.findUnique({ where: { id: vendorId }, include: { user: true } });
  if (vendor) {
    await prisma.notification.create({ data: { userId: vendor.userId, title: "Profile Approved", message: "Your vendor profile has been approved. You can now receive purchase orders and contracts.", type: "VENDOR_APPROVED", link: "/dashboard/profile" } });
  }
  revalidatePath("/admin/vendors");
  return { success: true };
}

export async function rejectVendor(vendorId: string, note: string): Promise<{ success: boolean }> {
  await verifyAdmin();
  await prisma.vendorProfile.update({ where: { id: vendorId }, data: { status: "REJECTED", rejectionNote: note } });
  const vendor = await prisma.vendorProfile.findUnique({ where: { id: vendorId } });
  if (vendor) {
    await prisma.notification.create({ data: { userId: vendor.userId, title: "Profile Rejected", message: `Your vendor profile was rejected. Reason: ${note}`, type: "VENDOR_REJECTED", link: "/dashboard/profile" } });
  }
  revalidatePath("/admin/vendors");
  return { success: true };
}

export async function verifyDocument(docId: string): Promise<{ success: boolean }> {
  await verifyAdmin();
  await prisma.vendorDocument.update({ where: { id: docId }, data: { isVerified: true, verifiedAt: new Date() } });
  revalidatePath("/admin/compliance");
  return { success: true };
}
