import { Reveal } from "@/components/brand/Reveal";
import { PageIntro, SiteLayout } from "@/components/layout/SiteLayout";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CATEGORY_META, CATEGORY_ORDER, IMAGES, formatPrice } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import type { Category } from "../../../drizzle/schema";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";

type Tile = { src: string; title: string; caption: string; href?: string; category?: Category; price?: number };

const EDITORIAL: Tile[] = [
  { src: IMAGES.model, title: "إطلالة الهيرات", caption: "أقراط قطرة الندى مع عقد الهيرات" },
  { src: IMAGES.atelier, title: "في الورشة", caption: "تثبيت اللؤلؤة يدوياً في خاتم قمر الخليج" },
  { src: IMAGES.hero, title: "من البحر", caption: "حبّات لؤلؤ طبيعي قبل نظمها" },
];

export default function Gallery() {
  const products = trpc.products.list.useQuery({});
  const [filter, setFilter] = useState<Category | "all">("all");
  const [active, setActive] = useState<Tile | null>(null);

  const tiles = useMemo<Tile[]>(() => {
    const productTiles: Tile[] = (products.data ?? []).map(p => ({
      src: p.images[0],
      title: p.name,
      caption: p.shortDescription,
      href: `/product/${p.slug}`,
      category: p.category,
      price: p.price,
    }));
    if (filter !== "all") return productTiles.filter(t => t.category === filter);
    const merged: Tile[] = [];
    productTiles.forEach((t, i) => {
      merged.push(t);
      if (i % 3 === 1 && EDITORIAL[Math.floor(i / 3)]) merged.push(EDITORIAL[Math.floor(i / 3)]);
    });
    return merged;
  }, [products.data, filter]);

  return (
    <SiteLayout>
      <PageIntro overline="The Gallery" title="معرض المقتنيات">
        نافذة على عالم دُرّة: قطع المجموعات، ولحظات من الورشة، وإطلالات تلهمكِ.
      </PageIntro>

      <div className="container mb-12 flex flex-wrap gap-2">
        {(["all", ...CATEGORY_ORDER] as const).map(c => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={cn("border px-5 py-2 text-sm transition", filter === c ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary")}
          >
            {c === "all" ? "الكل" : CATEGORY_META[c].label}
          </button>
        ))}
      </div>

      <section className="container columns-2 gap-5 md:columns-3 lg:gap-8">
        {tiles.map((t, i) => (
          <Reveal key={t.src + i} delay={(i % 3) * 0.06} className="mb-5 break-inside-avoid lg:mb-8">
            <button type="button" onClick={() => setActive(t)} className="group relative block w-full overflow-hidden text-right">
              <img
                src={t.src}
                alt={t.title}
                loading="lazy"
                className={cn("w-full object-cover transition duration-[1400ms] group-hover:scale-105", i % 4 === 0 ? "aspect-[3/4]" : i % 4 === 2 ? "aspect-[4/5]" : "aspect-square")}
              />
              <span className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-black/0 to-transparent p-5 text-white opacity-0 transition duration-500 group-hover:opacity-100">
                <span className="text-lg">{t.title}</span>
                <span className="mt-1 text-sm text-white/80">{t.caption}</span>
              </span>
            </button>
          </Reveal>
        ))}
      </section>

      <Dialog open={Boolean(active)} onOpenChange={o => !o && setActive(null)}>
        <DialogContent className="max-w-4xl gap-0 overflow-hidden rounded-none border-0 p-0 sm:max-w-4xl">
          {active && (
            <div className="grid md:grid-cols-5">
              <img src={active.src} alt={active.title} className="aspect-square w-full object-cover md:col-span-3" />
              <div className="flex flex-col justify-center p-8 md:col-span-2">
                <DialogTitle className="text-2xl font-normal">{active.title}</DialogTitle>
                <p className="mt-4 leading-loose text-muted-foreground">{active.caption}</p>
                {active.price && <p className="mt-6 text-xl text-primary">{formatPrice(active.price)}</p>}
                {active.href && (
                  <Link href={active.href} className="btn-sea mt-8">
                    عرض التفاصيل <ArrowLeft className="size-4" />
                  </Link>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}
