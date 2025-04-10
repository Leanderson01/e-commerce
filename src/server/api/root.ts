import { createTRPCRouter, publicProcedure } from "./trpc"
import { testRouter } from "./routers/test"

export const appRouter = createTRPCRouter({
  hello: publicProcedure.query(() => {
    return "Hello, world!"
  }),
  test: testRouter,
})

export type AppRouter = typeof appRouter
