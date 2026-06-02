import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "./session";
import { prisma } from "./db";

export const verifySession = cache(async () => {
  const session = await getSession();
  if (!session?.userId) redirect("/login");
  return session;
});

export const verifyAdmin = cache(async () => {
  const session = await getSession();
  if (!session?.userId) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard");
  return session;
});

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session?.userId) return null;
  return prisma.user.findUnique({
    where: { id: session.userId },
    include: { vendorProfile: true },
  });
});
