import { z } from 'zod';

// ─── Cart ────────────────────────────────────────────────────────────────────

export const addToCartSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)], {
    errorMap: () => ({ message: 'Tier must be 1, 2, or 3' }),
  }),
});

export const removeFromCartSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>;

// ─── Checkout ─────────────────────────────────────────────────────────────────

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1, 'Razorpay order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay signature is required'),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

// ─── User Profile ─────────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .trim(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ─── Projects Query ───────────────────────────────────────────────────────────

export const projectsQuerySchema = z.object({
  search: z.string().optional().default(''),
  category: z.string().optional().default(''),
  techStack: z.string().optional().default(''),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sortBy: z.enum(['createdAt', 'price', 'popularity', 'views', 'title']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
});

export type ProjectsQueryInput = z.infer<typeof projectsQuerySchema>;
