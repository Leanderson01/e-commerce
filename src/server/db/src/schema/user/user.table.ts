import { relations } from "drizzle-orm"
import {
  boolean,
  pgEnum,
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
import { ProfilesTable } from "./profile.table"

/**
 * User Roles Enum
 * Used to differentiate between admin and client users
 */
export const USER_ROLES = ["admin", "client"] as const

export type UserRole = (typeof USER_ROLES)[number]

export const UserRoleEnum = pgEnum("user_role", USER_ROLES)

/**
 * Users Table
 * Description: This table stores user authentication data and basic info
 */
export const UsersTable = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: UserRoleEnum("role").notNull().default("client"),
  isActive: boolean("is_active").default(true),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
})

export const UsersRelations = relations(
  UsersTable,
  ({ one }) => ({
    _profile: one(ProfilesTable, {
      fields: [UsersTable.id],
      references: [ProfilesTable.userId]
    })
  })
)

// Schemas
export const usersInsertSchema = createInsertSchema(UsersTable)
export const usersSelectSchema = createSelectSchema(UsersTable)
export const usersUpdateSchema = createUpdateSchema(UsersTable)

export const userSchema = {
  insert: usersInsertSchema,
  select: usersSelectSchema,
  update: usersUpdateSchema
}

// Types
export type User = typeof UsersTable.$inferSelect
export type NewUser = typeof UsersTable.$inferInsert
export type UserInsert = z.infer<typeof usersInsertSchema>
export type UserSelect = z.infer<typeof usersSelectSchema>
export type UserUpdate = z.infer<typeof usersUpdateSchema> 