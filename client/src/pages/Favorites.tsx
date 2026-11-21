import { useAuth } from "@/_core/hooks/useAuth";
import { Reveal } from "@/components/brand/Reveal";
import { PageIntro, SiteLayout } from "@/components/layout/SiteLayout";
import { ErrorState, LoginGate, PageLoader } from "@/components/store/States";
import { formatPrice } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import { ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Favorites() {
  const { isAuthenticated, loading } = useAuth();
  const favs = trpc.favorites.list.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();
  const refresh = () => {
    utils.favorites.list.invalidate();
    utils.favorites.ids.invalidate();
  };
  const toggle = trpc.favorites.toggle.useMutation({ onSuccess: refresh });
  const move = trpc.favorites.moveToCart.useMutation({
    onSuccess: () => {
      refresh();
      utils.cart.count.invalidate();
      utils.cart.list.invalidate();
      toast.success("نُقلت القطعة إلى حقيبة التسوق");
    },
    onError: e => toast.error(e.message),
  });

  if (loading) return <SiteLayout><PageLoader /></SiteLayout>;
  if (!isAuthenticated)
    return <SiteLayout><LoginGate title="قائمة المفضلة" message="احفظي القطع التي تلفت نظرك، وعودي إليها متى شئتِ." /></SiteLayout>;
  if (favs.isLoading) return <SiteLayout><PageLoader /></SiteLayout>;
  if (favs.error) return <SiteLayout><ErrorState onRetry={() => favs.refetch()} /></SiteLayout>;

  const items = favs.data ?? [];

  return (
    <SiteLayout>
      <PageIntro overline="Wishlist" title="قائمة المفضلة">
        {items.length > 0 ? `${items.length} قطعة محفوظة في قائمتك.` : undefined}
      </PageIntro>
      {items.length === 0 ? (
        <section className="container py-16 text-center">
          <p className="text-2xl font-light">لم تحفظي أي قطعة بعد.</p>
          <p className="mt-3 text-muted-foreground">اضغطي على القلب في أي قطعة لتظهر هنا.</p>
          <Link href="/collections" className="btn-sea mt-10">اكتشفي المجموعات</Link>
        </section>
      ) : (
        <section className="container grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
          {items.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 0.06} className="group">
              <div className="relative">
                <Link href={`/product/${p.slug}`} className="block aspect-[4/5] overflow-hidden bg-card">
                  <img src={p.images[0]} alt={p.name} className="size-full object-cover transition duration-1000 group-hover:scale-105" />
                </Link>
                <button
                  type="button"
                  onClick={() => toggle.mutate({ productId: p.id })}
                  aria-label="إزالة من المفضلة"
                  className="absolute left-3 top-3 grid size-9 place-items-center rounded-full bg-background/85 backdrop-blur hover:text-destructive"
                >
                  <X className="size-4" />
                </button>
              </div>
              <h3 className="mt-5 text-lg">{p.name}</h3>
              <p className="mt-1 text-primary">{formatPrice(p.price)}</p>
              <button
                type="button"
                disabled={!p.active || p.stock <= 0 || move.isPending}
                onClick={() => move.mutate({ productId: p.id })}
                className="btn-ghost-sea mt-4 w-full py-3"
              >
                <ShoppingBag className="size-4" />
                {!p.active || p.stock <= 0 ? "غير متاحة حالياً" : "نقل إلى الحقيبة"}
              </button>
            </Reveal>
          ))}
        </section>
      )}
    </SiteLayout>
  );
}
