import {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
} from "~/server/api/funcs/category/category.funcs";

import {
  getCategoriesSchema,
  getCategoryByIdSchema,
  getCategoryBySlugSchema,
} from "~/server/api/funcs/category/category.types";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const categoryListRouter = createTRPCRouter({
  // Listar todas as categorias
  getCategories: publicProcedure
    .input(getCategoriesSchema)
    .query(async ({ input, ctx }) => {
      return await getCategories(input, ctx.db);
    }),

  // Obter detalhes de uma categoria
  getCategoryById: publicProcedure
    .input(getCategoryByIdSchema)
    .query(async ({ input, ctx }) => {
      return await getCategoryById(input, ctx.db);
    }),

  // Obter categoria por slug
  getCategoryBySlug: publicProcedure
    .input(getCategoryBySlugSchema)
    .query(async ({ input, ctx }) => {
      return await getCategoryBySlug(input, ctx.db);
    }),
});
