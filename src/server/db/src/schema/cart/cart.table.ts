import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { v7 as uuidv7 } from "uuid";
import type { z } from "zod";
import { UsersTable } from "../user/user.table";
import { CartItemsTable } from "./cart-item.table";

/**
 * Carts Table
 * Description: This table stores shopping carts for users
 */
export const CartsTable = pgTable("carts", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  userId: uuid("user_id").references(() => UsersTable.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Relationships
export const CartsRelations = relations(CartsTable, ({ one, many }) => ({
  _user: one(UsersTable, {
    fields: [CartsTable.userId],
    references: [UsersTable.id],
  }),
  _items: many(CartItemsTable),
}));

// Schemas
export const cartsInsertSchema = createInsertSchema(CartsTable);
export const cartsSelectSchema = createSelectSchema(CartsTable);
export const cartsUpdateSchema = createUpdateSchema(CartsTable);

export const cartSchema = {
  insert: cartsInsertSchema,
  select: cartsSelectSchema,
  update: cartsUpdateSchema,
};

// Types
export type Cart = typeof CartsTable.$inferSelect;
export type NewCart = typeof CartsTable.$inferInsert;
export type CartInsert = z.infer<typeof cartsInsertSchema>;
export type CartSelect = z.infer<typeof cartsSelectSchema>;
export type CartUpdate = z.infer<typeof cartsUpdateSchema>;
