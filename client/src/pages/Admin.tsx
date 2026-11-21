import { useAuth } from "@/_core/hooks/useAuth";
import { MessagesPanel } from "@/components/admin/MessagesPanel";
import { OrdersPanel } from "@/components/admin/OrdersPanel";
import { Overview } from "@/components/admin/Overview";
import { ProductsPanel } from "@/components/admin/ProductsPanel";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { LoginGate, PageLoader } from "@/components/store/States";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { BarChart3, Gem, Mail, Package } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const TABS = [
  { id: "overview", label: "نظرة عامة", icon: BarChart3 },
  { id: "products", label: "المنتجات", icon: Gem },
  { id: "orders", label: "الطلبات", icon: Package },
  { id: "messages", label: "الرسائل", icon: Mail },
] as const;

type Tab = (typeof TABS)[number]["id"];

export default function Admin() {
  const { user, loading, isAuthenticated } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const stats = trpc.admin.stats.useQuery(undefined, { enabled: user?.role === "admin" });

  if (loading) return <SiteLayout><PageLoader /></SiteLayout>;
  if (!isAuthenticated) return <SiteLayout><LoginGate title="لوحة التحكم" message="هذه الصفحة مخصّصة لإدارة الدار. سجّلي الدخول بحساب المسؤول." /></SiteLayout>;
  if (user?.role !== "admin")
    return (
      <SiteLayout>
        <section className="container grid min-h-[50vh] place-items-center text-center">
          <div>
            <h1 className="text-3xl font-light">لا تملكين صلاحية الوصول</h1>
            <p className="mt-4 text-muted-foreground">لوحة التحكم متاحة لمسؤولي المتجر فقط.</p>
            <Link href="/" className="btn-ghost-sea mt-8">العودة إلى الرئيسية</Link>
          </div>
        </section>
      </SiteLayout>
    );

  const badges: Partial<Record<Tab, number>> = {
    orders: stats.data?.pendingOrders,
    messages: stats.data?.unreadMessages,
  };

  return (
    <SiteLayout>
      <section className="container pt-12">
        <span className="eyebrow">Atelier Console</span>
        <h1 className="mt-5 text-4xl font-light">لوحة تحكم الدار</h1>

        <nav className="mt-10 flex gap-1 overflow-x-auto border-b">
          {TABS.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "relative flex shrink-0 items-center gap-2 px-5 py-4 text-sm transition",
                tab === t.id ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <t.icon className="size-4" />
              {t.label}
              {badges[t.id] ? (
                <span className="grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[0.65rem] leading-5 text-primary-foreground">{badges[t.id]}</span>
              ) : null}
              {tab === t.id && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />}
            </button>
          ))}
        </nav>

        <div className="py-10">
          {tab === "overview" && <Overview onNavigate={setTab} />}
          {tab === "products" && <ProductsPanel />}
          {tab === "orders" && <OrdersPanel />}
          {tab === "messages" && <MessagesPanel />}
        </div>
      </section>
    </SiteLayout>
  );
}
