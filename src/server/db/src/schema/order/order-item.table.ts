import { relations } from "drizzle-orm";
import {
  integer,
  numeric,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { v7 as uuidv7 } from "uuid";
import type { z } from "zod";
import { ProductsTable } from "../product/product.table";
import { OrdersTable } from "./order.table";

/**
 * Order Items Table
 * Description: This table stores items in orders
 */
export const OrderItemsTable = pgTable("order_items", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  orderId: uuid("order_id").references(() => OrdersTable.id, {
    onDelete: "cascade",
  }),
  productId: uuid("product_id").references(() => ProductsTable.id),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Relationships
export const OrderItemsRelations = relations(OrderItemsTable, ({ one }) => ({
  _order: one(OrdersTable, {
    fields: [OrderItemsTable.orderId],
    references: [OrdersTable.id],
  }),
  _product: one(ProductsTable, {
    fields: [OrderItemsTable.productId],
    references: [ProductsTable.id],
  }),
}));

// Schemas
export const orderItemsInsertSchema = createInsertSchema(OrderItemsTable);
export const orderItemsSelectSchema = createSelectSchema(OrderItemsTable);
export const orderItemsUpdateSchema = createUpdateSchema(OrderItemsTable);

export const orderItemSchema = {
  insert: orderItemsInsertSchema,
  select: orderItemsSelectSchema,
  update: orderItemsUpdateSchema,
};

// Types
export type OrderItem = typeof OrderItemsTable.$inferSelect;
export type NewOrderItem = typeof OrderItemsTable.$inferInsert;
export type OrderItemInsert = z.infer<typeof orderItemsInsertSchema>;
export type OrderItemSelect = z.infer<typeof orderItemsSelectSchema>;
export type OrderItemUpdate = z.infer<typeof orderItemsUpdateSchema>;
