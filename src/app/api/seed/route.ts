import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { subDays } from "date-fns";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "Seeding not allowed in production" }, { status: 403 });
  }

  await prisma.eventInquiry.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 12);

  const user = await prisma.user.create({
    data: {
      name: "Satyabrata Das",
      email: "demo@starvnt.com",
      passwordHash,
      vendorProfile: {
        create: {
          businessName: "StarVnt Entertainment",
          category: "DJ / Music",
          description:
            "Professional DJ and entertainment services for weddings, corporate events, and private parties. 10+ years of experience.",
          location: "Bhubaneswar, Odisha",
          phone: "+91 98765 43210",
          contactEmail: "demo@starvnt.com",
          website: "https://starvnt.com",
          pricingMin: 15000,
          pricingMax: 75000,
        },
      },
    },
    include: { vendorProfile: true },
  });

  const vendorId = user.vendorProfile!.id;

  const inquiries = [
    { clientName: "Priya Sharma", clientEmail: "priya@example.com", clientPhone: "+91 9876500001", eventType: "Wedding", eventDate: subDays(new Date(), 5), venue: "Hotel Mayfair, BBSR", guestCount: 300, budget: 50000, status: "confirmed", message: "Looking for a full night DJ set with Bollywood and EDM mix." },
    { clientName: "Rahul Mehta", clientEmail: "rahul@example.com", clientPhone: "+91 9876500002", eventType: "Corporate Event", eventDate: subDays(new Date(), 10), venue: "KIIT Tech Park", guestCount: 150, budget: 30000, status: "completed", message: "Annual company party, need professional setup." },
    { clientName: "Ananya Singh", clientEmail: "ananya@example.com", eventType: "Birthday Party", eventDate: subDays(new Date(), 2), venue: "Private Residence, Cuttack", guestCount: 80, budget: 20000, status: "confirmed" },
    { clientName: "Vikram Patel", clientEmail: "vikram@example.com", clientPhone: "+91 9876500004", eventType: "Engagement", eventDate: subDays(new Date(), 15), venue: "Kalinga Stadium Banquet", guestCount: 200, budget: 40000, status: "rejected", message: "Budget is tight, need negotiation." },
    { clientName: "Sneha Roy", clientEmail: "sneha@example.com", eventType: "Wedding", eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), guestCount: 400, budget: 65000, status: "pending", message: "Destination wedding, need full entertainment package." },
    { clientName: "Deepak Kumar", clientEmail: "deepak@example.com", clientPhone: "+91 9876500006", eventType: "Birthday Party", eventDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), venue: "Trident Hotel, BBSR", guestCount: 50, budget: 15000, status: "pending" },
    { clientName: "Meera Nair", clientEmail: "meera@example.com", eventType: "Cultural Program", eventDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), guestCount: 500, budget: 75000, status: "pending", message: "Odia cultural festival, need traditional + modern mix." },
    { clientName: "Arjun Bose", clientEmail: "arjun@example.com", eventType: "Anniversary", eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), venue: "Mayfair Lagoon", guestCount: 100, budget: 25000, status: "confirmed" },
  ];

  await prisma.eventInquiry.createMany({
    data: inquiries.map((i) => ({ ...i, vendorId })),
  });

  return Response.json({ success: true, message: "Seeded successfully", email: "demo@starvnt.com", password: "password123" });
}
