import {
  getUserLogged,
  getUserProfile
} from "~/server/api/funcs/auth/auth.funcs"


import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"

export const authUserRouter = createTRPCRouter({
  getUserLogged: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await getUserLogged(ctx.db, ctx.supabase)
      return result
    }),

  getUserProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await getUserProfile(ctx.user.id, ctx.db)
      return result
    })
}) 