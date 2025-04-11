import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { v7 as uuidv7 } from "uuid";
import type { z } from "zod";
import { ProductsTable } from "../product/product.table";

/**
 * Categories Table
 * Description: This table stores product categories
 */
export const CategoriesTable = pgTable("categories", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Relationships
export const CategoriesRelations = relations(CategoriesTable, ({ many }) => ({
  _products: many(ProductsTable),
}));

// Schemas
export const categoriesInsertSchema = createInsertSchema(CategoriesTable);
export const categoriesSelectSchema = createSelectSchema(CategoriesTable);
export const categoriesUpdateSchema = createUpdateSchema(CategoriesTable);

export const categorySchema = {
  insert: categoriesInsertSchema,
  select: categoriesSelectSchema,
  update: categoriesUpdateSchema,
};

// Types
export type Category = typeof CategoriesTable.$inferSelect;
export type NewCategory = typeof CategoriesTable.$inferInsert;
export type CategoryInsert = z.infer<typeof categoriesInsertSchema>;
export type CategorySelect = z.infer<typeof categoriesSelectSchema>;
export type CategoryUpdate = z.infer<typeof categoriesUpdateSchema>;
