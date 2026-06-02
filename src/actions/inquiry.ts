"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { InquirySchema } from "@/lib/validations";

export type InquiryState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
} | undefined;

export async function submitInquiry(
  vendorId: string,
  state: InquiryState,
  formData: FormData
): Promise<InquiryState> {
  const raw = {
    clientName: formData.get("clientName"),
    clientEmail: formData.get("clientEmail"),
    clientPhone: formData.get("clientPhone"),
    eventType: formData.get("eventType"),
    eventDate: formData.get("eventDate"),
    venue: formData.get("venue"),
    guestCount: formData.get("guestCount") || undefined,
    budget: formData.get("budget") || undefined,
    message: formData.get("message"),
  };

  const result = InquirySchema.safeParse(raw);
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const data = result.data;

  await prisma.eventInquiry.create({
    data: {
      vendorId,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone || null,
      eventType: data.eventType,
      eventDate: new Date(data.eventDate),
      venue: data.venue || null,
      guestCount: data.guestCount ?? null,
      budget: data.budget ?? null,
      message: data.message || null,
    },
  });

  return { success: true, message: "Your inquiry has been submitted successfully!" };
}

export async function updateInquiryStatus(
  inquiryId: string,
  status: string,
  notes?: string
): Promise<{ success: boolean; message: string }> {
  const session = await verifySession();

  const inquiry = await prisma.eventInquiry.findFirst({
    where: {
      id: inquiryId,
      vendor: { userId: session.userId },
    },
  });

  if (!inquiry) {
    return { success: false, message: "Inquiry not found" };
  }

  await prisma.eventInquiry.update({
    where: { id: inquiryId },
    data: { status: status as never, notes: notes || inquiry.notes },
  });

  revalidatePath("/dashboard/inquiries");
  return { success: true, message: "Status updated" };
}
