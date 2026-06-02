"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { verifyDocument } from "@/actions/vendor";
import { toast } from "sonner";

export function ComplianceActions({ docId, fileUrl, isVerified }: { docId: string; fileUrl: string; isVerified: boolean }) {
  const [isPending, startTransition] = useTransition();
  const handleVerify = () => startTransition(async () => {
    const r = await verifyDocument(docId);
    r.success ? toast.success("Document verified") : toast.error("Failed to verify");
  });
  return (
    <div className="flex items-center gap-2">
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">View</a>
      {!isVerified && (
        <Button size="sm" className="h-6 text-xs" onClick={handleVerify} disabled={isPending}>
          {isPending ? "…" : "Verify"}
        </Button>
      )}
    </div>
  );
}
