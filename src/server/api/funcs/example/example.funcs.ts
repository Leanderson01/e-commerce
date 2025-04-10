import type { DBClient } from "@repo/db/client"
import { LocationsTable } from "@repo/db/schema"
import { eq } from "drizzle-orm"
import { v7 as uuidv7 } from "uuid"
import type {
  CreateLocationInput,
  UpdateLocationInput
} from "./locations.types"

export const createLocation = async (
  location: CreateLocationInput,
  db: DBClient
) => {
  try {
    // Check if location with same project_id and name already exists
    const existingLocation = await db.query.LocationsTable.findFirst({
      where: (locations, { and, eq }) =>
        and(
          eq(locations.project_id, location.project_id),
          eq(locations.name, location.name)
        )
    })

    if (existingLocation) {
      return {
        data: null,
        error: {
          code: "CONFLICT",
          message: "A location with this name already exists in this project",
          cause: existingLocation
        }
      }
    }

    const [newLocation] = await db
      .insert(LocationsTable)
      .values({
        ...location,
        id: uuidv7()
      })
      .returning()

    return {
      data: newLocation,
      error: null
    }
  } catch (error) {
    console.error("Error creating location:", error)
    return {
      data: null,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create location",
        cause: error
      }
    }
  }
}

export const getLocations = async (db: DBClient) => {
  const locations = await db.query.LocationsTable.findMany()
  return locations
}

export const getLocationById = async (id: string, db: DBClient) => {
  const location = await db.query.LocationsTable.findFirst({
    where: (locations, { eq }) => eq(locations.id, id)
  })
  return location
}

export const updateLocation = async (
  id: string,
  location: UpdateLocationInput,
  db: DBClient
) => {
  try {
    // Check if location exists
    const existingLocation = await db.query.LocationsTable.findFirst({
      where: (locations, { eq }) => eq(locations.id, id)
    })

    if (!existingLocation) {
      return {
        data: null,
        error: {
          code: "NOT_FOUND",
          message: "Location not found"
        }
      }
    }

    // Only check for name conflict if name is being updated
    if (location.name !== undefined) {
      const projectId = location.project_id ?? existingLocation.project_id

      if (!projectId) {
        return {
          data: null,
          error: {
            code: "BAD_REQUEST",
            message: "Project ID is required"
          }
        }
      }

      // Check if new name conflicts with another location in the same project
      const duplicateLocation = await db.query.LocationsTable.findFirst({
        where: (locations, { and, eq, not }) =>
          and(
            eq(locations.project_id, projectId),
            eq(locations.name, location.name ?? ""),
            not(eq(locations.id, id))
          )
      })

      if (duplicateLocation) {
        return {
          data: null,
          error: {
            code: "CONFLICT",
            message: "A location with this name already exists in this project",
            cause: duplicateLocation
          }
        }
      }
    }

    // Prepare update data
    const updateData = {
      ...location,
      updatedAt: new Date()
    }

    // Update the location with only the provided fields
    const [updatedLocation] = await db
      .update(LocationsTable)
      .set(updateData)
      .where(eq(LocationsTable.id, id))
      .returning()

    return {
      data: updatedLocation,
      error: null
    }
  } catch (error) {
    console.error("Error updating location:", error)
    return {
      data: null,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update location",
        cause: error
      }
    }
  }
}
