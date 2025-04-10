import { z } from "zod"
import {
  createLocation,
  updateLocation
} from "../../../funcs/locations/locations.funcs"
import {
  createLocationSchema,
  updateLocationSchema
} from "../../../funcs/locations/locations.types"
import { createTRPCRouter, protectedProcedure } from "../../../trpc"

export const locationsFormRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createLocationSchema)
    .mutation(async ({ input, ctx }) => {
      const location = await createLocation(input, ctx.db)
      return location
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: updateLocationSchema
      })
    )
    .mutation(async ({ input, ctx }) => {
      const location = await updateLocation(input.id, input.data, ctx.db)
      return location
    })
})
