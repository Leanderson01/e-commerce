import { z } from "zod";
import { UserRoleEnum } from "~/server/db/src/schema/user/user.table";

// Schema para login de usuários
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Schema para cadastro de usuários
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

// Schema para verificação de e-mail
export const verifyEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  token: z.string(),
});

// Schema para redefinição de senha
export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Schema para confirmar redefinição de senha
export const confirmResetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  token: z.string(),
  newPassword: z.string().min(6, "Password must be at least 6 characters long"),
});

// Schema para atualização de perfil de usuário
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

// Schema para exclusão de conta de usuário
export const deleteUserAccountSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Tipos inferidos dos schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ConfirmResetPasswordInput = z.infer<
  typeof confirmResetPasswordSchema
>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type DeleteUserAccountInput = z.infer<typeof deleteUserAccountSchema>;
