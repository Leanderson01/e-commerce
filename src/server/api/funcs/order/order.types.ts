import { z } from "zod";

// Schema para criar pedido a partir do carrinho atual
export const createOrderSchema = z.object({
  // Não precisa de parâmetros específicos, pois usa o carrinho do usuário logado
});

// Schema para listar pedidos do usuário atual
export const getUserOrdersSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
});

// Schema para obter detalhes de um pedido
export const getOrderByIdSchema = z.object({
  id: z.string().uuid(),
});

// Schema para listar todos os pedidos (admin)
export const getAllOrdersSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  userId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
});

// Schema para remover um pedido (admin)
export const deleteOrderSchema = z.object({
  id: z.string().uuid(),
});

// Types
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type GetUserOrdersInput = z.infer<typeof getUserOrdersSchema>;
export type GetOrderByIdInput = z.infer<typeof getOrderByIdSchema>;
export type GetAllOrdersInput = z.infer<typeof getAllOrdersSchema>;
export type DeleteOrderInput = z.infer<typeof deleteOrderSchema>; 