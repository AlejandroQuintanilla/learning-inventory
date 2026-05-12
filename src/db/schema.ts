import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ------------------------------------------------------------
// TABLA: categories
// ------------------------------------------------------------
export const categories = pgTable('categories', {
  id:          uuid('id').primaryKey().defaultRandom(),
  name:        varchar('name', { length: 100 }).unique().notNull(),
  description: text('description'),
  createdAt:   timestamp('created_at').defaultNow(),
});

// ------------------------------------------------------------
// TABLA: products
// ------------------------------------------------------------
export const products = pgTable('products', {
  id:         uuid('id').primaryKey().defaultRandom(),
  name:       varchar('name', { length: 150 }).notNull(),
  price:      numeric('price', { precision: 10, scale: 2 }).notNull(),
  stock:      integer('stock').notNull().default(0),
  categoryId: uuid('category_id').notNull().references(() => categories.id),
  createdAt:  timestamp('created_at').defaultNow(),
});

// ------------------------------------------------------------
// RELACIONES (para consultas con Drizzle .with())
// ------------------------------------------------------------
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields:     [products.categoryId],
    references: [categories.id],
  }),
}));

// Tipos inferidos de TypeScript
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
