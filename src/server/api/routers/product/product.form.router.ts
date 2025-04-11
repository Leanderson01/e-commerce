import {
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
  uploadProductImage,
} from "~/server/api/funcs/product/product.funcs";

import {
  createProductSchema,
  updateProductSchema,
  updateProductStockSchema,
  deleteProductSchema,
  uploadProductImageSchema,
} from "~/server/api/funcs/product/product.types";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

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

export const productFormRouter = createTRPCRouter({
  // Adicionar novo produto (admin)
  createProduct: protectedProcedure
    .input(createProductSchema)
    .use(({ ctx, next }) => {
      isAdmin(ctx as Record<string, unknown>);
      return next({ ctx });
    })
    .mutation(async ({ input, ctx }) => {
      const result = await createProduct(input, ctx.db);
      return result;
    }),

  // Atualizar dados do produto (admin)
  updateProduct: protectedProcedure
    .input(updateProductSchema)
    .use(({ ctx, next }) => {
      isAdmin(ctx as Record<string, unknown>);
      return next({ ctx });
    })
    .mutation(async ({ input, ctx }) => {
      const result = await updateProduct(input, ctx.db);
      return result;
    }),

  // Atualizar estoque do produto (admin)
  updateProductStock: protectedProcedure
    .input(updateProductStockSchema)
    .use(({ ctx, next }) => {
      isAdmin(ctx as Record<string, unknown>);
      return next({ ctx });
    })
    .mutation(async ({ input, ctx }) => {
      const result = await updateProductStock(input, ctx.db);
      return result;
    }),

  // Remover produto (admin)
  deleteProduct: protectedProcedure
    .input(deleteProductSchema)
    .use(({ ctx, next }) => {
      isAdmin(ctx as Record<string, unknown>);
      return next({ ctx });
    })
    .mutation(async ({ input, ctx }) => {
      const result = await deleteProduct(input, ctx.db);
      return result;
    }),

  // Enviar imagem de produto (admin)
  uploadProductImage: protectedProcedure
    .input(uploadProductImageSchema)
    .use(({ ctx, next }) => {
      isAdmin(ctx as Record<string, unknown>);
      return next({ ctx });
    })
    .mutation(async ({ input, ctx }) => {
      const result = await uploadProductImage(input, ctx.db, ctx.supabase);
      return result;
    }),
});
