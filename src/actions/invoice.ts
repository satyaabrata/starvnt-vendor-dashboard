"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/dal";
import { InvoiceSchema, PaymentSchema } from "@/lib/validations";

export type ActionState = { errors?: Record<string, string[]>; message?: string; success?: boolean } | undefined;

function genInvoiceNumber() {
  return `INV-${Date.now().toString(36).toUpperCase()}`;
}

export async function createInvoice(state: ActionState, formData: FormData): Promise<ActionState> {
  await verifyAdmin();
  const result = InvoiceSchema.safeParse({
    vendorId: formData.get("vendorId"), poId: formData.get("poId") || undefined,
    description: formData.get("description"), subtotal: formData.get("subtotal"),
    tax: formData.get("tax") || 0, dueDate: formData.get("dueDate") || undefined,
    fileUrl: formData.get("fileUrl"), notes: formData.get("notes"),
  });
  if (!result.success) return { errors: result.error.flatten().fieldErrors };
  const d = result.data;
  const totalAmount = d.subtotal + (d.subtotal * d.tax) / 100;
  await prisma.invoice.create({
    data: {
      invoiceNumber: genInvoiceNumber(), vendorId: d.vendorId, poId: d.poId || null,
      description: d.description, subtotal: d.subtotal, tax: d.tax, totalAmount,
      dueDate: d.dueDate ? new Date(d.dueDate) : null, fileUrl: d.fileUrl || null, notes: d.notes,
    },
  });
  revalidatePath("/admin/invoices");
  return { success: true, message: "Invoice created!" };
}

export async function approveInvoice(invoiceId: string): Promise<{ success: boolean }> {
  await verifyAdmin();
  await prisma.invoice.update({ where: { id: invoiceId }, data: { status: "APPROVED" } });
  revalidatePath("/admin/invoices");
  return { success: true };
}

export async function recordPayment(state: ActionState, formData: FormData): Promise<ActionState> {
  await verifyAdmin();
  const invoiceId = formData.get("invoiceId") as string;
  const result = PaymentSchema.safeParse({
    amount: formData.get("amount"), method: formData.get("method"),
    reference: formData.get("reference"), notes: formData.get("notes"),
  });
  if (!result.success) return { errors: result.error.flatten().fieldErrors };
  const d = result.data;
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return { message: "Invoice not found" };
  const totalPaid = (await prisma.payment.aggregate({ where: { invoiceId }, _sum: { amount: true } }))._sum.amount ?? 0;
  const remaining = invoice.totalAmount - totalPaid;
  await prisma.payment.create({ data: { invoiceId, amount: Math.min(d.amount, remaining), method: d.method, reference: d.reference, notes: d.notes } });
  if (totalPaid + d.amount >= invoice.totalAmount) {
    await prisma.invoice.update({ where: { id: invoiceId }, data: { status: "PAID", paidAt: new Date() } });
  }
  revalidatePath("/admin/invoices");
  return { success: true, message: "Payment recorded!" };
}
