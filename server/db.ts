import { and, asc, count, desc, eq, inArray, like, or, sql, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  cartItems,
  contactMessages,
  favorites,
  InsertProduct,
  InsertUser,
  orderItems,
  orders,
  products,
  users,
  type Category,
  type OrderStatus,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

async function db() {
  const instance = await getDb();
  if (!instance) throw new Error("Database is not available");
  return instance;
}

/* ------------------------------------------------------------------ users */

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const d = await db();
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    values[field] = value ?? null;
    updateSet[field] = value ?? null;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await d.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const d = await getDb();
  if (!d) return undefined;
  const result = await d.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

/* --------------------------------------------------------------- products */

export type ProductListInput = {
  category?: Category;
  search?: string;
  sort?: "featured" | "price_asc" | "price_desc" | "newest";
  featuredOnly?: boolean;
  limit?: number;
};

export async function listProducts(input: ProductListInput = {}, includeInactive = false) {
  const d = await db();
  const conditions = [];
  if (!includeInactive) conditions.push(eq(products.active, true));
  if (input.category) conditions.push(eq(products.category, input.category));
  if (input.featuredOnly) conditions.push(eq(products.featured, true));
  if (input.search?.trim()) {
    const term = `%${input.search.trim()}%`;
    conditions.push(
      or(
        like(products.name, term),
        like(products.shortDescription, term),
        like(products.collection, term),
        like(products.stones, term),
        like(products.metal, term),
      ),
    );
  }

  const orderBy =
    input.sort === "price_asc"
      ? [asc(products.price)]
      : input.sort === "price_desc"
        ? [desc(products.price)]
        : input.sort === "newest"
          ? [desc(products.createdAt), desc(products.id)]
          : [desc(products.featured), asc(products.id)];

  const query = d
    .select()
    .from(products)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(...orderBy);
  return input.limit ? query.limit(input.limit) : query;
}

export async function getProductBySlug(slug: string) {
  const d = await db();
  const rows = await d.select().from(products).where(eq(products.slug, slug)).limit(1);
  return rows[0];
}

export async function getProductById(id: number) {
  const d = await db();
  const rows = await d.select().from(products).where(eq(products.id, id)).limit(1);
  return rows[0];
}

export async function getRelatedProducts(category: Category, excludeId: number) {
  const d = await db();
  const rows = await d
    .select()
    .from(products)
    .where(and(eq(products.active, true), sql`${products.id} <> ${excludeId}`))
    .orderBy(sql`CASE WHEN ${products.category} = ${category} THEN 0 ELSE 1 END`, asc(products.id))
    .limit(4);
  return rows;
}

export async function createProduct(data: InsertProduct) {
  const d = await db();
  const result = await d.insert(products).values(data).$returningId();
  return result[0].id;
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const d = await db();
  await d.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const d = await db();
  await d.delete(cartItems).where(eq(cartItems.productId, id));
  await d.delete(favorites).where(eq(favorites.productId, id));
  await d.delete(products).where(eq(products.id, id));
}

/* ------------------------------------------------------------------- cart */

export async function getCart(userId: number) {
  const d = await db();
  const rows = await d
    .select({ item: cartItems, product: products })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId))
    .orderBy(asc(cartItems.id));
  return rows.map(r => ({
    id: r.item.id,
    quantity: r.item.quantity,
    color: r.item.color,
    product: r.product,
  }));
}

export async function addToCart(userId: number, productId: number, color: string, quantity: number) {
  const d = await db();
  await d
    .insert(cartItems)
    .values({ userId, productId, color, quantity })
    .onDuplicateKeyUpdate({ set: { quantity: sql`LEAST(${cartItems.quantity} + ${quantity}, 10)` } });
}

export async function setCartQuantity(userId: number, itemId: number, quantity: number) {
  const d = await db();
  await d
    .update(cartItems)
    .set({ quantity })
    .where(and(eq(cartItems.id, itemId), eq(cartItems.userId, userId)));
}

export async function removeCartItem(userId: number, itemId: number) {
  const d = await db();
  await d.delete(cartItems).where(and(eq(cartItems.id, itemId), eq(cartItems.userId, userId)));
}

export async function clearCart(userId: number) {
  const d = await db();
  await d.delete(cartItems).where(eq(cartItems.userId, userId));
}

export async function getCartCount(userId: number) {
  const d = await db();
  const rows = await d
    .select({ total: sum(cartItems.quantity) })
    .from(cartItems)
    .where(eq(cartItems.userId, userId));
  return Number(rows[0]?.total ?? 0);
}

/* -------------------------------------------------------------- favorites */

export async function getFavorites(userId: number) {
  const d = await db();
  const rows = await d
    .select({ fav: favorites, product: products })
    .from(favorites)
    .innerJoin(products, eq(favorites.productId, products.id))
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt));
  return rows.map(r => r.product);
}

export async function getFavoriteIds(userId: number) {
  const d = await db();
  const rows = await d
    .select({ productId: favorites.productId })
    .from(favorites)
    .where(eq(favorites.userId, userId));
  return rows.map(r => r.productId);
}

export async function toggleFavorite(userId: number, productId: number) {
  const d = await db();
  const existing = await d
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)))
    .limit(1);
  if (existing.length) {
    await d.delete(favorites).where(eq(favorites.id, existing[0].id));
    return false;
  }
  await d.insert(favorites).values({ userId, productId });
  return true;
}

export async function removeFavorite(userId: number, productId: number) {
  const d = await db();
  await d
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)));
}

/* ----------------------------------------------------------------- orders */

export const SHIPPING_FEE = 0;

export type CheckoutInput = {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
};

export async function createOrderFromCart(userId: number, input: CheckoutInput) {
  const d = await db();
  const cart = await getCart(userId);
  const available = cart.filter(i => i.product.active);
  if (available.length === 0) return null;

  const subtotal = available.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shipping = SHIPPING_FEE;
  const total = subtotal + shipping;
  const orderNumber = `DR-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;

  const inserted = await d
    .insert(orders)
    .values({
      orderNumber,
      userId,
      fullName: input.fullName,
      phone: input.phone,
      city: input.city,
      address: input.address,
      notes: input.notes || null,
      paymentMethod: "cod",
      subtotal,
      shipping,
      total,
    })
    .$returningId();
  const orderId = inserted[0].id;

  await d.insert(orderItems).values(
    available.map(i => ({
      orderId,
      productId: i.product.id,
      name: i.product.name,
      image: i.product.images[0] ?? null,
      price: i.product.price,
      color: i.color,
      quantity: i.quantity,
    })),
  );

  for (const i of available) {
    await d
      .update(products)
      .set({ stock: sql`GREATEST(${products.stock} - ${i.quantity}, 0)` })
      .where(eq(products.id, i.product.id));
  }
  await clearCart(userId);

  return { orderId, orderNumber, total, items: available.length };
}

async function attachItems<T extends { id: number }>(rows: T[]) {
  if (rows.length === 0) return [] as (T & { items: (typeof orderItems.$inferSelect)[] })[];
  const d = await db();
  const items = await d
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, rows.map(r => r.id)));
  return rows.map(r => ({ ...r, items: items.filter(i => i.orderId === r.id) }));
}

export async function getUserOrders(userId: number) {
  const d = await db();
  const rows = await d
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
  return attachItems(rows);
}

export async function getUserOrderByNumber(userId: number, orderNumber: string) {
  const d = await db();
  const rows = await d
    .select()
    .from(orders)
    .where(and(eq(orders.userId, userId), eq(orders.orderNumber, orderNumber)))
    .limit(1);
  const withItems = await attachItems(rows);
  return withItems[0];
}

export async function getAllOrders(status?: OrderStatus) {
  const d = await db();
  const rows = await d
    .select({ order: orders, customerEmail: users.email })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .where(status ? eq(orders.status, status) : undefined)
    .orderBy(desc(orders.createdAt));
  return attachItems(rows.map(r => ({ ...r.order, customerEmail: r.customerEmail })));
}

export async function updateOrderStatus(id: number, status: OrderStatus) {
  const d = await db();
  await d.update(orders).set({ status }).where(eq(orders.id, id));
}

/* --------------------------------------------------------------- contact */

export async function createContactMessage(data: {
  userId?: number | null;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const d = await db();
  await d.insert(contactMessages).values({
    userId: data.userId ?? null,
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    subject: data.subject,
    message: data.message,
  });
}

export async function getContactMessages() {
  const d = await db();
  return d.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
}

export async function setMessageRead(id: number, isRead: boolean) {
  const d = await db();
  await d.update(contactMessages).set({ isRead }).where(eq(contactMessages.id, id));
}

export async function deleteMessage(id: number) {
  const d = await db();
  await d.delete(contactMessages).where(eq(contactMessages.id, id));
}

/* ----------------------------------------------------------------- stats */

export async function getAdminStats() {
  const d = await db();
  const [productCount] = await d.select({ c: count() }).from(products);
  const [orderAgg] = await d
    .select({ c: count(), revenue: sum(orders.total) })
    .from(orders)
    .where(sql`${orders.status} <> 'cancelled'`);
  const [pending] = await d
    .select({ c: count() })
    .from(orders)
    .where(eq(orders.status, "pending"));
  const [unread] = await d
    .select({ c: count() })
    .from(contactMessages)
    .where(eq(contactMessages.isRead, false));
  const [customers] = await d.select({ c: count() }).from(users);
  const byCategory = await d
    .select({ category: products.category, c: count() })
    .from(products)
    .groupBy(products.category);
  const recentOrders = await d.select().from(orders).orderBy(desc(orders.createdAt)).limit(5);
  const lowStock = await d
    .select()
    .from(products)
    .where(sql`${products.stock} <= 3`)
    .orderBy(asc(products.stock))
    .limit(5);

  return {
    products: productCount.c,
    orders: orderAgg.c,
    revenue: Number(orderAgg.revenue ?? 0),
    pendingOrders: pending.c,
    unreadMessages: unread.c,
    customers: customers.c,
    byCategory,
    recentOrders,
    lowStock,
  };
}
