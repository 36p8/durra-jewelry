import type { Category, OrderStatus } from "../../../drizzle/schema";

export const CATEGORY_META: Record<Category, { label: string; singular: string; latin: string; image: string }> = {
  ring: {
    label: "خواتم",
    singular: "خاتم",
    latin: "Rings",
    image: "/manus-storage/async-images/ZVoKHl9yQJ6NbZ5aqTrsoU/image-1.webp",
  },
  necklace: {
    label: "عقود",
    singular: "عقد",
    latin: "Necklaces",
    image: "/manus-storage/async-images/ZVoKHl9yQJ6NbZ5aqTrsoU/image-2.webp",
  },
  bracelet: {
    label: "أساور",
    singular: "سوار",
    latin: "Bracelets",
    image: "/manus-storage/async-images/ZVoKHl9yQJ6NbZ5aqTrsoU/image-3.webp",
  },
  earrings: {
    label: "أقراط",
    singular: "قرط",
    latin: "Earrings",
    image: "/manus-storage/async-images/ZVoKHl9yQJ6NbZ5aqTrsoU/image-4.webp",
  },
};

export const CATEGORY_ORDER: Category[] = ["ring", "necklace", "bracelet", "earrings"];

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; tone: string }> = {
  pending: { label: "قيد المراجعة", tone: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200" },
  confirmed: { label: "مؤكَّد", tone: "bg-sky-100 text-sky-900 dark:bg-sky-900/30 dark:text-sky-200" },
  shipped: { label: "قيد الشحن", tone: "bg-indigo-100 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-200" },
  delivered: { label: "تم التسليم", tone: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200" },
  cancelled: { label: "ملغى", tone: "bg-rose-100 text-rose-900 dark:bg-rose-900/30 dark:text-rose-200" },
};

export const ORDER_STEPS: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered"];

export const COLOR_SWATCHES: Record<string, string> = {
  "ذهبي": "linear-gradient(135deg,#f3d98b,#c99a3b)",
  "أبيض": "linear-gradient(135deg,#ffffff,#d9dcdf)",
  "وردي": "linear-gradient(135deg,#f6cbb7,#c98a72)",
  "كريمي": "linear-gradient(135deg,#fbf3e2,#e2d2b1)",
  "فضي": "linear-gradient(135deg,#f2f2f2,#a9adb3)",
  "أسود": "linear-gradient(135deg,#4a4a4a,#111111)",
};

export const IMAGES = {
  hero: "/manus-storage/async-images/VMiYd1OFA20htl23ZBYoNW/image-1.webp",
  atelier: "/manus-storage/async-images/VMiYd1OFA20htl23ZBYoNW/image-2.webp",
  model: "/manus-storage/async-images/VMiYd1OFA20htl23ZBYoNW/image-3.webp",
  sea: "/manus-storage/async-images/hRNSn4SkNmUJRrylRbfHKM/image-3.webp",
};

export const CITIES = ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "الطائف", "أبها", "تبوك", "بريدة", "حائل", "أخرى"];

export function formatPrice(value: number) {
  return `${value.toLocaleString("en-US")} ر.س`;
}

export function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("ar-SA-u-nu-latn", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export function toArabicIndex(n: number) {
  return String(n).padStart(2, "0");
}
