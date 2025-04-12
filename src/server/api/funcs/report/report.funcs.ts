import type { DBClient } from "~/server/db/src/client";
import { OrdersTable } from "~/server/db/src/schema/order/order.table";
import { ProductsTable } from "~/server/db/src/schema/product/product.table";
import { UsersTable } from "~/server/db/src/schema/user/user.table";
import { ProfilesTable } from "~/server/db/src/schema/user/profile.table";
import { sql, desc, asc, count, eq, and, gte, lte } from "drizzle-orm";
import type {
  GetOrdersByCustomerInput,
  GetOutOfStockProductsInput,
  GetDailyRevenueInput,
} from "./report.types";
import { TRPCError } from "@trpc/server";

// Obter total de compras por cliente em período
export const getOrdersByCustomer = async (
  input: GetOrdersByCustomerInput,
  db: DBClient,
) => {
  try {
    // Converter as datas de entrada
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);

    // Validar as datas
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Datas inválidas",
      });
    }

    // Consulta para obter total de compras por cliente no período
    const customerOrders = await db
      .select({
        userId: OrdersTable.userId,
        userName: ProfilesTable.fullName,
        totalOrders: count(OrdersTable.id),
        totalValue: sql<string>`SUM(${OrdersTable.totalAmount})`,
      })
      .from(OrdersTable)
      .innerJoin(UsersTable, eq(OrdersTable.userId, UsersTable.id))
      .leftJoin(ProfilesTable, eq(UsersTable.id, ProfilesTable.userId))
      .where(
        and(
          gte(OrdersTable.orderDate, startDate),
          lte(OrdersTable.orderDate, endDate),
        ),
      )
      .groupBy(OrdersTable.userId, ProfilesTable.fullName)
      .orderBy(desc(sql`COUNT(${OrdersTable.id})`))
      .limit(input.limit)
      .offset(input.offset);

    // Contar total de clientes distintos com compras no período
    const totalResult = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${OrdersTable.userId})`,
      })
      .from(OrdersTable)
      .where(
        and(
          gte(OrdersTable.orderDate, startDate),
          lte(OrdersTable.orderDate, endDate),
        ),
      );

    const total = totalResult[0]?.count ?? 0;

    return {
      customerOrders,
      pagination: {
        total,
        limit: input.limit,
        offset: input.offset,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar compras por cliente:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao obter relatório de compras por cliente",
      cause: error,
    });
  }
};

// Listar produtos sem estoque
export const getOutOfStockProducts = async (
  input: GetOutOfStockProductsInput,
  db: DBClient,
) => {
  try {
    // Buscar produtos com estoque zero ou negativo
    const products = await db.query.ProductsTable.findMany({
      where: (products, { lte }) => lte(products.stockQuantity, 0),
      limit: input.limit,
      offset: input.offset,
      orderBy: [asc(ProductsTable.name)],
      with: {
        _category: true,
      },
    });

    // Contar total de produtos sem estoque
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(ProductsTable)
      .where(lte(ProductsTable.stockQuantity, 0));

    const total = countResult[0]?.count ?? 0;

    return {
      products,
      pagination: {
        total,
        limit: input.limit,
        offset: input.offset,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar produtos sem estoque:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao obter relatório de produtos sem estoque",
      cause: error,
    });
  }
};

// Obter receita diária em período específico
export const getDailyRevenue = async (
  input: GetDailyRevenueInput,
  db: DBClient,
) => {
  try {
    // Converter as datas de entrada
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);

    // Validar as datas
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Datas inválidas",
      });
    }

    // Consulta para obter receita diária no período
    const dailyRevenue = await db
      .select({
        date: sql<string>`DATE(${OrdersTable.orderDate})`,
        totalRevenue: sql<string>`SUM(${OrdersTable.totalAmount})`,
        orderCount: count(OrdersTable.id),
      })
      .from(OrdersTable)
      .where(
        and(
          gte(OrdersTable.orderDate, startDate),
          lte(OrdersTable.orderDate, endDate),
        ),
      )
      .groupBy(sql`DATE(${OrdersTable.orderDate})`)
      .orderBy(asc(sql`DATE(${OrdersTable.orderDate})`));

    // Calcular o total geral no período
    const totalResult = await db
      .select({
        totalRevenue: sql<string>`SUM(${OrdersTable.totalAmount})`,
        totalOrders: count(OrdersTable.id),
        totalDays: sql<number>`COUNT(DISTINCT DATE(${OrdersTable.orderDate}))`,
      })
      .from(OrdersTable)
      .where(
        and(
          gte(OrdersTable.orderDate, startDate),
          lte(OrdersTable.orderDate, endDate),
        ),
      );

    return {
      dailyRevenue,
      summary: {
        totalRevenue: totalResult[0]?.totalRevenue ?? "0",
        totalOrders: totalResult[0]?.totalOrders ?? 0,
        totalDays: totalResult[0]?.totalDays ?? 0,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      },
    };
  } catch (error) {
    console.error("Erro ao buscar receita diária:", error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao obter relatório de receita diária",
      cause: error,
    });
  }
};
