import { z } from "zod";

// Schema para obter o carrinho do usuário
export const getCartSchema = z.object({});

// Schema para adicionar produto ao carrinho
export const addToCartSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).default(1),
});

// Schema para atualizar quantidade de um item no carrinho
export const updateCartItemSchema = z.object({
  cartItemId: z.string().uuid(),
  quantity: z.number().int().min(1),
});

// Schema para remover item do carrinho
export const removeFromCartSchema = z.object({
  cartItemId: z.string().uuid(),
});

// Schema para limpar o carrinho
export const clearCartSchema = z.object({});

// Tipos inferidos dos schemas
export type GetCartInput = z.infer<typeof getCartSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>;
export type ClearCartInput = z.infer<typeof clearCartSchema>; 