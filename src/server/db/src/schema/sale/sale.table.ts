import { relations } from "drizzle-orm"
import {
  numeric,
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
import { UsersTable } from "../user/user.table"
import { OrdersTable } from "../order/order.table"

/**
 * Payment Methods Enum
 * Used to track different payment methods
 */
export const PAYMENT_METHODS = [
  "credit_card",
  "debit_card",
  "bank_transfer",
  "pix",
  "cash"
] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PaymentMethodEnum = pgEnum("payment_method", PAYMENT_METHODS)

/**
 * Sale Status Enum
 * Used to track the status of a sale
 */
export const SALE_STATUSES = [
  "pending",
  "paid",
  "refunded",
  "failed"
] as const

export type SaleStatus = (typeof SALE_STATUSES)[number]

export const SaleStatusEnum = pgEnum("sale_status", SALE_STATUSES)

/**
 * Sales Table
 * Description: This table stores financial records of completed sales
 */
export const SalesTable = pgTable("sales", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  orderId: uuid("order_id").references(() => OrdersTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => UsersTable.id),
  paymentMethod: PaymentMethodEnum("payment_method").default("credit_card"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: SaleStatusEnum("status").default("pending"),
  saleDate: timestamp("sale_date", { withTimezone: true })
    .defaultNow()
    .notNull(),
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
})

// Relationships
export const SalesRelations = relations(SalesTable, ({ one }) => ({
  _order: one(OrdersTable, {
    fields: [SalesTable.orderId],
    references: [OrdersTable.id]
  }),
  _user: one(UsersTable, {
    fields: [SalesTable.userId],
    references: [UsersTable.id]
  })
}))

// Schemas
export const salesInsertSchema = createInsertSchema(SalesTable)
export const salesSelectSchema = createSelectSchema(SalesTable)
export const salesUpdateSchema = createUpdateSchema(SalesTable)

export const saleSchema = {
  insert: salesInsertSchema,
  select: salesSelectSchema,
  update: salesUpdateSchema
}

// Types
export type Sale = typeof SalesTable.$inferSelect
export type NewSale = typeof SalesTable.$inferInsert
export type SaleInsert = z.infer<typeof salesInsertSchema>
export type SaleSelect = z.infer<typeof salesSelectSchema>
export type SaleUpdate = z.infer<typeof salesUpdateSchema> 