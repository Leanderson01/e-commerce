import {
  getUserLogged,
  getUserProfile,
} from "~/server/api/funcs/auth/auth.funcs";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const authUserRouter = createTRPCRouter({
  // Optional user query - returns null if not logged in (for header/public use)
  getCurrentUser: publicProcedure.query(async ({ ctx }) => {
    try {
      // If no user in context, return null
      if (!ctx.user) {
        return null;
      }

      // Return normalized format for compatibility
      return {
        id: ctx.user.id,
        email: ctx.user.email,
        role: ctx.user.role,
        profile: ctx.user._profile,
      };
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }),

  // Protected user query - throws error if not logged in (for protected routes)
  getUserLogged: protectedProcedure.query(async ({ ctx }) => {
    const result = await getUserLogged(ctx.db, ctx.supabase);
    return result;
  }),

  getUserProfile: protectedProcedure.query(async ({ ctx }) => {
    const result = await getUserProfile(ctx.user.id, ctx.db);
    return result;
  }),
});
