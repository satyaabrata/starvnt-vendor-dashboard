"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/dal";
import { z } from "zod";

const Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  businessName: z.string().min(2, "Business name required"),
  category: z.string().min(1, "Category required"),
  location: z.string().optional(),
  phone: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  pricingMin: z.coerce.number().min(0).optional(),
  pricingMax: z.coerce.number().min(0).optional(),
  autoApprove: z.string().optional(),
});

export type CreateVendorState = {
  errors?: Record<string, string[]>;
  message?: string;
} | undefined;

export async function createVendorByAdmin(
  state: CreateVendorState,
  formData: FormData
): Promise<CreateVendorState> {
  const session = await verifyAdmin();

  const result = Schema.safeParse(Object.fromEntries(
    ["name","email","password","businessName","category","location","phone","gstNumber","panNumber","pricingMin","pricingMax","autoApprove"]
      .map((k) => [k, formData.get(k) || undefined])
  ));

  if (!result.success) return { errors: result.error.flatten().fieldErrors };

  const d = result.data;
  const existing = await prisma.user.findUnique({ where: { email: d.email } });
  if (existing) return { errors: { email: ["An account with this email already exists"] } };

  const autoApprove = d.autoApprove === "true";
  const passwordHash = await bcrypt.hash(d.password, 12);

  const user = await prisma.user.create({
    data: {
      name: d.name,
      email: d.email,
      passwordHash,
      role: "VENDOR",
      vendorProfile: {
        create: {
          businessName: d.businessName,
          category: d.category,
          location: d.location || null,
          phone: d.phone || null,
          gstNumber: d.gstNumber || null,
          panNumber: d.panNumber || null,
          pricingMin: d.pricingMin ?? null,
          pricingMax: d.pricingMax ?? null,
          status: autoApprove ? "APPROVED" : "PENDING",
          approvedAt: autoApprove ? new Date() : null,
          approvedById: autoApprove ? session.userId : null,
        },
      },
    },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      title: autoApprove ? "Account Created & Approved" : "Account Created — Pending Review",
      message: autoApprove
        ? "Your vendor account has been created and approved by StarVnt admin."
        : "Your vendor account has been created. It is pending approval from StarVnt admin.",
      type: autoApprove ? "VENDOR_APPROVED" : "GENERAL",
      link: "/dashboard/profile",
    },
  });

  redirect("/admin/vendors");
}
