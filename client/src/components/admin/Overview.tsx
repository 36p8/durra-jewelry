import { StatusBadge } from "@/components/store/OrderTimeline";
import { ErrorState, PageLoader } from "@/components/store/States";
import { CATEGORY_META, formatDate, formatPrice } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Tab = "overview" | "products" | "orders" | "messages";

export function Overview({ onNavigate }: { onNavigate: (t: Tab) => void }) {
  const stats = trpc.admin.stats.useQuery();
  if (stats.isLoading) return <PageLoader />;
  if (stats.error || !stats.data) return <ErrorState onRetry={() => stats.refetch()} />;
  const s = stats.data;

  const cards = [
    { label: "إجمالي المبيعات", value: formatPrice(s.revenue), hint: "بدون الطلبات الملغاة" },
    { label: "الطلبات", value: s.orders, hint: `${s.pendingOrders} قيد المراجعة`, tab: "orders" as Tab },
    { label: "المنتجات", value: s.products, hint: "في الكتالوج", tab: "products" as Tab },
    { label: "رسائل غير مقروءة", value: s.unreadMessages, hint: `${s.customers} عميل مسجّل`, tab: "messages" as Tab },
  ];

  const chart = s.byCategory.map(c => ({ name: CATEGORY_META[c.category].label, count: c.c }));

  return (
    <div className="space-y-10">
      <div className="grid gap-px overflow-hidden border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(c => (
          <button
            key={c.label}
            type="button"
            disabled={!c.tab}
            onClick={() => c.tab && onNavigate(c.tab)}
            className="bg-card p-7 text-right transition enabled:hover:bg-accent"
          >
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className="font-latin mt-3 text-3xl text-primary">{c.value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{c.hint}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="border bg-card p-7 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg">أحدث الطلبات</h3>
            <button type="button" onClick={() => onNavigate("orders")} className="text-sm text-primary link-underline">الكل</button>
          </div>
          {s.recentOrders.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">لا توجد طلبات بعد.</p>
          ) : (
            <ul className="mt-6 divide-y">
              {s.recentOrders.map(o => (
                <li key={o.id} className="flex items-center justify-between gap-4 py-4 text-sm">
                  <span className="font-latin tracking-wider">{o.orderNumber}</span>
                  <span className="hidden text-muted-foreground sm:inline">{o.fullName}</span>
                  <span className="hidden text-muted-foreground md:inline">{formatDate(o.createdAt)}</span>
                  <span>{formatPrice(o.total)}</span>
                  <StatusBadge status={o.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-8 lg:col-span-2">
          <div className="border bg-card p-7">
            <h3 className="text-lg">القطع حسب التصنيف</h3>
            <div className="mt-6 h-48" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} width={24} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "var(--accent)" }} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} formatter={v => [v, "قطعة"]} />
                  <Bar dataKey="count" fill="var(--primary)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="border bg-card p-7">
            <h3 className="text-lg">مخزون منخفض</h3>
            {s.lowStock.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">كل القطع متوفرة بكميات كافية.</p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm">
                {s.lowStock.map(p => (
                  <li key={p.id} className="flex justify-between">
                    <span>{p.name}</span>
                    <span className={p.stock === 0 ? "text-destructive" : "text-primary"}>{p.stock === 0 ? "نفدت" : `${p.stock} متبقية`}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
