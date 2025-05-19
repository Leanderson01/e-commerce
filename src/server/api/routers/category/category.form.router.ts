import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "~/server/api/funcs/category/category.funcs";

import {
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
} from "~/server/api/funcs/category/category.types";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

// Verificação para permissão de admin
const isAdmin = (ctx: Record<string, unknown>) => {
  if (!ctx.user || typeof ctx.user !== 'object' || !('role' in ctx.user) || ctx.user.role !== "admin") {
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
      const result = await createCategory(input, ctx.db);
      return result;
    }),

  // Atualizar categoria (admin)
  updateCategory: protectedProcedure
    .input(updateCategorySchema)
    .mutation(async ({ input, ctx }) => {
      const result = await updateCategory(input, ctx.db);
      return result;
    }),

  // Remover categoria (admin)
  deleteCategory: protectedProcedure
    .input(deleteCategorySchema)
    .mutation(async ({ input, ctx }) => {
      const result = await deleteCategory(input, ctx.db);
      return result;
    }),
}); 