import { relations } from "drizzle-orm"
import {
  numeric,
  pgEnum,
  pgTable,
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
import { UsersTable } from "../user/user.table"
import { SalesTable } from "../sale/sale.table"
import { OrderItemsTable } from "./order-item.table"

/**
 * Order Status Enum
 * Used to track the status of an order
 */
export const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled"
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const OrderStatusEnum = pgEnum("order_status", ORDER_STATUSES)

/**
 * Orders Table
 * Description: This table stores customer orders
 */
export const OrdersTable = pgTable("orders", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  userId: uuid("user_id").references(() => UsersTable.id),
  status: OrderStatusEnum("status").default("pending"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  orderDate: timestamp("order_date", { withTimezone: true })
    .defaultNow()
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
})

// Relationships
export const OrdersRelations = relations(OrdersTable, ({ one, many }) => ({
  _user: one(UsersTable, {
    fields: [OrdersTable.userId],
    references: [UsersTable.id]
  }),
  _items: many(OrderItemsTable),
  _sale: one(SalesTable, {
    fields: [OrdersTable.id],
    references: [SalesTable.orderId]
  })
}))

// Schemas
export const ordersInsertSchema = createInsertSchema(OrdersTable)
export const ordersSelectSchema = createSelectSchema(OrdersTable)
export const ordersUpdateSchema = createUpdateSchema(OrdersTable)

export const orderSchema = {
  insert: ordersInsertSchema,
  select: ordersSelectSchema,
  update: ordersUpdateSchema
}

// Types
export type Order = typeof OrdersTable.$inferSelect
export type NewOrder = typeof OrdersTable.$inferInsert
export type OrderInsert = z.infer<typeof ordersInsertSchema>
export type OrderSelect = z.infer<typeof ordersSelectSchema>
export type OrderUpdate = z.infer<typeof ordersUpdateSchema> 