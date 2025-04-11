import { z } from "zod";

// Schema para obter total de compras por cliente em período
export const getOrdersByCustomerSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// Schema para listar produtos sem estoque
export const getOutOfStockProductsSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// Schema para obter receita diária em período específico
export const getDailyRevenueSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});

// Types
export type GetOrdersByCustomerInput = z.infer<typeof getOrdersByCustomerSchema>;
export type GetOutOfStockProductsInput = z.infer<typeof getOutOfStockProductsSchema>;
export type GetDailyRevenueInput = z.infer<typeof getDailyRevenueSchema>; 