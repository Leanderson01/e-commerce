// import { relations } from "drizzle-orm" 
import {
  boolean,
  jsonb,
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

/**
 * Notification Types Enum
 * Used to categorize notifications by their source or purpose
 */
export const NOTIFICATION_TEMPLATES = [
  "toa-created",
  "toa-approved",
  "toa-denied",
  "toa-request-changes",
  "toa-completed",
  "inventory-low-stock",
  "inventory-restock",
  "system-alert"
] as const

export type NotificationTemplate = (typeof NOTIFICATION_TEMPLATES)[number]

export const NotificationTemplateEnum = pgEnum(
  "notification_template",
  NOTIFICATION_TEMPLATES
)

/**
 * Notifications Table
 * Description: This table stores notification messages and metadata
 */
export const NotificationsTable = pgTable("notifications", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  template: NotificationTemplateEnum("template").notNull(), //template
  title: text("title"),
  message: text("message"),
  reference_id: text("reference_id"),
  reference_type: text("reference_type"), //enum(TOA)
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  is_system: boolean("is_system").default(true),
  is_email: boolean("is_email").default(false),
  is_sms: boolean("is_sms").default(false),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  expires_at: timestamp("expires_at", { withTimezone: true }),
  ...timestamp
})

// Relationships - Will be expanded when we add the recipients table
// export const NotificationsRelations = relations(
//   NotificationsTable,
//   // ({ many }) => ({
//     // _recipients: many(NotificationRecipientsTable) example
//   // })
// )

// Schemas
export const notificationsInsertSchema = createInsertSchema(NotificationsTable)
export const notificationsSelectSchema = createSelectSchema(NotificationsTable)
export const notificationsUpdateSchema = createUpdateSchema(NotificationsTable)

export const notificationsSchema = {
  insert: notificationsInsertSchema,
  select: notificationsSelectSchema,
  update: notificationsUpdateSchema
}

// Types
export type Notification = typeof NotificationsTable.$inferSelect
export type NewNotification = typeof NotificationsTable.$inferInsert
export type NotificationInsert = z.infer<typeof notificationsInsertSchema>
export type NotificationSelect = z.infer<typeof notificationsSelectSchema>
export type NotificationUpdate = z.infer<typeof notificationsUpdateSchema>
