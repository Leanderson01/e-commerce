/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */
import type { SupabaseClient } from "@supabase/supabase-js"
import { TRPCError, initTRPC } from "@trpc/server"
import superjson from "superjson"
import { ZodError } from "zod"

import { db } from "~/server/db/src/client"

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: {
  headers: Headers
  supabase: SupabaseClient
  supabaseAdmin: SupabaseClient
}) => {
  const {
    data: { user }
  } = await opts.supabase.auth.getUser()

  return {
    db,
    user,
    ...opts
  }
}

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => {
    // For Zod errors, extract the first error message for cleaner client-side display
    if (error.cause instanceof ZodError) {
      const firstError = error.cause.errors[0]
      if (firstError && firstError.message !== "Required") {
        return {
          ...shape,
          message: firstError.message,
          data: {
            ...shape.data,
            zodError: error.cause.flatten()
          }
        }
      } else {
        return {
          ...shape,
          message: "Invalid request",
          data: {
            ...shape.data,
            zodError: error.cause.flatten()
          }
        }
      }
    }

    // For other errors, maintain the original format
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null
      }
    }
  }
})

/**
 * Create a server-side caller
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and sub routers in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router
export const createRouterMerger = t.mergeRouters

/**
 * Public (unauthorized) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure.use(async ({ ctx, next }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { supabase, supabaseAdmin: _sbAdmin, ...rest } = ctx
  return next({
    ctx: {
      supabase,
      ...rest
    }
  })
})

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  })
})

// TODO: apply

// export const adminProtectedProcedure = t.procedure.use(({ ctx, next }) => {
//   if (!ctx.user?.id) {
//     throw new TRPCError({ code: "UNAUTHORIZED" })
//   }

//   if (ctx.user.app_metadata.rbac?.role !== "admin") {
//     throw new TRPCError({ code: "FORBIDDEN" })
//   }

//   return next({
//     ctx: {
//       ...ctx,
//       user: ctx.user
//     }
//   })
// })
