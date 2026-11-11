import { z } from 'zod';

export const createFileSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1),
  path: z.string().min(1),
  fileType: z.enum(['file', 'folder']),
  content: z.string().optional(),
  parent: z.string().optional(),
});

export const updateFileSchema = z.object({
  content: z.string(),
});

