import { useAuth } from "@/_core/hooks/useAuth";
import { PageIntro, SiteLayout } from "@/components/layout/SiteLayout";
import { OrderTimeline, StatusBadge } from "@/components/store/OrderTimeline";
import { ErrorState, LoginGate, PageLoader } from "@/components/store/States";
import { formatDate, formatPrice } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import { ChevronDown, Heart, LayoutDashboard, LogOut, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function Account() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const orders = trpc.orders.mine.useQuery(undefined, { enabled: isAuthenticated });
  const [openId, setOpenId] = useState<number | null>(null);
  const [, navigate] = useLocation();

  if (loading) return <SiteLayout><PageLoader /></SiteLayout>;
  if (!isAuthenticated || !user)
    return <SiteLayout><LoginGate title="حسابي" message="سجّلي الدخول لمتابعة طلباتك وإدارة مفضلتك." /></SiteLayout>;

  return (
    <SiteLayout>
      <PageIntro overline="My Account" title={`أهلاً، ${user.name?.split(" ")[0] ?? "بكِ"}`}>
        {user.email}
      </PageIntro>

      <section className="container grid gap-14 lg:grid-cols-12">
        <aside className="space-y-2 lg:col-span-3">
          <Link href="/favorites" className="flex items-center gap-3 border bg-card p-4 hover:border-primary"><Heart className="size-4 text-primary" /> قائمة المفضلة</Link>
          <Link href="/cart" className="flex items-center gap-3 border bg-card p-4 hover:border-primary"><ShoppingBag className="size-4 text-primary" /> حقيبة التسوق</Link>
          {user.role === "admin" && (
            <Link href="/admin" className="flex items-center gap-3 border bg-card p-4 hover:border-primary"><LayoutDashboard className="size-4 text-primary" /> لوحة التحكم</Link>
          )}
          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate("/");
            }}
            className="flex w-full items-center gap-3 border p-4 text-muted-foreground hover:border-destructive hover:text-destructive"
          >
            <LogOut className="size-4" /> تسجيل الخروج
          </button>
        </aside>

        <div className="lg:col-span-9">
          <h2 className="text-2xl">سجل الطلبات</h2>
          {orders.isLoading ? (
            <PageLoader />
          ) : orders.error ? (
            <ErrorState onRetry={() => orders.refetch()} />
          ) : orders.data?.length === 0 ? (
            <div className="mt-8 border bg-card p-12 text-center">
              <p className="text-lg">لا توجد طلبات حتى الآن.</p>
              <Link href="/collections" className="btn-sea mt-8">ابدئي التسوق</Link>
            </div>
          ) : (
            <ul className="mt-8 space-y-4">
              {orders.data?.map(o => {
                const open = openId === o.id;
                return (
                  <li key={o.id} className="border bg-card">
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : o.id)}
                      className="grid w-full grid-cols-2 items-center gap-4 p-6 text-right md:grid-cols-5"
                    >
                      <span className="font-latin tracking-wider text-primary">{o.orderNumber}</span>
                      <span className="text-sm text-muted-foreground">{formatDate(o.createdAt)}</span>
                      <span className="text-sm">{o.items.reduce((s, i) => s + i.quantity, 0)} قطعة</span>
                      <span>{formatPrice(o.total)}</span>
                      <span className="flex items-center justify-end gap-3">
                        <StatusBadge status={o.status} />
                        <ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} />
                      </span>
                    </button>
                    {open && (
                      <div className="border-t p-6">
                        <OrderTimeline status={o.status} />
                        <ul className="mt-8 space-y-4">
                          {o.items.map(i => (
                            <li key={i.id} className="flex items-center gap-4">
                              {i.image && <img src={i.image} alt="" className="size-14 object-cover" />}
                              <span className="flex-1">{i.name}{i.color ? ` · ${i.color}` : ""} × {i.quantity}</span>
                              <span className="text-sm">{formatPrice(i.price * i.quantity)}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-6 text-sm text-muted-foreground">التوصيل إلى: {o.city} — {o.address}</p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
