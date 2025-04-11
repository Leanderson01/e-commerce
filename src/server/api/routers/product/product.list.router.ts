import {
  getProducts,
  getProductById,
  getProductsByCategory,
} from "~/server/api/funcs/product/product.funcs";

import {
  getProductsSchema,
  getProductByIdSchema,
  getProductsByCategorySchema,
} from "~/server/api/funcs/product/product.types";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const productListRouter = createTRPCRouter({
  // Listar produtos disponíveis/em estoque
  getProducts: publicProcedure
    .input(getProductsSchema)
    .query(async ({ input, ctx }) => {
      const result = await getProducts(input, ctx.db);
      return result;
    }),

  // Obter detalhes de um produto
  getProductById: publicProcedure
    .input(getProductByIdSchema)
    .query(async ({ input, ctx }) => {
      const result = await getProductById(input, ctx.db);
      return result;
    }),

  // Listar produtos por categoria
  getProductsByCategory: publicProcedure
    .input(getProductsByCategorySchema)
    .query(async ({ input, ctx }) => {
      const result = await getProductsByCategory(input, ctx.db);
      return result;
    }),
});
