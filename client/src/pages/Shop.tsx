import { Reveal } from "@/components/brand/Reveal";
import { PageIntro, SiteLayout } from "@/components/layout/SiteLayout";
import { ProductCard, ProductCardSkeleton } from "@/components/store/ProductCard";
import { ErrorState } from "@/components/store/States";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import type { Category } from "../../../drizzle/schema";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearch } from "wouter";

type Sort = "featured" | "price_asc" | "price_desc" | "newest";

const SORTS: { value: Sort; label: string }[] = [
  { value: "featured", label: "المختارات أولاً" },
  { value: "newest", label: "الأحدث" },
  { value: "price_asc", label: "السعر: من الأقل" },
  { value: "price_desc", label: "السعر: من الأعلى" },
];

export default function Shop() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const rawCategory = params.get("category");
  const category = CATEGORY_ORDER.includes(rawCategory as Category) ? (rawCategory as Category) : undefined;
  const sort = (SORTS.find(s => s.value === params.get("sort"))?.value ?? "featured") as Sort;
  const q = params.get("q") ?? "";
  const [term, setTerm] = useState(q);

  useEffect(() => setTerm(q), [q]);

  const update = (next: Record<string, string | undefined>) => {
    const p = new URLSearchParams(search);
    for (const [k, v] of Object.entries(next)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    const qs = p.toString();
    navigate(`/collections${qs ? `?${qs}` : ""}`, { replace: true });
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (term.trim() !== q) update({ q: term.trim() || undefined });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  const products = trpc.products.list.useQuery({ category, sort, search: q || undefined });

  const title = category ? `${CATEGORY_META[category].label} دُرّة` : "كل المجموعات";

  return (
    <SiteLayout>
      <PageIntro overline={category ? CATEGORY_META[category].latin : "The Collections"} title={title}>
        قطع من الذهب عيار 18، مرصّعة باللؤلؤ الطبيعي والألماس والزمرّد، تُصاغ يدوياً في ورشة الدار.
      </PageIntro>

      <section className="sticky top-[7.25rem] z-30 border-y bg-background/90 backdrop-blur">
        <div className="container flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 flex gap-1 overflow-x-auto pb-1 lg:pb-0">
            <button
              type="button"
              onClick={() => update({ category: undefined })}
              className={cn("shrink-0 px-4 py-2 text-sm transition", !category ? "bg-primary text-primary-foreground" : "hover:bg-accent")}
            >
              الكل
            </button>
            {CATEGORY_ORDER.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => update({ category: c })}
                className={cn("shrink-0 px-4 py-2 text-sm transition", category === c ? "bg-primary text-primary-foreground" : "hover:bg-accent")}
              >
                {CATEGORY_META[c].label}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <label className="relative flex-1 lg:w-72 lg:flex-none">
              <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={term}
                onChange={e => setTerm(e.target.value)}
                placeholder="ابحثي عن قطعة، حجر، أو مجموعة"
                className="h-10 w-full border bg-card pr-10 pl-9 text-sm outline-none focus:border-primary"
              />
              {term && (
                <button type="button" onClick={() => setTerm("")} aria-label="مسح البحث" className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
                  <X className="size-4" />
                </button>
              )}
            </label>
            <select
              value={sort}
              onChange={e => update({ sort: e.target.value === "featured" ? undefined : e.target.value })}
              className="h-10 border bg-card px-3 text-sm outline-none focus:border-primary"
              aria-label="ترتيب"
            >
              {SORTS.map(s => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="container pt-12">
        {products.error ? (
          <ErrorState onRetry={() => products.refetch()} />
        ) : (
          <>
            <p className="mb-10 text-sm text-muted-foreground">
              {products.isLoading ? "جارٍ التحميل…" : `${products.data?.length ?? 0} قطعة`}
            </p>
            {products.data?.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-2xl font-light">لم نجد قطعاً تطابق بحثك.</p>
                <button type="button" onClick={() => navigate("/collections")} className="btn-ghost-sea mt-8">
                  عرض كل القطع
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
                {products.isLoading
                  ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
                  : products.data?.map((p, i) => (
                      <Reveal key={p.id} delay={(i % 4) * 0.06}>
                        <ProductCard product={p} />
                      </Reveal>
                    ))}
              </div>
            )}
          </>
        )}
      </section>
    </SiteLayout>
  );
}
