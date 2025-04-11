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
import { CartsTable } from "./cart.table";

/**
 * Cart Items Table
 * Description: This table stores items in shopping carts
 */
export const CartItemsTable = pgTable("cart_items", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  cartId: uuid("cart_id").references(() => CartsTable.id, {
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
export const CartItemsRelations = relations(CartItemsTable, ({ one }) => ({
  _cart: one(CartsTable, {
    fields: [CartItemsTable.cartId],
    references: [CartsTable.id],
  }),
  _product: one(ProductsTable, {
    fields: [CartItemsTable.productId],
    references: [ProductsTable.id],
  }),
}));

// Schemas
export const cartItemsInsertSchema = createInsertSchema(CartItemsTable);
export const cartItemsSelectSchema = createSelectSchema(CartItemsTable);
export const cartItemsUpdateSchema = createUpdateSchema(CartItemsTable);

export const cartItemSchema = {
  insert: cartItemsInsertSchema,
  select: cartItemsSelectSchema,
  update: cartItemsUpdateSchema,
};

// Types
export type CartItem = typeof CartItemsTable.$inferSelect;
export type NewCartItem = typeof CartItemsTable.$inferInsert;
export type CartItemInsert = z.infer<typeof cartItemsInsertSchema>;
export type CartItemSelect = z.infer<typeof cartItemsSelectSchema>;
export type CartItemUpdate = z.infer<typeof cartItemsUpdateSchema>;
