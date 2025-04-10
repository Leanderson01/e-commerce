import { z } from "zod"

// Tipos básicos para locations
export const locationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  project_id: z.string().min(1, "Project is required"),
  description: z.string().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
})

// Schema para criação de locations
export const createLocationSchema = locationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
})

// Schema para atualização de locations
export const updateLocationSchema = locationSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true
  })
  .partial()
  .refine(
    (data) => {
      return Object.keys(data).length > 0
    },
    {
      message: "At least one field must be provided for update"
    }
  )

// Schema para busca de locations
export const getLocationByIdSchema = z.object({
  id: z.string().uuid()
})

// Schema para busca de locations por projeto
export const getLocationsByProjectSchema = z.object({
  project_id: z.string().uuid()
})

// Tipos inferidos dos schemas
export type Location = z.infer<typeof locationSchema>
export type CreateLocationInput = z.infer<typeof createLocationSchema>
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>
export type GetLocationByIdInput = z.infer<typeof getLocationByIdSchema>
export type GetLocationsByProjectInput = z.infer<
  typeof getLocationsByProjectSchema
>
