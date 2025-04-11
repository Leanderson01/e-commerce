import { getCart } from "~/server/api/funcs/cart/cart.funcs";
import { getCartSchema } from "~/server/api/funcs/cart/cart.types";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const cartListRouter = createTRPCRouter({
  // Obter o carrinho atual do usuário
  getCart: protectedProcedure
    .input(getCartSchema)
    .query(async ({ input, ctx }) => {
      const result = await getCart(input, ctx.user.id, ctx.db);
      return result;
    }),
}); 