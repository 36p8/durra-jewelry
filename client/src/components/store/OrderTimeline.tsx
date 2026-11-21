import { ORDER_STATUS_META, ORDER_STEPS } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "../../../../drizzle/schema";

export function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = ORDER_STATUS_META[status];
  return <span className={cn("inline-block rounded-full px-3 py-1 text-xs", meta.tone)}>{meta.label}</span>;
}

/** A string of pearls: each reached step is a filled pearl. */
export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <p className="text-center text-destructive">
        أُلغي هذا الطلب. للاستفسار تواصلي مع خدمة العملاء.
      </p>
    );
  }
  const current = ORDER_STEPS.indexOf(status);
  return (
    <ol className="relative grid grid-cols-4">
      <span className="absolute top-3 right-[12.5%] left-[12.5%] h-px bg-border" />
      <span
        className="absolute top-3 right-[12.5%] h-px bg-primary transition-all duration-700"
        style={{ width: `${(current / (ORDER_STEPS.length - 1)) * 75}%` }}
      />
      {ORDER_STEPS.map((step, i) => (
        <li key={step} className="relative flex flex-col items-center gap-3 text-center">
          <span className={cn("relative z-10 size-6 rounded-full border", i <= current ? "pearl border-primary/40" : "border-border bg-background")} />
          <span className={cn("text-xs sm:text-sm", i <= current ? "text-foreground" : "text-muted-foreground")}>
            {ORDER_STATUS_META[step].label}
          </span>
        </li>
      ))}
    </ol>
  );
}
