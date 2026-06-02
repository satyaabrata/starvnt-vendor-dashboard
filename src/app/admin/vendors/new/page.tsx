import { verifyAdmin } from "@/lib/dal";
import { CreateVendorForm } from "@/components/admin/create-vendor-form";
import Link from "next/link";

export default async function NewVendorPage() {
  await verifyAdmin();
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/admin/vendors" className="text-sm text-slate-500 hover:text-slate-700">
          ← Vendors
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Add Vendor</h1>
        <p className="text-slate-500 text-sm mt-1">
          Create a vendor account and profile directly from admin
        </p>
      </div>
      <CreateVendorForm />
    </div>
  );
}
