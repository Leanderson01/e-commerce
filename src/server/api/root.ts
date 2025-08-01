import { createTRPCRouter, publicProcedure } from "./trpc";
import { testRouter } from "./routers/test";
import { authRouter } from "./routers/auth/auth.router";
import { productRouter } from "./routers/product/product.router";
import { categoryRouter } from "./routers/category/category.router";
import { cartRouter } from "./routers/cart/cart.router";
import { orderRouter } from "./routers/order/order.router";
import { reportRouter } from "./routers/report/report.router";

export const appRouter = createTRPCRouter({
  hello: publicProcedure.query(() => {
    return "Hello, world!";
  }),
  test: testRouter,
  auth: authRouter,
  product: productRouter,
  category: categoryRouter,
  cart: cartRouter,
  order: orderRouter,
  report: reportRouter,
});

export type AppRouter = typeof appRouter;
