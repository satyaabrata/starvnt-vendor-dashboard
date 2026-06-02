"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/dal";

export type ActionState = { errors?: Record<string, string[]>; message?: string; success?: boolean } | undefined;

function genPONumber() {
  return `PO-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function createPurchaseOrder(state: ActionState, formData: FormData): Promise<ActionState> {
  await verifyAdmin();
  const vendorId = formData.get("vendorId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const tax = parseFloat(formData.get("tax") as string) || 0;
  const expectedDate = formData.get("expectedDate") as string;
  const itemsRaw = formData.get("items") as string;

  if (!vendorId || !title) return { errors: { title: ["Title and vendor are required"] } };

  let items: { name: string; qty: number; unitPrice: number; total: number }[] = [];
  try { items = JSON.parse(itemsRaw); } catch { return { message: "Invalid items data" }; }
  if (items.length === 0) return { message: "Add at least one item" };

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const totalAmount = subtotal + (subtotal * tax) / 100;

  const po = await prisma.purchaseOrder.create({
    data: {
      poNumber: genPONumber(), vendorId, title, description: description || null,
      items, subtotal, tax, totalAmount,
      expectedDate: expectedDate ? new Date(expectedDate) : null,
    },
  });

  await prisma.notification.create({
    data: { userId: (await prisma.vendorProfile.findUnique({ where: { id: vendorId } }))!.userId, title: "New Purchase Order", message: `You have received a new purchase order: ${title}`, type: "PO_UPDATE", link: `/dashboard/purchase-orders/${po.id}` },
  });

  revalidatePath("/admin/purchase-orders");
  return { success: true, message: `PO ${po.poNumber} created!` };
}

export async function updatePOStatus(poId: string, status: string, note?: string): Promise<{ success: boolean; message: string }> {
  await verifyAdmin();
  await prisma.purchaseOrder.update({
    where: { id: poId },
    data: {
      status: status as never,
      deliveredAt: status === "DELIVERED" ? new Date() : undefined,
      deliveryNote: note || undefined,
    },
  });
  revalidatePath("/admin/purchase-orders");
  return { success: true, message: "Status updated" };
}

export async function acknowledgePO(poId: string): Promise<{ success: boolean }> {
  const vendor = await prisma.purchaseOrder.findUnique({ where: { id: poId }, include: { vendor: { select: { userId: true } } } });
  if (!vendor) return { success: false };
  await prisma.purchaseOrder.update({ where: { id: poId }, data: { status: "ACKNOWLEDGED" } });
  revalidatePath("/dashboard/purchase-orders");
  return { success: true };
}
