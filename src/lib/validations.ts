import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Must contain at least one letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

export const LoginSchema = z.object({
  email: z.email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const VendorProfileSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  contactEmail: z.email("Invalid email").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  licenseNumber: z.string().optional(),
  pricingMin: z.coerce.number().min(0).optional(),
  pricingMax: z.coerce.number().min(0).optional(),
});

export const DocumentSchema = z.object({
  type: z.enum(["GST", "PAN", "LICENSE", "AGREEMENT", "INSURANCE", "OTHER"]),
  name: z.string().min(1, "Document name is required"),
  fileUrl: z.string().url("Must be a valid URL"),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
});

export const POSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  tax: z.coerce.number().min(0).default(0),
  expectedDate: z.string().optional(),
});

export const POItemSchema = z.object({
  name: z.string().min(1),
  qty: z.coerce.number().min(1),
  unitPrice: z.coerce.number().min(0),
});

export const ContractSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  fileUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  value: z.coerce.number().min(0).optional(),
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().min(1, "End date required"),
});

export const InvoiceSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  poId: z.string().optional(),
  description: z.string().optional(),
  subtotal: z.coerce.number().min(0, "Amount required"),
  tax: z.coerce.number().min(0).default(0),
  dueDate: z.string().optional(),
  fileUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  notes: z.string().optional(),
});

export const PaymentSchema = z.object({
  amount: z.coerce.number().min(1, "Amount required"),
  method: z.string().min(1, "Payment method required"),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const PerformanceReviewSchema = z.object({
  vendorId: z.string().min(1, "Vendor required"),
  overallRating: z.coerce.number().min(1).max(5),
  deliveryScore: z.coerce.number().min(1).max(5).optional(),
  qualityScore: z.coerce.number().min(1).max(5).optional(),
  communicationScore: z.coerce.number().min(1).max(5).optional(),
  comment: z.string().optional(),
});

export const InquirySchema = z.object({
  clientName: z.string().min(2, "Name is required"),
  clientEmail: z.email("Valid email required"),
  clientPhone: z.string().optional(),
  eventType: z.string().min(1, "Event type is required"),
  eventDate: z.string().min(1, "Event date is required"),
  venue: z.string().optional(),
  guestCount: z.coerce.number().min(1).optional(),
  budget: z.coerce.number().min(0).optional(),
  message: z.string().optional(),
});
