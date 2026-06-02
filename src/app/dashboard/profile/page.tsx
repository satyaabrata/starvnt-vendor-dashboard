import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { ProfileForm } from "@/components/profile/profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Phone, Globe, Mail } from "lucide-react";

export default async function ProfilePage() {
  const session = await verifySession();
  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: session.userId },
  });

  const initials = (session.name ?? session.email)
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Vendor Profile</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your public profile and business details
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-3">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-slate-900 text-lg">
                {profile?.businessName ?? session.name}
              </p>
              <p className="text-slate-500 text-sm">{session.email}</p>
            </div>
            {profile?.category && (
              <Badge variant="secondary" className="text-xs">
                {profile.category}
              </Badge>
            )}
            <div className="w-full space-y-2 pt-2 text-xs text-slate-500">
              {profile?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile?.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{profile.contactEmail}</span>
                </div>
              )}
              {profile?.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate"
                  >
                    {profile.website}
                  </a>
                </div>
              )}
            </div>
            {profile?.pricingMin != null && (
              <div className="w-full bg-slate-50 rounded-lg p-3 text-xs">
                <p className="text-slate-500">Pricing Range</p>
                <p className="font-semibold text-slate-800 mt-0.5">
                  ₹{profile.pricingMin.toLocaleString("en-IN")}
                  {profile.pricingMax
                    ? ` – ₹${profile.pricingMax.toLocaleString("en-IN")}`
                    : "+"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-slate-800">
                Edit Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm profile={profile} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Public Inquiry Link */}
      {profile && (
        <Card className="border-0 shadow-sm bg-primary/5 border-primary/10">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800 text-sm">Public Inquiry Link</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Share this link with clients to receive booking inquiries
              </p>
            </div>
            <a
              href={`/inquire/${profile.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary font-medium hover:underline whitespace-nowrap"
            >
              /inquire/{profile.id.slice(0, 8)}… →
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
