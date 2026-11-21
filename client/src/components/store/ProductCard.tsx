import { useStoreActions } from "@/hooks/useStoreActions";
import { CATEGORY_META, formatPrice } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Product } from "../../../../drizzle/schema";
import { Heart } from "lucide-react";
import { Link } from "wouter";

export function ProductCard({ product, className, tall = false }: { product: Product; className?: string; tall?: boolean }) {
  const { toggleFavorite, isFavorite } = useStoreActions();
  const fav = isFavorite(product.id);
  const second = product.images[1];

  return (
    <article className={cn("group relative", className)}>
      <Link href={`/product/${product.slug}`} className="block">
        <div className={cn("relative overflow-hidden bg-card", tall ? "aspect-[3/4]" : "aspect-[4/5]")}>
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className={cn(
              "absolute inset-0 size-full object-cover transition-all duration-[1400ms] ease-out group-hover:scale-105",
              second && "group-hover:opacity-0",
            )}
          />
          {second && (
            <img
              src={second}
              alt=""
              loading="lazy"
              className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-[1200ms] group-hover:opacity-100"
            />
          )}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
            <span className="font-latin text-xs tracking-[0.3em] text-foreground/60 uppercase">
              {CATEGORY_META[product.category].latin}
            </span>
          </div>
          {product.compareAtPrice && (
            <span className="absolute bottom-4 right-4 bg-primary px-3 py-1 text-[0.7rem] text-primary-foreground">
              عرض خاص
            </span>
          )}
          {product.stock > 0 && product.stock <= 3 && (
            <span className="absolute bottom-4 left-4 bg-background/85 px-3 py-1 text-[0.7rem] text-foreground backdrop-blur">
              قطع محدودة
            </span>
          )}
        </div>
      </Link>
      <button
        type="button"
        onClick={() => toggleFavorite(product.id)}
        aria-label={fav ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
        className="absolute left-3 top-3 grid size-10 place-items-center rounded-full bg-background/80 text-primary backdrop-blur transition hover:scale-110"
      >
        <Heart className={cn("size-4 transition", fav && "fill-current")} />
      </button>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          {product.collection && <p className="mb-1 text-xs text-muted-foreground">{product.collection}</p>}
          <Link href={`/product/${product.slug}`}>
            <h3 className="text-lg font-medium leading-snug link-underline">{product.name}</h3>
          </Link>
        </div>
        <div className="shrink-0 text-left">
          <p className="font-medium text-primary">{formatPrice(product.price)}</p>
          {product.compareAtPrice && (
            <p className="text-xs text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</p>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] bg-muted" />
      <div className="mt-5 h-4 w-2/3 bg-muted" />
      <div className="mt-2 h-4 w-1/3 bg-muted" />
    </div>
  );
}
