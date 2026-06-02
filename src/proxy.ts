import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

const adminRoutes = ["/admin"];
const vendorRoutes = ["/dashboard"];
const publicRoutes = ["/login", "/register", "/"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isAdminRoute = adminRoutes.some((r) => path.startsWith(r));
  const isVendorRoute = vendorRoutes.some((r) => path.startsWith(r));
  const isPublic = publicRoutes.includes(path);

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  const session = await decrypt(sessionCookie);

  if ((isAdminRoute || isVendorRoute) && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isAdminRoute && session?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  if (isPublic && session?.userId && path !== "/") {
    const dest = session.role === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(dest, req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|inquire).*)"],
};
