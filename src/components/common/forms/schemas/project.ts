import { z } from 'zod';

/** Create/edit project form. Mirrors the API rules. */
export const projectSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
  description: z.string().trim().max(1000, 'Description must be at most 1000 characters'),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
