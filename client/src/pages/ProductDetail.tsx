import { Reveal } from "@/components/brand/Reveal";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ProductCard } from "@/components/store/ProductCard";
import { ErrorState, PageLoader } from "@/components/store/States";
import { useStoreActions } from "@/hooks/useStoreActions";
import { CATEGORY_META, COLOR_SWATCHES, formatPrice } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import NotFound from "@/pages/NotFound";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const query = trpc.products.bySlug.useQuery({ slug: slug ?? "" }, { enabled: Boolean(slug) });
  const { addToCart, toggleFavorite, isFavorite, adding } = useStoreActions();
  const [imageIndex, setImageIndex] = useState(0);
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);

  const product = query.data?.product;

  useEffect(() => {
    setImageIndex(0);
    setQty(1);
    setColor(product?.colors[0] ?? "");
  }, [product?.id]);

  if (query.isLoading) return <SiteLayout><PageLoader /></SiteLayout>;
  if (query.error) return <SiteLayout><ErrorState onRetry={() => query.refetch()} /></SiteLayout>;
  if (!query.data || !product) return <NotFound />;

  const fav = isFavorite(product.id);
  const soldOut = product.stock <= 0;
  const meta = CATEGORY_META[product.category];

  return (
    <SiteLayout>
      <div className="container pt-8 text-sm text-muted-foreground">
        <Link href="/collections" className="link-underline">المجموعات</Link>
        <span className="mx-2">/</span>
        <Link href={`/collections?category=${product.category}`} className="link-underline">{meta.label}</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <section className="container grid gap-12 pt-8 lg:grid-cols-12 lg:gap-16">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <div className="flex flex-col-reverse gap-4 md:flex-row">
            <div className="flex gap-3 md:flex-col">
              {product.images.map((img, i) => (
                <button
                  key={img + i}
                  type="button"
                  onClick={() => setImageIndex(i)}
                  className={cn("size-20 overflow-hidden border-2 transition", i === imageIndex ? "border-primary" : "border-transparent opacity-70 hover:opacity-100")}
                  aria-label={`الصورة ${i + 1}`}
                >
                  <img src={img} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
            <div className="relative aspect-square flex-1 overflow-hidden bg-card">
              <AnimatePresence mode="wait">
                <motion.img
                  key={imageIndex}
                  src={product.images[imageIndex]}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 size-full object-cover"
                />
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-40">
            <span className="eyebrow">{product.collection ?? meta.latin}</span>
            <h1 className="mt-5 text-4xl leading-tight font-light md:text-5xl">{product.name}</h1>
            <div className="mt-6 flex items-baseline gap-4">
              <p className="text-2xl text-primary">{formatPrice(product.price)}</p>
              {product.compareAtPrice && <p className="text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</p>}
              <span className="text-xs text-muted-foreground">شامل ضريبة القيمة المضافة</span>
            </div>
            <p className="mt-6 text-lg leading-loose text-muted-foreground">{product.shortDescription}</p>

            {product.colors.length > 0 && (
              <div className="mt-10">
                <p className="mb-4 text-sm">
                  اللون: <span className="text-primary">{color}</span>
                </p>
                <div className="flex gap-3">
                  {product.colors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      aria-label={c}
                      title={c}
                      className={cn("size-10 rounded-full p-1 ring-1 transition", c === color ? "ring-primary ring-2" : "ring-border")}
                    >
                      <span className="block size-full rounded-full" style={{ background: COLOR_SWATCHES[c] ?? "var(--sand)" }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10 flex gap-3">
              <div className="flex h-14 items-center border">
                <button type="button" aria-label="زيادة" onClick={() => setQty(q => Math.min(10, q + 1))} className="grid h-full w-12 place-items-center hover:bg-accent">
                  <Plus className="size-4" />
                </button>
                <span className="w-8 text-center font-latin text-lg">{qty}</span>
                <button type="button" aria-label="إنقاص" onClick={() => setQty(q => Math.max(1, q - 1))} className="grid h-full w-12 place-items-center hover:bg-accent">
                  <Minus className="size-4" />
                </button>
              </div>
              <button
                type="button"
                disabled={soldOut || adding}
                onClick={() => addToCart(product.id, color, qty)}
                className="btn-sea h-14 flex-1"
              >
                <ShoppingBag className="size-4" />
                {soldOut ? "نفدت الكمية" : adding ? "جارٍ الإضافة…" : "إضافة إلى الحقيبة"}
              </button>
              <button
                type="button"
                onClick={() => toggleFavorite(product.id)}
                aria-label={fav ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
                className="grid size-14 place-items-center border text-primary transition hover:border-primary"
              >
                <Heart className={cn("size-5", fav && "fill-current")} />
              </button>
            </div>
            {product.stock > 0 && product.stock <= 3 && (
              <p className="mt-4 text-sm text-primary">تبقّى {product.stock} قطع فقط من هذا التصميم.</p>
            )}

            <div className="mt-12 border-t">
              <details open className="group border-b py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-lg">
                  الوصف <Plus className="size-4 transition group-open:rotate-45" />
                </summary>
                <p className="mt-4 leading-loose text-muted-foreground">{product.description}</p>
              </details>
              <details open className="group border-b py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-lg">
                  المواصفات <Plus className="size-4 transition group-open:rotate-45" />
                </summary>
                <dl className="mt-4 grid grid-cols-2 gap-y-4 text-sm">
                  <dt className="text-muted-foreground">المعدن</dt>
                  <dd>{product.metal}</dd>
                  <dt className="text-muted-foreground">العيار</dt>
                  <dd>{product.karat}</dd>
                  <dt className="text-muted-foreground">الأحجار</dt>
                  <dd>{product.stones}</dd>
                  {product.weight && (
                    <>
                      <dt className="text-muted-foreground">الوزن التقريبي</dt>
                      <dd>{product.weight}</dd>
                    </>
                  )}
                  <dt className="text-muted-foreground">رمز القطعة</dt>
                  <dd className="font-latin tracking-wider">DR-{String(product.id).padStart(5, "0")}</dd>
                </dl>
              </details>
              <details className="group border-b py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-lg">
                  التوصيل والإرجاع <Plus className="size-4 transition group-open:rotate-45" />
                </summary>
                <p className="mt-4 leading-loose text-muted-foreground">
                  توصيل مجاني ومؤمَّن خلال 3–5 أيام عمل، والدفع عند الاستلام. يمكنكِ إرجاع القطعة أو استبدالها خلال 14 يوماً بحالتها الأصلية مع الشهادة والتغليف.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      {query.data.related.length > 0 && (
        <section className="container mt-32">
          <Reveal>
            <span className="eyebrow">قد يعجبكِ أيضاً</span>
            <h2 className="mt-5 text-3xl font-light md:text-4xl">قطع من العائلة نفسها</h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
            {query.data.related.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.06}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
