import { z } from 'zod';

export const usersQuerySchema = z.object({
  search: z.string().default(''),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(50),
});
