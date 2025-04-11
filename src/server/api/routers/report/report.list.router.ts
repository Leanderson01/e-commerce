import {
  getOrdersByCustomer,
  getOutOfStockProducts,
  getDailyRevenue,
} from "~/server/api/funcs/report/report.funcs";

import {
  getOrdersByCustomerSchema,
  getOutOfStockProductsSchema,
  getDailyRevenueSchema,
} from "~/server/api/funcs/report/report.types";

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

export const reportListRouter = createTRPCRouter({
  // Obter total de compras por cliente em período
  getOrdersByCustomer: protectedProcedure
    .input(getOrdersByCustomerSchema)
    .use(({ ctx, next }) => {
      isAdmin(ctx as Record<string, unknown>);
      return next({ ctx });
    })
    .query(async ({ input, ctx }) => {
      const result = await getOrdersByCustomer(input, ctx.db);
      return result;
    }),

  // Listar produtos sem estoque
  getOutOfStockProducts: protectedProcedure
    .input(getOutOfStockProductsSchema)
    .use(({ ctx, next }) => {
      isAdmin(ctx as Record<string, unknown>);
      return next({ ctx });
    })
    .query(async ({ input, ctx }) => {
      const result = await getOutOfStockProducts(input, ctx.db);
      return result;
    }),

  // Obter receita diária em período específico
  getDailyRevenue: protectedProcedure
    .input(getDailyRevenueSchema)
    .use(({ ctx, next }) => {
      isAdmin(ctx as Record<string, unknown>);
      return next({ ctx });
    })
    .query(async ({ input, ctx }) => {
      const result = await getDailyRevenue(input, ctx.db);
      return result;
    }),
}); 