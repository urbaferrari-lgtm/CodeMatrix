import { z } from 'zod';

export const runCodeSchema = z.object({
  language: z.enum(['javascript', 'typescript', 'python', 'cpp', 'java', 'rust', 'go']),
  code: z.string().min(1).max(50000),
});
