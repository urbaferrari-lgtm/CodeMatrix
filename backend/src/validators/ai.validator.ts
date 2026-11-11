import { z } from 'zod';

export const generateSchema = z.object({
  prompt: z.string().trim().min(1).max(10000),
  context: z.string().max(20000).optional(),
});
