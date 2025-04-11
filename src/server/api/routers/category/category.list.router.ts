import {
  getCategories,
  getCategoryById,
} from "~/server/api/funcs/category/category.funcs";

import {
  getCategoriesSchema,
  getCategoryByIdSchema,
} from "~/server/api/funcs/category/category.types";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const categoryListRouter = createTRPCRouter({
  // Listar todas as categorias
  getCategories: publicProcedure
    .input(getCategoriesSchema)
    .query(async ({ input, ctx }) => {
      const result = await getCategories(input, ctx.db);
      return result;
    }),

  // Obter detalhes de uma categoria
  getCategoryById: publicProcedure
    .input(getCategoryByIdSchema)
    .query(async ({ input, ctx }) => {
      const result = await getCategoryById(input, ctx.db);
      return result;
    }),
}); 