import {
  login,
  signup,
  logout
} from "~/server/api/funcs/auth/auth.funcs"
import {
  loginSchema,
  signupSchema
} from "~/server/api/funcs/auth/auth.types"
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc"

export const authFormRouter = createTRPCRouter({
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await login(input, ctx.db, ctx.supabase)
      return result
    }),

  signup: publicProcedure
    .input(signupSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await signup(input, ctx.db, ctx.supabase)
      return result
    }),

  logout: protectedProcedure
    .mutation(async ({ ctx }) => {
      const result = await logout(ctx.supabase)
      return result
    })
}) 