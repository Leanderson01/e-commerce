import { relations } from "drizzle-orm";
import {
  integer,
  numeric,
  pgTable,
  text,
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
import { CategoriesTable } from "../category/category.table";
import { OrderItemsTable } from "../order/order-item.table";
import { CartItemsTable } from "../cart/cart-item.table";

/**
 * Products Table
 * Description: This table stores product information including inventory data
 */
export const ProductsTable = pgTable("products", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  categoryId: uuid("category_id").references(() => CategoriesTable.id),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  stockQuantity: integer("stock_quantity").default(0),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Relationships
export const ProductsRelations = relations(ProductsTable, ({ one, many }) => ({
  _category: one(CategoriesTable, {
    fields: [ProductsTable.categoryId],
    references: [CategoriesTable.id],
  }),
  _orderItems: many(OrderItemsTable),
  _cartItems: many(CartItemsTable),
}));

// Schemas
export const productsInsertSchema = createInsertSchema(ProductsTable);
export const productsSelectSchema = createSelectSchema(ProductsTable);
export const productsUpdateSchema = createUpdateSchema(ProductsTable);

export const productSchema = {
  insert: productsInsertSchema,
  select: productsSelectSchema,
  update: productsUpdateSchema,
};

// Types
export type Product = typeof ProductsTable.$inferSelect;
export type NewProduct = typeof ProductsTable.$inferInsert;
export type ProductInsert = z.infer<typeof productsInsertSchema>;
export type ProductSelect = z.infer<typeof productsSelectSchema>;
export type ProductUpdate = z.infer<typeof productsUpdateSchema>;
