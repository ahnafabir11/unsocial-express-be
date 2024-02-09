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

export const loginBodySchema = z.object({
  email: z.string().toLowerCase().email(),
  password: z.string().trim().min(6),
});

export type LoginBodyType = z.infer<typeof signupBodySchema>;

export const changePasswordBodySchema = z
  .object({
    oldPassword: z.string().trim().min(6),
    newPassword: z.string().trim().min(6),
    confirmPassword: z.string().trim().min(6),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords didn't match!",
    path: ['confirmPassword'],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: 'Cannot set the same password',
    path: ['newPassword'],
  });

export type ChangePasswordBodyType = z.infer<typeof changePasswordBodySchema>;
