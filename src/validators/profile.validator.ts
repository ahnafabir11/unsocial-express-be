import { z } from 'zod';

export const updateProfileBodySchema = z.object({
  fullName: z.string().trim().min(6).optional(),
  about: z.string().max(1000).nullable().optional(),
  removeProfilePicture: z.coerce.boolean().optional(),
  removeCoverPicture: z.coerce.boolean().optional(),
});

export type UpdateProfileBodyType = z.infer<typeof updateProfileBodySchema>;
