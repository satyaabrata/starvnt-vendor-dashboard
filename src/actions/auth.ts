"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";
import { RegisterSchema, LoginSchema } from "@/lib/validations";

export type AuthState = {
  errors?: Record<string, string[]>;
  message?: string;
} | undefined;

export async function register(state: AuthState, formData: FormData): Promise<AuthState> {
  const result = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!result.success) return { errors: result.error.flatten().fieldErrors };

  const { name, email, password } = result.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { errors: { email: ["An account with this email already exists"] } };

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name, email, passwordHash, role: "VENDOR",
      vendorProfile: { create: { businessName: name, category: "General" } },
    },
  });

  await createSession(user.id, email, "VENDOR", name);
  redirect("/dashboard");
}

export async function login(state: AuthState, formData: FormData): Promise<AuthState> {
  const result = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!result.success) return { errors: result.error.flatten().fieldErrors };

  const { email, password } = result.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { message: "Invalid email or password" };

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return { message: "Invalid email or password" };

  await createSession(user.id, email, user.role as "ADMIN" | "VENDOR", user.name);

  if (user.role === "ADMIN") redirect("/admin");
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
