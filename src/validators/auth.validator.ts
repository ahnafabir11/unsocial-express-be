import { z } from 'zod';

export const signupBodySchema = z
  .object({
    fullName: z.string().trim().min(6),
    email: z.string().toLowerCase().email(),
    password: z.string().trim().min(6),
    confirmPassword: z.string().trim().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords didn't match!",
    path: ['confirmPassword'],
  });

export type SignupBodyType = z.infer<typeof signupBodySchema>;
