import { z } from "zod";
import { UserRoleEnum } from "~/server/db/src/schema/user/user.table";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(UserRoleEnum.enumValues).default("client"),
  profile: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }),
});

export const verifyEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  token: z.string(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const confirmResetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  token: z.string(),
  newPassword: z.string().min(6, "Password must be at least 6 characters long"),
});

export const updateUserProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
});

export const updateUserProfileWithPasswordSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters long").optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const deleteUserAccountSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ConfirmResetPasswordInput = z.infer<
  typeof confirmResetPasswordSchema
>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type UpdateUserProfileWithPasswordInput = z.infer<typeof updateUserProfileWithPasswordSchema>;
export type DeleteUserAccountInput = z.infer<typeof deleteUserAccountSchema>;
