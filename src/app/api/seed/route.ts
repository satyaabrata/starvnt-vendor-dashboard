import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { subDays, addDays, subMonths } from "date-fns";

export async function POST() {

  // Clear all data
  await prisma.notification.deleteMany();
  await prisma.performanceReview.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.vendorDocument.deleteMany();
  await prisma.eventInquiry.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 12);

  // Admin user
  const admin = await prisma.user.create({
    data: { name: "StarVnt Admin", email: "admin@starvnt.com", passwordHash, role: "ADMIN" },
  });

  // Vendor users
  const vendorData = [
    { name: "Satyabrata Das", email: "demo@starvnt.com", business: "StarVnt Entertainment", category: "DJ / Music", status: "APPROVED", gst: "21AAACS1429B1ZH", pan: "AAACS1429B", location: "Bhubaneswar, Odisha", phone: "+91 98765 43210", pricingMin: 15000, pricingMax: 75000, rating: 4.5 },
    { name: "Priya Sharma", email: "priya@vendor.com", business: "Priya Photography", category: "Photography", status: "APPROVED", gst: "27AAABP1234C1ZK", pan: "AAABP1234C", location: "Mumbai, Maharashtra", phone: "+91 98765 43211", pricingMin: 25000, pricingMax: 80000, rating: 4.2 },
    { name: "Rahul Mehra", email: "rahul@vendor.com", business: "Royal Decorators", category: "Decoration", status: "APPROVED", gst: "07AAAPR5678D1ZM", pan: "AAAPR5678D", location: "Delhi, NCR", phone: "+91 98765 43212", pricingMin: 20000, pricingMax: 100000, rating: 4.7 },
    { name: "Ananya Singh", email: "ananya@vendor.com", business: "Ananya Catering", category: "Catering", status: "PENDING", location: "Kolkata, West Bengal", phone: "+91 98765 43213", pricingMin: 50000, pricingMax: 200000, rating: null },
    { name: "Vikram Patel", email: "vikram@vendor.com", business: "Vikram Lighting", category: "Lighting & Sound", status: "REJECTED", location: "Ahmedabad, Gujarat", phone: "+91 98765 43214", pricingMin: 10000, pricingMax: 50000, rating: null },
  ];

  const vendors = [];
  for (const v of vendorData) {
    const user = await prisma.user.create({
      data: {
        name: v.name, email: v.email, passwordHash, role: "VENDOR",
        vendorProfile: {
          create: {
            businessName: v.business, category: v.category,
            description: `Professional ${v.category.toLowerCase()} services for all types of events.`,
            location: v.location, phone: v.phone, contactEmail: v.email,
            gstNumber: "gst" in v ? v.gst : null, panNumber: "pan" in v ? v.pan : null,
            pricingMin: v.pricingMin, pricingMax: v.pricingMax,
            status: v.status as never, avgRating: v.rating, totalRatings: v.rating ? 3 : 0,
            approvedAt: v.status === "APPROVED" ? subDays(new Date(), 30) : null,
            approvedById: v.status === "APPROVED" ? admin.id : null,
            rejectionNote: v.status === "REJECTED" ? "Incomplete documentation and pricing too high" : null,
          },
        },
      },
      include: { vendorProfile: true },
    });
    vendors.push(user);
  }

  const approvedVendors = vendors.filter((v) => v.vendorProfile?.status === "APPROVED");

  // Documents
  for (const v of approvedVendors) {
    const vid = v.vendorProfile!.id;
    await prisma.vendorDocument.createMany({
      data: [
        { vendorId: vid, type: "GST", name: "GST Certificate", fileUrl: "https://example.com/gst.pdf", isVerified: true, verifiedAt: subDays(new Date(), 20), expiryDate: addDays(new Date(), 365) },
        { vendorId: vid, type: "PAN", name: "PAN Card", fileUrl: "https://example.com/pan.pdf", isVerified: true, verifiedAt: subDays(new Date(), 20) },
        { vendorId: vid, type: "LICENSE", name: "Business License", fileUrl: "https://example.com/license.pdf", isVerified: false, expiryDate: addDays(new Date(), 90) },
      ],
    });
  }

  // Inquiries for first vendor
  const vendorProfile = approvedVendors[0].vendorProfile!;
  await prisma.eventInquiry.createMany({
    data: [
      { vendorId: vendorProfile.id, clientName: "Meera Roy", clientEmail: "meera@client.com", clientPhone: "+91 9800000001", eventType: "Wedding", eventDate: addDays(new Date(), 45), venue: "Hotel Mayfair, BBSR", guestCount: 300, budget: 50000, status: "CONFIRMED", message: "Full night DJ set required" },
      { vendorId: vendorProfile.id, clientName: "Arjun Bose", clientEmail: "arjun@client.com", eventType: "Corporate Event", eventDate: addDays(new Date(), 20), venue: "KIIT Tech Park", guestCount: 150, budget: 30000, status: "PENDING", message: "Annual company party" },
      { vendorId: vendorProfile.id, clientName: "Sneha Das", clientEmail: "sneha@client.com", eventType: "Birthday Party", eventDate: subDays(new Date(), 10), guestCount: 80, budget: 20000, status: "COMPLETED" },
    ],
  });

  // Purchase Orders
  const poItems = [{ name: "DJ Equipment Setup", qty: 1, unitPrice: 15000, total: 15000 }, { name: "Sound System (8 hours)", qty: 1, unitPrice: 20000, total: 20000 }, { name: "Lighting Rig", qty: 1, unitPrice: 10000, total: 10000 }];
  const po1 = await prisma.purchaseOrder.create({
    data: { poNumber: "PO-2025-001", vendorId: vendorProfile.id, title: "DJ Services - Meera Wedding", description: "Full night entertainment package", items: poItems, subtotal: 45000, tax: 18, totalAmount: 53100, status: "DELIVERED", orderDate: subDays(new Date(), 50), expectedDate: addDays(new Date(), 45), deliveredAt: subDays(new Date(), 5) },
  });
  const po2 = await prisma.purchaseOrder.create({
    data: { poNumber: "PO-2025-002", vendorId: approvedVendors[1].vendorProfile!.id, title: "Photography - Arjun Corporate", items: [{ name: "Event Photography", qty: 1, unitPrice: 30000, total: 30000 }], subtotal: 30000, tax: 18, totalAmount: 35400, status: "SENT", orderDate: subDays(new Date(), 5), expectedDate: addDays(new Date(), 20) },
  });
  const po3 = await prisma.purchaseOrder.create({
    data: { poNumber: "PO-2025-003", vendorId: approvedVendors[2].vendorProfile!.id, title: "Decoration - Stage & Venue", items: [{ name: "Stage Decoration", qty: 1, unitPrice: 40000, total: 40000 }, { name: "Floral Arrangements", qty: 50, unitPrice: 500, total: 25000 }], subtotal: 65000, tax: 18, totalAmount: 76700, status: "IN_PROGRESS", orderDate: subDays(new Date(), 10), expectedDate: addDays(new Date(), 15) },
  });

  // Contracts
  await prisma.contract.createMany({
    data: [
      { contractNumber: "CTR-2025-001", vendorId: vendorProfile.id, title: "Annual DJ Services Agreement", description: "12-month retainer for all StarVnt events", value: 500000, startDate: subMonths(new Date(), 3), endDate: addDays(new Date(), 270), status: "ACTIVE" },
      { contractNumber: "CTR-2025-002", vendorId: approvedVendors[1].vendorProfile!.id, title: "Photography Services Contract", value: 200000, startDate: subMonths(new Date(), 1), endDate: addDays(new Date(), 25), status: "ACTIVE" },
      { contractNumber: "CTR-2024-001", vendorId: approvedVendors[2].vendorProfile!.id, title: "Decoration Services - Expired Contract", value: 300000, startDate: subMonths(new Date(), 13), endDate: subMonths(new Date(), 1), status: "EXPIRED" },
    ],
  });

  // Invoices
  const inv1 = await prisma.invoice.create({
    data: { invoiceNumber: "INV-2025-001", vendorId: vendorProfile.id, poId: po1.id, description: "DJ Services - Meera Wedding", subtotal: 45000, tax: 8100, totalAmount: 53100, status: "PAID", dueDate: subDays(new Date(), 20), paidAt: subDays(new Date(), 15) },
  });
  await prisma.payment.create({ data: { invoiceId: inv1.id, amount: 53100, method: "Bank Transfer", reference: "NEFT202500123", paidAt: subDays(new Date(), 15) } });

  const inv2 = await prisma.invoice.create({
    data: { invoiceNumber: "INV-2025-002", vendorId: approvedVendors[1].vendorProfile!.id, poId: po2.id, description: "Photography services advance", subtotal: 15000, tax: 2700, totalAmount: 17700, status: "APPROVED", dueDate: addDays(new Date(), 10) },
  });

  await prisma.invoice.create({
    data: { invoiceNumber: "INV-2025-003", vendorId: approvedVendors[2].vendorProfile!.id, poId: po3.id, description: "Decoration advance payment", subtotal: 30000, tax: 5400, totalAmount: 35400, status: "PENDING", dueDate: addDays(new Date(), 5) },
  });

  // Performance reviews
  await prisma.performanceReview.createMany({
    data: [
      { vendorId: vendorProfile.id, overallRating: 5, deliveryScore: 5, qualityScore: 5, communicationScore: 4, comment: "Excellent performance! Crowd loved it.", reviewedBy: "StarVnt Admin", reviewedAt: subDays(new Date(), 5) },
      { vendorId: vendorProfile.id, overallRating: 4, deliveryScore: 4, qualityScore: 4, communicationScore: 5, comment: "Very professional and on time.", reviewedBy: "StarVnt Admin", reviewedAt: subDays(new Date(), 60) },
      { vendorId: approvedVendors[1].vendorProfile!.id, overallRating: 4, deliveryScore: 5, qualityScore: 4, communicationScore: 4, comment: "Great photos, quick delivery.", reviewedBy: "StarVnt Admin", reviewedAt: subDays(new Date(), 15) },
    ],
  });

  // Notifications
  await prisma.notification.createMany({
    data: [
      { userId: admin.id, title: "New Vendor Registration", message: "Ananya Singh has registered as a vendor. Review pending.", type: "GENERAL", link: "/admin/vendors?status=PENDING" },
      { userId: admin.id, title: "Contract Expiring Soon", message: "Photography Services Contract expires in 25 days.", type: "CONTRACT_EXPIRY", link: "/admin/contracts?status=expiring" },
      { userId: approvedVendors[0].id, title: "Profile Approved", message: "Your vendor profile has been approved!", type: "VENDOR_APPROVED", isRead: true },
      { userId: approvedVendors[0].id, title: "New Purchase Order", message: "You have a new PO: DJ Services - Meera Wedding", type: "PO_UPDATE", isRead: true },
    ],
  });

  return Response.json({
    success: true,
    message: "Full VMS data seeded!",
    credentials: { admin: { email: "admin@starvnt.com", password: "password123" }, vendor: { email: "demo@starvnt.com", password: "password123" } },
  });
}
