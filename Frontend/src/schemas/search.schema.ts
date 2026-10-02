import { z } from 'zod';

export const searchSchema = z.object({
  q: z.string().trim().min(2, 'Enter at least two characters to search.'),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type SearchFormValues = z.infer<typeof searchSchema>;
