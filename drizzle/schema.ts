import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const CATEGORIES = ["ring", "necklace", "bracelet", "earrings"] as const;
export type Category = (typeof CATEGORIES)[number];

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Jewelry catalogue. Prices are whole Saudi riyals. */
export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 160 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    collection: varchar("collection", { length: 120 }),
    category: mysqlEnum("category", CATEGORIES).notNull(),
    price: int("price").notNull(),
    compareAtPrice: int("compareAtPrice"),
    shortDescription: varchar("shortDescription", { length: 300 }).notNull(),
    description: text("description").notNull(),
    metal: varchar("metal", { length: 120 }).notNull(),
    karat: varchar("karat", { length: 60 }).notNull(),
    stones: varchar("stones", { length: 200 }).notNull(),
    weight: varchar("weight", { length: 60 }),
    colors: json("colors").$type<string[]>().notNull(),
    images: json("images").$type<string[]>().notNull(),
    featured: boolean("featured").default(false).notNull(),
    stock: int("stock").default(10).notNull(),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  t => [uniqueIndex("products_slug_unique").on(t.slug)],
);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export const cartItems = mysqlTable(
  "cart_items",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    productId: int("productId").notNull(),
    color: varchar("color", { length: 40 }).notNull().default(""),
    quantity: int("quantity").notNull().default(1),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  t => [uniqueIndex("cart_user_product_color").on(t.userId, t.productId, t.color)],
);

export const favorites = mysqlTable(
  "favorites",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    productId: int("productId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  t => [uniqueIndex("fav_user_product").on(t.userId, t.productId)],
);

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 32 }).notNull().unique(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ORDER_STATUSES).default("pending").notNull(),
  fullName: varchar("fullName", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  address: text("address").notNull(),
  notes: text("notes"),
  paymentMethod: varchar("paymentMethod", { length: 40 }).default("cod").notNull(),
  subtotal: int("subtotal").notNull(),
  shipping: int("shipping").notNull(),
  total: int("total").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;

export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  image: varchar("image", { length: 500 }),
  price: int("price").notNull(),
  color: varchar("color", { length: 40 }).notNull().default(""),
  quantity: int("quantity").notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;

export const contactMessages = mysqlTable("contact_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  subject: varchar("subject", { length: 200 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
