/**
 * One-time catalogue seed. Inserts the launch collection only for slugs that
 * do not exist yet, so admin edits are never overwritten on re-run.
 * Run: pnpm tsx scripts/seed.ts
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { products, type InsertProduct } from "../drizzle/schema";

const IMG = {
  ringPearl: "/manus-storage/async-images/N9jOC0UvUIxJgVwPfzgXup/image-1.webp",
  ringEmerald: "/manus-storage/async-images/N9jOC0UvUIxJgVwPfzgXup/image-2.webp",
  necklaceStrand: "/manus-storage/async-images/3RPAnBhlnpE0bj43TAhNTX/image-1.webp",
  necklacePendant: "/manus-storage/async-images/3RPAnBhlnpE0bj43TAhNTX/image-2.webp",
  braceletBangle: "/manus-storage/async-images/3RPAnBhlnpE0bj43TAhNTX/image-3.webp",
  braceletTennis: "/manus-storage/async-images/3RPAnBhlnpE0bj43TAhNTX/image-4.webp",
  earringsDrop: "/manus-storage/async-images/hRNSn4SkNmUJRrylRbfHKM/image-1.webp",
  earringsHoop: "/manus-storage/async-images/hRNSn4SkNmUJRrylRbfHKM/image-2.webp",
  catRings: "/manus-storage/async-images/ZVoKHl9yQJ6NbZ5aqTrsoU/image-1.webp",
  catNecklaces: "/manus-storage/async-images/ZVoKHl9yQJ6NbZ5aqTrsoU/image-2.webp",
  catBracelets: "/manus-storage/async-images/ZVoKHl9yQJ6NbZ5aqTrsoU/image-3.webp",
  catEarrings: "/manus-storage/async-images/ZVoKHl9yQJ6NbZ5aqTrsoU/image-4.webp",
};

const catalogue: InsertProduct[] = [
  {
    slug: "qamar-pearl-ring",
    name: "خاتم قمر الخليج",
    collection: "مجموعة الهيرات",
    category: "ring",
    price: 12500,
    shortDescription: "لؤلؤة بحرية بيضاء تحيط بها هالة من الألماس على ذهب أصفر.",
    description:
      "استُلهم خاتم «قمر الخليج» من ليالي الغوص القديمة، حين كان البحّارة يعودون بلؤلؤة واحدة تساوي موسماً كاملاً. لؤلؤة مستديرة بلمعان مرآوي، تحتضنها هالة دقيقة من الألماس المقطوع يدوياً، فوق حلقة رقيقة من الذهب عيار 18 تلائم الارتداء اليومي والمناسبات معاً.",
    metal: "ذهب أصفر",
    karat: "18 قيراط",
    stones: "لؤلؤ بحري، ألماس 0.35 قيراط",
    weight: "4.2 غ",
    colors: ["ذهبي", "أبيض", "وردي"],
    images: [IMG.ringPearl, IMG.catRings],
    featured: true,
    stock: 8,
  },
  {
    slug: "nakhla-emerald-ring",
    name: "خاتم نخلة الزمرّد",
    collection: "مجموعة الواحة",
    category: "ring",
    price: 18900,
    compareAtPrice: 21000,
    shortDescription: "زمرّد بيضاوي عميق الخضرة بين ماستين على ذهب وردي.",
    description:
      "خضرة الزمرّد في هذا الخاتم تشبه ظلّ النخيل عند الظهيرة. حجر بيضاوي مختار بعناية لصفائه، يحيط به ألماس صغير يمنحه إشراقة هادئة، ومركّب على ذهب وردي عيار 18 بلمسة نهائية مصقولة.",
    metal: "ذهب وردي",
    karat: "18 قيراط",
    stones: "زمرّد 1.1 قيراط، ألماس 0.2 قيراط",
    weight: "3.8 غ",
    colors: ["وردي", "ذهبي"],
    images: [IMG.ringEmerald, IMG.catRings],
    featured: false,
    stock: 3,
  },
  {
    slug: "hayrat-pearl-strand",
    name: "عقد الهيرات",
    collection: "مجموعة الهيرات",
    category: "necklace",
    price: 16000,
    shortDescription: "صفّ واحد من اللؤلؤ الطبيعي بقفل ذهبي منقوش.",
    description:
      "«الهيرات» هي مغاصات اللؤلؤ في مياه الخليج، ومنها أخذ هذا العقد اسمه. حبّات متناسقة الحجم واللمعان، منتقاة واحدة واحدة ومعقودة يدوياً بخيط حريري، وينتهي العقد بقفل من الذهب عيار 18 نُقش عليه شعار الدار.",
    metal: "ذهب أصفر",
    karat: "18 قيراط",
    stones: "لؤلؤ طبيعي 7–7.5 مم",
    weight: "32 غ",
    colors: ["أبيض", "كريمي"],
    images: [IMG.necklaceStrand, IMG.catNecklaces],
    featured: true,
    stock: 6,
  },
  {
    slug: "hilal-diamond-pendant",
    name: "قلادة الهلال",
    collection: "مجموعة الليل",
    category: "necklace",
    price: 22400,
    shortDescription: "هلال مرصّع بالألماس تتدلّى منه لؤلؤة صغيرة على ذهب أبيض.",
    description:
      "قلادة الهلال تحتفي بأول ليلة في الشهر، حين يظهر الضوء رفيعاً ثم يكبر. هلال مرصّع بالكامل بالألماس اللامع، تتدلّى منه لؤلؤة صغيرة كقطرة ندى، على سلسلة رفيعة من الذهب الأبيض قابلة للتعديل.",
    metal: "ذهب أبيض",
    karat: "18 قيراط",
    stones: "ألماس 0.6 قيراط، لؤلؤ أكويا",
    weight: "5.1 غ",
    colors: ["أبيض", "ذهبي"],
    images: [IMG.necklacePendant, IMG.catNecklaces],
    featured: true,
    stock: 5,
  },
  {
    slug: "mawja-pearl-bangle",
    name: "سوار الموجة",
    collection: "مجموعة الهيرات",
    category: "bracelet",
    price: 35400,
    shortDescription: "سوار صلب من الذهب تتوسطه لآلئ صغيرة مدمجة كخطّ الموج.",
    description:
      "سوار «الموجة» قطعة صلبة بخطوط ناعمة، تتوزّع على سطحه لآلئ صغيرة مدمجة في الذهب كما يترك الموج آثاره على الرمل. يُغلق بمفصل خفي ويُصنع بمقاسات حسب الطلب.",
    metal: "ذهب أصفر",
    karat: "18 قيراط",
    stones: "لؤلؤ بحري 3 مم × 9",
    weight: "18.5 غ",
    colors: ["ذهبي", "وردي"],
    images: [IMG.braceletBangle, IMG.catBracelets],
    featured: true,
    stock: 4,
  },
  {
    slug: "sail-tennis-bracelet",
    name: "سوار الشراع",
    collection: "مجموعة الواحة",
    category: "bracelet",
    price: 41800,
    shortDescription: "خطّ متصل من الألماس يتخلله زمرّد على ذهب أبيض.",
    description:
      "سوار «الشراع» خطّ متصل من الألماس اللامع يتناوب معه زمرّد صغير، كأنه انعكاس الضوء على الماء. مرن ومريح، بقفل أمان مزدوج، مناسب للحفلات وللإطلالة اليومية الراقية.",
    metal: "ذهب أبيض",
    karat: "18 قيراط",
    stones: "ألماس 2.4 قيراط، زمرّد 0.8 قيراط",
    weight: "11 غ",
    colors: ["أبيض"],
    images: [IMG.braceletTennis, IMG.catBracelets],
    featured: false,
    stock: 2,
  },
  {
    slug: "nada-pearl-drops",
    name: "أقراط قطرة الندى",
    collection: "مجموعة الهيرات",
    category: "earrings",
    price: 14200,
    shortDescription: "لؤلؤ باروكي طويل يتدلّى من ماسة صغيرة على ذهب أصفر.",
    description:
      "كل لؤلؤة باروكية تولد بشكل لا يتكرر، ولذلك لا يتطابق زوجان من أقراط «قطرة الندى» تماماً. ماسة صغيرة تمسك اللؤلؤة من الأعلى، فتتحرك القطعة مع كل التفاتة بخفة وأنوثة.",
    metal: "ذهب أصفر",
    karat: "18 قيراط",
    stones: "لؤلؤ باروكي، ألماس 0.18 قيراط",
    weight: "6.4 غ",
    colors: ["ذهبي", "أبيض"],
    images: [IMG.earringsDrop, IMG.catEarrings],
    featured: true,
    stock: 7,
  },
  {
    slug: "halqa-diamond-hoops",
    name: "أقراط الحلقة",
    collection: "مجموعة الليل",
    category: "earrings",
    price: 9800,
    shortDescription: "حلقات صغيرة مرصّعة بالألماس تتدلّى منها لؤلؤة دقيقة.",
    description:
      "أقراط «الحلقة» قطعة يومية بروح احتفالية: حلقات صغيرة من الذهب الوردي مرصّعة بالألماس على وجهها الأمامي، تتدلّى من كل منها لؤلؤة دقيقة قابلة للفك لتلائم أكثر من إطلالة.",
    metal: "ذهب وردي",
    karat: "18 قيراط",
    stones: "ألماس 0.3 قيراط، لؤلؤ 4 مم",
    weight: "3.2 غ",
    colors: ["وردي", "ذهبي", "أبيض"],
    images: [IMG.earringsHoop, IMG.catEarrings],
    featured: false,
    stock: 12,
  },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  const connection = await mysql.createConnection(url);
  try {
    const d = drizzle(connection);
    const existing = await d.select({ slug: products.slug }).from(products);
    const have = new Set(existing.map(r => r.slug));
    const missing = catalogue.filter(p => !have.has(p.slug));
    if (missing.length) await d.insert(products).values(missing);
    console.log(`Seed complete: ${missing.length} inserted, ${have.size} already present.`);
  } finally {
    await connection.end();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
