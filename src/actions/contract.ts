"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/dal";
import { ContractSchema } from "@/lib/validations";

export type ActionState = { errors?: Record<string, string[]>; message?: string; success?: boolean } | undefined;

function genContractNumber() {
  return `CTR-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function createContract(state: ActionState, formData: FormData): Promise<ActionState> {
  await verifyAdmin();
  const result = ContractSchema.safeParse({
    vendorId: formData.get("vendorId"), title: formData.get("title"),
    description: formData.get("description"), fileUrl: formData.get("fileUrl"),
    value: formData.get("value") || undefined, startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });
  if (!result.success) return { errors: result.error.flatten().fieldErrors };
  const d = result.data;
  const contract = await prisma.contract.create({
    data: {
      contractNumber: genContractNumber(), vendorId: d.vendorId, title: d.title,
      description: d.description, fileUrl: d.fileUrl || null, value: d.value ?? null,
      startDate: new Date(d.startDate), endDate: new Date(d.endDate), status: "ACTIVE",
    },
  });
  const vendor = await prisma.vendorProfile.findUnique({ where: { id: d.vendorId } });
  if (vendor) {
    await prisma.notification.create({ data: { userId: vendor.userId, title: "New Contract", message: `A new contract has been created: ${d.title}`, type: "GENERAL", link: `/dashboard/contracts` } });
  }
  revalidatePath("/admin/contracts");
  return { success: true, message: `Contract ${contract.contractNumber} created!` };
}

export async function updateContractStatus(contractId: string, status: string, note?: string): Promise<{ success: boolean }> {
  await verifyAdmin();
  await prisma.contract.update({
    where: { id: contractId },
    data: { status: status as never, terminatedAt: status === "TERMINATED" ? new Date() : undefined, terminationNote: note },
  });
  revalidatePath("/admin/contracts");
  return { success: true };
}
