import {
  login,
  signup,
  logout,
  deleteUserAccount,
  updateUserProfile,
  updateUserProfileWithPassword,
  getUserLogged,
} from "~/server/api/funcs/auth/auth.funcs";
import {
  deleteUserAccountSchema,
  loginSchema,
  signupSchema,
  updateUserProfileSchema,
  updateUserProfileWithPasswordSchema,
} from "~/server/api/funcs/auth/auth.types";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const authFormRouter = createTRPCRouter({
  login: publicProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    const result = await login(input, ctx.db, ctx.supabase);
    return result;
  }),

  signup: publicProcedure
    .input(signupSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await signup(input, ctx.db, ctx.supabase);
      return result;
    }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await logout(ctx.supabase);
    return result;
  }),

  updateUserProfile: protectedProcedure
    .input(updateUserProfileSchema)
    .mutation(async ({ input, ctx }) => {
      const loggedUser = await getUserLogged(ctx.db, ctx.supabase);
      
      const result = await updateUserProfile(loggedUser.id, input, ctx.db);
      return result;
    }),

  updateUserProfileWithPassword: protectedProcedure
    .input(updateUserProfileWithPasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const loggedUser = await getUserLogged(ctx.db, ctx.supabase);

      const result = await updateUserProfileWithPassword(
        loggedUser.id,
        input,
        ctx.db,
        ctx.supabase,
      );
      return result;
    }),

  deleteUserAccount: protectedProcedure
    .input(deleteUserAccountSchema)
    .mutation(async ({ input, ctx }) => {
      const loggedUser = await getUserLogged(ctx.db, ctx.supabase);
      
      const result = await deleteUserAccount(
        loggedUser.id,
        input,
        ctx.db,
        ctx.supabase,
        ctx.supabaseAdmin,
      );
      return result;
    }),
});
