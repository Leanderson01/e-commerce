import {
  createOrder,
  deleteOrder,
} from "~/server/api/funcs/order/order.funcs";

import {
  createOrderSchema,
  deleteOrderSchema,
} from "~/server/api/funcs/order/order.types";

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

export const orderFormRouter = createTRPCRouter({
  // Criar pedido a partir do carrinho atual
  createOrder: protectedProcedure
    .input(createOrderSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const result = await createOrder(input, userId, ctx.db);
      return result;
    }),

  // Remover um pedido (admin)
  deleteOrder: protectedProcedure
    .input(deleteOrderSchema)
    .use(({ ctx, next }) => {
      isAdmin(ctx as Record<string, unknown>);
      return next({ ctx });
    })
    .mutation(async ({ input, ctx }) => {
      const result = await deleteOrder(input, ctx.db);
      return result;
    }),
}); 