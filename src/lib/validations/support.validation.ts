import { z } from 'zod';
import { Priority } from '@prisma/client';

export const createTicketSchema = z.object({
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(150, 'Subject must be less than 150 characters')
    .trim(),
  description: z
    .string()
    .min(20, 'Please describe your issue in at least 20 characters')
    .max(5000, 'Description must be less than 5000 characters')
    .trim(),
  priority: z.nativeEnum(Priority).optional().default(Priority.MEDIUM),
});

export const respondToTicketSchema = z.object({
  message: z
    .string()
    .min(5, 'Response must be at least 5 characters')
    .max(5000, 'Response must be less than 5000 characters')
    .trim(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type RespondToTicketInput = z.infer<typeof respondToTicketSchema>;
