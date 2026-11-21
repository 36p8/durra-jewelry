import { useAuth } from "@/_core/hooks/useAuth";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { OrderTimeline } from "@/components/store/OrderTimeline";
import { ErrorState, LoginGate, PageLoader } from "@/components/store/States";
import { formatDate, formatPrice } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import NotFound from "@/pages/NotFound";
import { motion } from "framer-motion";
import { Link, useParams } from "wouter";

export default function OrderConfirmation() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { isAuthenticated, loading } = useAuth();
  const order = trpc.orders.byNumber.useQuery({ orderNumber: orderNumber ?? "" }, { enabled: isAuthenticated && Boolean(orderNumber) });

  if (loading) return <SiteLayout><PageLoader /></SiteLayout>;
  if (!isAuthenticated) return <SiteLayout><LoginGate title="تفاصيل الطلب" message="سجّلي الدخول لعرض تفاصيل طلبك." /></SiteLayout>;
  if (order.isLoading) return <SiteLayout><PageLoader /></SiteLayout>;
  if (order.error) return <SiteLayout><ErrorState onRetry={() => order.refetch()} /></SiteLayout>;
  if (!order.data) return <NotFound />;

  const o = order.data;

  return (
    <SiteLayout>
      <section className="container max-w-3xl py-20 text-center">
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 1 }} className="pearl mx-auto block size-16 rounded-full" />
        <h1 className="mt-10 text-4xl font-light md:text-5xl">شكراً لكِ، {o.fullName.split(" ")[0]}</h1>
        <p className="mt-5 text-lg leading-loose text-muted-foreground">
          استلمنا طلبك وسيتواصل معكِ فريق الدار قريباً لتأكيد موعد التوصيل.
        </p>
        <p className="font-latin mt-6 text-xl tracking-[0.3em] text-primary">{o.orderNumber}</p>
      </section>

      <section className="container max-w-3xl">
        <div className="bg-card p-8 md:p-10">
          <OrderTimeline status={o.status} />
          <div className="hairline my-8" />
          <ul className="space-y-5">
            {o.items.map(i => (
              <li key={i.id} className="flex items-center gap-4">
                {i.image && <img src={i.image} alt="" className="size-16 object-cover" />}
                <div className="flex-1">
                  <p>{i.name}</p>
                  <p className="text-xs text-muted-foreground">{i.color ? `${i.color} · ` : ""}الكمية {i.quantity}</p>
                </div>
                <span>{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="hairline my-8" />
          <div className="grid gap-8 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">التوصيل إلى</p>
              <p className="mt-2 leading-loose">{o.fullName}<br />{o.city} — {o.address}<br /><span dir="ltr">{o.phone}</span></p>
            </div>
            <div className="sm:text-left">
              <p className="text-muted-foreground">تاريخ الطلب</p>
              <p className="mt-2">{formatDate(o.createdAt)}</p>
              <p className="mt-4 text-muted-foreground">الإجمالي (الدفع عند الاستلام)</p>
              <p className="mt-2 text-xl text-primary">{formatPrice(o.total)}</p>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/account" className="btn-sea">متابعة طلباتي</Link>
          <Link href="/collections" className="btn-ghost-sea">مواصلة التسوق</Link>
        </div>
      </section>
    </SiteLayout>
  );
}
