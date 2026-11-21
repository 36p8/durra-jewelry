import { useAuth } from "@/_core/hooks/useAuth";
import { PageIntro, SiteLayout } from "@/components/layout/SiteLayout";
import { ErrorState, LoginGate, PageLoader } from "@/components/store/States";
import { formatPrice } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Minus, Plus, X } from "lucide-react";
import { Link } from "wouter";

export function useCartTotals() {
  const { isAuthenticated } = useAuth();
  const cart = trpc.cart.list.useQuery(undefined, { enabled: isAuthenticated });
  const items = cart.data ?? [];
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  return { cart, items, subtotal, shipping: 0, total: subtotal };
}

export default function Cart() {
  const { isAuthenticated, loading } = useAuth();
  const { cart, items, subtotal, total } = useCartTotals();
  const utils = trpc.useUtils();
  const invalidate = () => {
    utils.cart.list.invalidate();
    utils.cart.count.invalidate();
  };
  const setQty = trpc.cart.setQuantity.useMutation({ onSuccess: invalidate });
  const remove = trpc.cart.remove.useMutation({ onSuccess: invalidate });
  const clear = trpc.cart.clear.useMutation({ onSuccess: invalidate });

  if (loading) return <SiteLayout><PageLoader /></SiteLayout>;
  if (!isAuthenticated)
    return (
      <SiteLayout>
        <LoginGate title="حقيبة التسوق" message="سجّلي الدخول لتُحفظ القطع في حقيبتك وتصلي إليها من أي جهاز." />
      </SiteLayout>
    );
  if (cart.isLoading) return <SiteLayout><PageLoader /></SiteLayout>;
  if (cart.error) return <SiteLayout><ErrorState onRetry={() => cart.refetch()} /></SiteLayout>;

  return (
    <SiteLayout>
      <PageIntro overline="Shopping Bag" title="حقيبة التسوق" />
      {items.length === 0 ? (
        <section className="container py-20 text-center">
          <span className="pearl mx-auto block size-12 rounded-full" />
          <p className="mt-8 text-2xl font-light">حقيبتك فارغة حتى الآن.</p>
          <p className="mt-3 text-muted-foreground">ابدئي بقطعة واحدة، فالمجموعات الجميلة تبدأ هكذا.</p>
          <Link href="/collections" className="btn-sea mt-10">تصفّحي المجموعات</Link>
        </section>
      ) : (
        <section className="container grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="hidden grid-cols-12 border-b pb-4 text-sm text-muted-foreground md:grid">
              <span className="col-span-6">القطعة</span>
              <span className="col-span-3 text-center">الكمية</span>
              <span className="col-span-3 text-left">المجموع</span>
            </div>
            <ul>
              {items.map(item => (
                <li key={item.id} className="grid grid-cols-12 items-center gap-4 border-b py-6">
                  <Link href={`/product/${item.product.slug}`} className="col-span-4 md:col-span-2">
                    <img src={item.product.images[0]} alt={item.product.name} className="aspect-square w-full object-cover" />
                  </Link>
                  <div className="col-span-8 md:col-span-4">
                    <Link href={`/product/${item.product.slug}`} className="text-lg link-underline">{item.product.name}</Link>
                    {item.color && <p className="mt-1 text-sm text-muted-foreground">اللون: {item.color}</p>}
                    <p className="mt-1 text-sm text-muted-foreground">{formatPrice(item.product.price)}</p>
                    {!item.product.active && <p className="mt-1 text-sm text-destructive">لم تعد هذه القطعة متاحة</p>}
                  </div>
                  <div className="col-span-6 flex justify-start md:col-span-3 md:justify-center">
                    <div className="flex h-11 items-center border">
                      <button type="button" aria-label="زيادة" disabled={item.quantity >= 10 || setQty.isPending} onClick={() => setQty.mutate({ itemId: item.id, quantity: item.quantity + 1 })} className="grid h-full w-10 place-items-center hover:bg-accent">
                        <Plus className="size-3.5" />
                      </button>
                      <span className="font-latin w-8 text-center">{item.quantity}</span>
                      <button type="button" aria-label="إنقاص" disabled={item.quantity <= 1 || setQty.isPending} onClick={() => setQty.mutate({ itemId: item.id, quantity: item.quantity - 1 })} className="grid h-full w-10 place-items-center hover:bg-accent disabled:opacity-40">
                        <Minus className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="col-span-6 flex items-center justify-end gap-4 md:col-span-3">
                    <span className="text-primary">{formatPrice(item.product.price * item.quantity)}</span>
                    <button type="button" aria-label="حذف" onClick={() => remove.mutate({ itemId: item.id })} className="text-muted-foreground hover:text-destructive">
                      <X className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-between text-sm">
              <Link href="/collections" className="link-underline">متابعة التسوق</Link>
              <button type="button" onClick={() => clear.mutate()} className="link-underline text-muted-foreground hover:text-destructive">
                إفراغ الحقيبة
              </button>
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="bg-card p-8 lg:sticky lg:top-40">
              <h2 className="text-xl">ملخّص الطلب</h2>
              <dl className="mt-8 space-y-4 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">المجموع الفرعي</dt><dd>{formatPrice(subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">الشحن</dt><dd className="text-primary">مجاني</dd></div>
                <div className="hairline" />
                <div className="flex justify-between text-lg"><dt>الإجمالي</dt><dd className="text-primary">{formatPrice(total)}</dd></div>
              </dl>
              <Link href="/checkout" className="btn-sea mt-8 w-full">
                إتمام الطلب <ArrowLeft className="size-4" />
              </Link>
              <p className="mt-4 text-center text-xs text-muted-foreground">الدفع نقداً أو بالبطاقة عند الاستلام</p>
            </div>
          </aside>
        </section>
      )}
    </SiteLayout>
  );
}
