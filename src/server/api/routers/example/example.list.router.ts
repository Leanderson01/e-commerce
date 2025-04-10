// API para Locais de Depósito
// Endpoint: /api/locations
// Funcionalidades: Listagem, Criação, Atualização, Deleção
// Proteção com Middleware de Autenticação e Permissões

import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../../../trpc"
import { handleError } from "../../../utils/handleError"

export const locationsListRouter = createTRPCRouter({
  // getUserLoggedLocations: protectedProcedure.query(async ({ ctx }) => {
  //   try {
  //     const userLocations = await ctx.db.query.AuthUsersTable.findMany({
  //       where: (users, { eq }) => eq(users.id, ctx.user.id),
  //       with: {
  //         _projects: {
  //           with: {
  //             _locations: true
  //           }
  //         }
  //       }
  //     })
  //     return {
  //       data: userLocations.map((user) =>
  //         user._projects.map((project) => project._locations)
  //       ),
  //       error: null
  //     }
  //   } catch (error) {
  //     return {
  //       data: null,
  //       error: new TRPCError({
  //         code: "PARSE_ERROR",
  //         message: "Error parsing locations",
  //         cause: error
  //       })
  //     }
  //   }
  // })
  getLocations: protectedProcedure.query(async ({ ctx }) => {
    try {
      const locations = await ctx.db.query.LocationsTable.findMany()
      return locations
    } catch (error) {
      handleError("getLocations", error)
    }
  }),
  getLocationById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      try {
        const location = await ctx.db.query.LocationsTable.findFirst({
          where: (locations, { eq }) => eq(locations.id, input)
        })
        return location
      } catch (error) {
        handleError("getLocationById", error)
      }
    }),
  getLocationsByProjectId: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      try {
        const locations = await ctx.db.query.LocationsTable.findMany({
          where: (locations, { eq }) => eq(locations.project_id, input)
        })
        return locations
      } catch (error) {
        handleError("getLocationsByProjectId", error)
      }
    })
})
