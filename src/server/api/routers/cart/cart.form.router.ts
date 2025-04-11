import {
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "~/server/api/funcs/cart/cart.funcs";

import {
  addToCartSchema,
  updateCartItemSchema,
  removeFromCartSchema,
  clearCartSchema,
} from "~/server/api/funcs/cart/cart.types";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const cartFormRouter = createTRPCRouter({
  // Adicionar produto ao carrinho
  addToCart: protectedProcedure
    .input(addToCartSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await addToCart(input, ctx.user.id, ctx.db);
      return result;
    }),

  // Atualizar quantidade de um item no carrinho
  updateCartItem: protectedProcedure
    .input(updateCartItemSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await updateCartItem(input, ctx.user.id, ctx.db);
      return result;
    }),

  // Remover item do carrinho
  removeFromCart: protectedProcedure
    .input(removeFromCartSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await removeFromCart(input, ctx.user.id, ctx.db);
      return result;
    }),

  // Limpar o carrinho
  clearCart: protectedProcedure
    .input(clearCartSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await clearCart(input, ctx.user.id, ctx.db);
      return result;
    }),
}); 