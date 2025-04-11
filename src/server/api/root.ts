import { createTRPCRouter, publicProcedure } from "./trpc";
import { testRouter } from "./routers/test";
import { authRouter } from "./routers/auth/auth.router";
import { productRouter } from "./routers/product/product.router";

export const appRouter = createTRPCRouter({
  hello: publicProcedure.query(() => {
    return "Hello, world!";
  }),
  test: testRouter,
  auth: authRouter,
  product: productRouter,
});

export type AppRouter = typeof appRouter;
