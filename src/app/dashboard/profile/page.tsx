import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { ProfileForm } from "@/components/profile/profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Phone, Globe, Mail, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";

const STATUS_CONFIG = {
  APPROVED: { label: "Approved", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
  PENDING:  { label: "Pending Review", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  SUSPENDED:{ label: "Suspended", color: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertTriangle },
};

export default async function ProfilePage() {
  const session = await verifySession();
  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: session.userId },
    include: { documents: true },
  });

  const initials = (session.name ?? session.email).split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  const statusCfg = STATUS_CONFIG[profile?.status ?? "PENDING"];
  const StatusIcon = statusCfg.icon;

  const docTypes = profile?.documents.map((d) => d.type) ?? [];
  const completeness = Math.round(
    ([profile?.description, profile?.phone, profile?.location, profile?.gstNumber, profile?.panNumber].filter(Boolean).length / 5) * 100
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Vendor Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your business details and compliance documents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-3">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-slate-900 text-lg">{profile?.businessName ?? session.name}</p>
              <p className="text-slate-500 text-sm">{session.email}</p>
            </div>
            <Badge variant="outline" className={`text-xs flex items-center gap-1 ${statusCfg.color}`}>
              <StatusIcon className="w-3 h-3" /> {statusCfg.label}
            </Badge>

            {profile?.rejectionNote && (
              <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 text-left">
                <p className="font-medium">Rejection note:</p>
                <p className="mt-0.5">{profile.rejectionNote}</p>
              </div>
            )}

            <div className="w-full bg-slate-50 rounded-lg p-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-600 font-medium">Profile completeness</span>
                <span className="text-slate-800 font-bold">{completeness}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${completeness}%` }} />
              </div>
            </div>

            <div className="w-full space-y-2 text-xs text-slate-500">
              {profile?.location && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />{profile.location}</div>}
              {profile?.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{profile.phone}</div>}
              {profile?.contactEmail && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{profile.contactEmail}</div>}
              {profile?.website && <div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /><a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">{profile.website}</a></div>}
            </div>

            <div className="w-full">
              <p className="text-xs font-medium text-slate-700 mb-2 text-left">Documents uploaded</p>
              <div className="flex flex-wrap gap-1.5">
                {["GST", "PAN", "LICENSE", "AGREEMENT", "INSURANCE"].map((t) => (
                  <Badge key={t} variant="outline" className={`text-xs ${docTypes.includes(t as never) ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-400"}`}>
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-slate-800">Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm profile={profile} />
            </CardContent>
          </Card>
        </div>
      </div>

      {profile && (
        <Card className="border-0 shadow-sm bg-primary/5">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800 text-sm">Public Inquiry Link</p>
              <p className="text-xs text-slate-500 mt-0.5">Share with clients to receive booking inquiries</p>
            </div>
            <a href={`/inquire/${profile.id}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary font-medium hover:underline whitespace-nowrap">
              /inquire/{profile.id.slice(0, 8)}… →
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
