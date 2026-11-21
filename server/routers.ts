import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { CATEGORIES, ORDER_STATUSES } from "../drizzle/schema";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { storagePut } from "./storage";

const CATEGORY_LABELS: Record<(typeof CATEGORIES)[number], string> = {
  ring: "خواتم",
  necklace: "عقود",
  bracelet: "أساور",
  earrings: "أقراط",
};

const formatSar = (n: number) => `${n.toLocaleString("en-US")} ر.س`;

/** Owner alerts must never break the customer's action. */
async function safeNotify(title: string, content: string) {
  try {
    await notifyOwner({ title: title.slice(0, 1200), content: content.slice(0, 19000) });
  } catch (error) {
    console.warn("[Notification] Failed to notify owner:", error);
  }
}

const productInput = z.object({
  name: z.string().trim().min(2).max(200),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(160)
    .regex(/^[a-z0-9-]+$/, "المعرّف يقبل أحرفاً إنجليزية صغيرة وأرقاماً وشرطات فقط"),
  collection: z.string().trim().max(120).optional().nullable(),
  category: z.enum(CATEGORIES),
  price: z.number().int().min(1),
  compareAtPrice: z.number().int().min(1).optional().nullable(),
  shortDescription: z.string().trim().min(2).max(300),
  description: z.string().trim().min(2).max(5000),
  metal: z.string().trim().min(1).max(120),
  karat: z.string().trim().min(1).max(60),
  stones: z.string().trim().min(1).max(200),
  weight: z.string().trim().max(60).optional().nullable(),
  colors: z.array(z.string().trim().min(1).max(40)).max(6),
  images: z.array(z.string().min(1).max(500)).min(1).max(8),
  featured: z.boolean(),
  stock: z.number().int().min(0).max(100000),
  active: z.boolean(),
});

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  products: router({
    list: publicProcedure
      .input(
        z
          .object({
            category: z.enum(CATEGORIES).optional(),
            search: z.string().max(100).optional(),
            sort: z.enum(["featured", "price_asc", "price_desc", "newest"]).optional(),
            featuredOnly: z.boolean().optional(),
            limit: z.number().int().min(1).max(100).optional(),
          })
          .optional(),
      )
      .query(({ input }) => db.listProducts(input ?? {})),
    bySlug: publicProcedure.input(z.object({ slug: z.string().max(160) })).query(async ({ input }) => {
      const product = await db.getProductBySlug(input.slug);
      if (!product || !product.active) return null;
      const related = await db.getRelatedProducts(product.category, product.id);
      return { product, related };
    }),
  }),

  cart: router({
    list: protectedProcedure.query(({ ctx }) => db.getCart(ctx.user.id)),
    count: publicProcedure.query(({ ctx }) => (ctx.user ? db.getCartCount(ctx.user.id) : 0)),
    add: protectedProcedure
      .input(
        z.object({
          productId: z.number().int(),
          color: z.string().max(40).default(""),
          quantity: z.number().int().min(1).max(10).default(1),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const product = await db.getProductById(input.productId);
        if (!product || !product.active) {
          throw new TRPCError({ code: "NOT_FOUND", message: "القطعة غير متاحة حالياً" });
        }
        if (product.stock <= 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "نفدت الكمية من هذه القطعة" });
        }
        const color = input.color || product.colors[0] || "";
        await db.addToCart(ctx.user.id, input.productId, color, input.quantity);
        return { success: true } as const;
      }),
    setQuantity: protectedProcedure
      .input(z.object({ itemId: z.number().int(), quantity: z.number().int().min(1).max(10) }))
      .mutation(async ({ ctx, input }) => {
        await db.setCartQuantity(ctx.user.id, input.itemId, input.quantity);
        return { success: true } as const;
      }),
    remove: protectedProcedure
      .input(z.object({ itemId: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        await db.removeCartItem(ctx.user.id, input.itemId);
        return { success: true } as const;
      }),
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await db.clearCart(ctx.user.id);
      return { success: true } as const;
    }),
  }),

  favorites: router({
    list: protectedProcedure.query(({ ctx }) => db.getFavorites(ctx.user.id)),
    ids: publicProcedure.query(({ ctx }) => (ctx.user ? db.getFavoriteIds(ctx.user.id) : [])),
    toggle: protectedProcedure
      .input(z.object({ productId: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        const added = await db.toggleFavorite(ctx.user.id, input.productId);
        return { added };
      }),
    moveToCart: protectedProcedure
      .input(z.object({ productId: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        const product = await db.getProductById(input.productId);
        if (!product || !product.active || product.stock <= 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "القطعة غير متاحة حالياً" });
        }
        await db.addToCart(ctx.user.id, product.id, product.colors[0] ?? "", 1);
        await db.removeFavorite(ctx.user.id, product.id);
        return { success: true } as const;
      }),
  }),

  orders: router({
    checkout: protectedProcedure
      .input(
        z.object({
          fullName: z.string().trim().min(3, "الاسم قصير جداً").max(160),
          phone: z
            .string()
            .trim()
            .regex(/^\+?[0-9\s-]{8,20}$/, "رقم الجوال غير صحيح"),
          city: z.string().trim().min(2).max(100),
          address: z.string().trim().min(8, "يرجى كتابة العنوان بالتفصيل").max(1000),
          notes: z.string().trim().max(1000).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const result = await db.createOrderFromCart(ctx.user.id, input);
        if (!result) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "حقيبة التسوق فارغة" });
        }
        await safeNotify(
          `طلب جديد ${result.orderNumber} — ${formatSar(result.total)}`,
          [
            `العميل: ${input.fullName}`,
            `الجوال: ${input.phone}`,
            `المدينة: ${input.city}`,
            `العنوان: ${input.address}`,
            `عدد القطع: ${result.items}`,
            `الإجمالي: ${formatSar(result.total)} (الدفع عند الاستلام)`,
            input.notes ? `ملاحظات: ${input.notes}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        );
        return result;
      }),
    mine: protectedProcedure.query(({ ctx }) => db.getUserOrders(ctx.user.id)),
    byNumber: protectedProcedure
      .input(z.object({ orderNumber: z.string().max(32) }))
      .query(async ({ ctx, input }) => (await db.getUserOrderByNumber(ctx.user.id, input.orderNumber)) ?? null),
  }),

  contact: router({
    send: publicProcedure
      .input(
        z.object({
          name: z.string().trim().min(2, "الاسم قصير جداً").max(160),
          email: z.string().trim().email("البريد الإلكتروني غير صحيح").max(320),
          phone: z.string().trim().max(40).optional(),
          subject: z.string().trim().min(2).max(200),
          message: z.string().trim().min(10, "الرسالة قصيرة جداً").max(5000),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        await db.createContactMessage({ ...input, userId: ctx.user?.id ?? null });
        await safeNotify(
          `رسالة تواصل جديدة: ${input.subject}`,
          `من: ${input.name} <${input.email}>${input.phone ? `\nالجوال: ${input.phone}` : ""}\n\n${input.message}`,
        );
        return { success: true } as const;
      }),
  }),

  admin: router({
    stats: adminProcedure.query(() => db.getAdminStats()),
    products: adminProcedure.query(() => db.listProducts({ sort: "newest" }, true)),
    createProduct: adminProcedure.input(productInput).mutation(async ({ input }) => {
      const existing = await db.getProductBySlug(input.slug);
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "المعرّف مستخدم لقطعة أخرى" });
      const id = await db.createProduct(input);
      return { id };
    }),
    updateProduct: adminProcedure
      .input(productInput.extend({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const existing = await db.getProductBySlug(data.slug);
        if (existing && existing.id !== id) {
          throw new TRPCError({ code: "CONFLICT", message: "المعرّف مستخدم لقطعة أخرى" });
        }
        await db.updateProduct(id, data);
        return { success: true } as const;
      }),
    deleteProduct: adminProcedure.input(z.object({ id: z.number().int() })).mutation(async ({ input }) => {
      await db.deleteProduct(input.id);
      return { success: true } as const;
    }),
    uploadImage: adminProcedure
      .input(
        z.object({
          fileName: z.string().max(200),
          contentType: z.string().max(60),
          base64: z.string().max(12_000_000),
        }),
      )
      .mutation(async ({ input }) => {
        if (!ALLOWED_IMAGE_TYPES.includes(input.contentType)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "يُسمح بصور JPG أو PNG أو WEBP فقط" });
        }
        const buffer = Buffer.from(input.base64, "base64");
        if (buffer.byteLength > MAX_IMAGE_BYTES) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "حجم الصورة يتجاوز 8 ميغابايت" });
        }
        const ext = input.contentType.split("/")[1] ?? "jpg";
        const safe = input.fileName.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "").slice(0, 40) || "image";
        const { url } = await storagePut(`products/${safe}.${ext}`, buffer, input.contentType);
        return { url };
      }),
    orders: adminProcedure
      .input(z.object({ status: z.enum(ORDER_STATUSES).optional() }).optional())
      .query(({ input }) => db.getAllOrders(input?.status)),
    updateOrderStatus: adminProcedure
      .input(z.object({ id: z.number().int(), status: z.enum(ORDER_STATUSES) }))
      .mutation(async ({ input }) => {
        await db.updateOrderStatus(input.id, input.status);
        return { success: true } as const;
      }),
    messages: adminProcedure.query(() => db.getContactMessages()),
    setMessageRead: adminProcedure
      .input(z.object({ id: z.number().int(), isRead: z.boolean() }))
      .mutation(async ({ input }) => {
        await db.setMessageRead(input.id, input.isRead);
        return { success: true } as const;
      }),
    deleteMessage: adminProcedure.input(z.object({ id: z.number().int() })).mutation(async ({ input }) => {
      await db.deleteMessage(input.id);
      return { success: true } as const;
    }),
  }),
});

export { CATEGORY_LABELS };
export type AppRouter = typeof appRouter;
