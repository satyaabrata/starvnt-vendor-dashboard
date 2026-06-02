import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
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
  pricingMin: z.coerce.number().min(0).optional(),
  pricingMax: z.coerce.number().min(0).optional(),
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

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type VendorProfileInput = z.infer<typeof VendorProfileSchema>;
export type InquiryInput = z.infer<typeof InquirySchema>;
