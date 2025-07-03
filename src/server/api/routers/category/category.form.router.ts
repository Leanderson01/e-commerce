import {
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryBanner,
} from "~/server/api/funcs/category/category.funcs";

import {
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
  uploadCategoryBannerSchema,
} from "~/server/api/funcs/category/category.types";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

// Verificação para permissão de admin
const isAdmin = (ctx: Record<string, unknown>) => {
  if (
    !ctx.user ||
    typeof ctx.user !== "object" ||
    !("role" in ctx.user) ||
    ctx.user.role !== "admin"
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Apenas administradores podem realizar esta operação",
    });
  }
  return true;
};

export const categoryFormRouter = createTRPCRouter({
  // Adicionar nova categoria (admin)
  createCategory: protectedProcedure
    .input(createCategorySchema)
    .mutation(async ({ input, ctx }) => {
      isAdmin(ctx);
      return await createCategory(input, ctx.db);
    }),

  // Atualizar categoria (admin)
  updateCategory: protectedProcedure
    .input(updateCategorySchema)
    .mutation(async ({ input, ctx }) => {
      isAdmin(ctx);
      return await updateCategory(input, ctx.db);
    }),

  // Remover categoria (admin)
  deleteCategory: protectedProcedure
    .input(deleteCategorySchema)
    .mutation(async ({ input, ctx }) => {
      isAdmin(ctx);
      return await deleteCategory(input, ctx.db);
    }),

  // Upload banner da categoria (admin)
  uploadCategoryBanner: protectedProcedure
    .input(uploadCategoryBannerSchema)
    .mutation(async ({ input, ctx }) => {
      isAdmin(ctx);
      return await uploadCategoryBanner(input, ctx.db, ctx.supabase);
    }),
});
