import {
  getUserOrders,
  getOrderById,
  getAllOrders,
} from "~/server/api/funcs/order/order.funcs";

import {
  getUserOrdersSchema,
  getOrderByIdSchema,
  getAllOrdersSchema,
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

export const orderListRouter = createTRPCRouter({
  // Listar pedidos do usuário atual
  getUserOrders: protectedProcedure
    .input(getUserOrdersSchema)
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const result = await getUserOrders(input, userId, ctx.db);
      return result;
    }),

  // Obter detalhes de um pedido
  getOrderById: protectedProcedure
    .input(getOrderByIdSchema)
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const isUserAdmin = ctx.user.role === "admin";
      const result = await getOrderById(input, userId, isUserAdmin, ctx.db);
      return result;
    }),

  // Listar todos os pedidos (admin)
  getAllOrders: protectedProcedure
    .input(getAllOrdersSchema)
    .use(({ ctx, next }) => {
      isAdmin(ctx as Record<string, unknown>);
      return next({ ctx });
    })
    .query(async ({ input, ctx }) => {
      const result = await getAllOrders(input, ctx.db);
      return result;
    }),
}); 