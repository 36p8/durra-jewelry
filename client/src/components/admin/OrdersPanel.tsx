import { StatusBadge } from "@/components/store/OrderTimeline";
import { ErrorState, PageLoader } from "@/components/store/States";
import { ORDER_STATUS_META, formatDate, formatPrice } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { ORDER_STATUSES, type OrderStatus } from "../../../../drizzle/schema";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function OrdersPanel() {
  const [filter, setFilter] = useState<OrderStatus | undefined>();
  const [openId, setOpenId] = useState<number | null>(null);
  const orders = trpc.admin.orders.useQuery(filter ? { status: filter } : undefined);
  const utils = trpc.useUtils();
  const updateStatus = trpc.admin.updateOrderStatus.useMutation({
    onSuccess: () => {
      toast.success("حُدّثت حالة الطلب");
      utils.admin.orders.invalidate();
      utils.admin.stats.invalidate();
    },
    onError: e => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setFilter(undefined)} className={cn("border px-4 py-2 text-sm", !filter ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary")}>
          الكل
        </button>
        {ORDER_STATUSES.map(s => (
          <button key={s} type="button" onClick={() => setFilter(s)} className={cn("border px-4 py-2 text-sm", filter === s ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary")}>
            {ORDER_STATUS_META[s].label}
          </button>
        ))}
      </div>

      {orders.isLoading ? (
        <PageLoader />
      ) : orders.error ? (
        <ErrorState onRetry={() => orders.refetch()} />
      ) : orders.data?.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">لا توجد طلبات في هذه الحالة.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {orders.data?.map(o => {
            const open = openId === o.id;
            return (
              <li key={o.id} className="border bg-card">
                <div className="grid grid-cols-2 items-center gap-4 p-5 text-sm md:grid-cols-6">
                  <button type="button" onClick={() => setOpenId(open ? null : o.id)} className="flex items-center gap-2 text-right">
                    <ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} />
                    <span className="font-latin tracking-wider text-primary">{o.orderNumber}</span>
                  </button>
                  <span>{o.fullName}</span>
                  <span className="text-muted-foreground">{formatDate(o.createdAt)}</span>
                  <span>{formatPrice(o.total)}</span>
                  <StatusBadge status={o.status} />
                  <select
                    value={o.status}
                    disabled={updateStatus.isPending}
                    onChange={e => updateStatus.mutate({ id: o.id, status: e.target.value as OrderStatus })}
                    className="h-9 border bg-background px-2 text-sm"
                    aria-label="تغيير الحالة"
                  >
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{ORDER_STATUS_META[s].label}</option>)}
                  </select>
                </div>
                {open && (
                  <div className="grid gap-8 border-t p-5 text-sm md:grid-cols-2">
                    <ul className="space-y-3">
                      {o.items.map(i => (
                        <li key={i.id} className="flex items-center gap-3">
                          {i.image && <img src={i.image} alt="" className="size-12 object-cover" />}
                          <span className="flex-1">{i.name}{i.color ? ` · ${i.color}` : ""} × {i.quantity}</span>
                          <span>{formatPrice(i.price * i.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="space-y-2 leading-relaxed">
                      <p><span className="text-muted-foreground">الجوال: </span><span dir="ltr">{o.phone}</span></p>
                      {o.customerEmail && <p><span className="text-muted-foreground">البريد: </span>{o.customerEmail}</p>}
                      <p><span className="text-muted-foreground">العنوان: </span>{o.city} — {o.address}</p>
                      {o.notes && <p><span className="text-muted-foreground">ملاحظات: </span>{o.notes}</p>}
                      <p><span className="text-muted-foreground">الدفع: </span>عند الاستلام</p>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
