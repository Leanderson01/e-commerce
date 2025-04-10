import { relations } from "drizzle-orm"
import {
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core"
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from "drizzle-zod"
import { v7 as uuidv7 } from "uuid"
import type { z } from "zod"
import { UsersTable } from "./user.table"

/**
 * Profiles Table
 * Description: This table stores user personal information and preferences
 */
export const ProfilesTable = pgTable("profiles", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  userId: uuid("user_id").notNull().references(() => UsersTable.id, { onDelete: "cascade" }),
  firstName: text("first_name"),
  lastName: text("last_name"),
  fullName: text("full_name"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
})

// Relationships
export const ProfilesRelations = relations(ProfilesTable, ({ one }) => ({
  _user: one(UsersTable, {
    fields: [ProfilesTable.userId],
    references: [UsersTable.id]
  })
}))

// Schemas
export const profilesInsertSchema = createInsertSchema(ProfilesTable)
export const profilesSelectSchema = createSelectSchema(ProfilesTable)
export const profilesUpdateSchema = createUpdateSchema(ProfilesTable)

export const profileSchema = {
  insert: profilesInsertSchema,
  select: profilesSelectSchema,
  update: profilesUpdateSchema
}

// Types
export type Profile = typeof ProfilesTable.$inferSelect
export type NewProfile = typeof ProfilesTable.$inferInsert
export type ProfileInsert = z.infer<typeof profilesInsertSchema>
export type ProfileSelect = z.infer<typeof profilesSelectSchema>
export type ProfileUpdate = z.infer<typeof profilesUpdateSchema> 