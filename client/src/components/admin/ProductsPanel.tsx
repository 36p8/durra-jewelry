import { ErrorState, PageLoader } from "@/components/store/States";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CATEGORY_META, formatPrice } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import type { Product } from "../../../../drizzle/schema";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ProductForm } from "./ProductForm";

export function ProductsPanel() {
  const list = trpc.admin.products.useQuery();
  const utils = trpc.useUtils();
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const refresh = () => {
    utils.admin.products.invalidate();
    utils.admin.stats.invalidate();
    utils.products.invalidate();
  };

  const remove = trpc.admin.deleteProduct.useMutation({
    onSuccess: () => {
      toast.success("حُذفت القطعة");
      setDeleting(null);
      refresh();
    },
    onError: e => toast.error(e.message),
  });

  if (list.isLoading) return <PageLoader />;
  if (list.error) return <ErrorState onRetry={() => list.refetch()} />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">{list.data?.length ?? 0} قطعة في الكتالوج</p>
        <button type="button" onClick={() => setEditing("new")} className="btn-sea py-3">
          <Plus className="size-4" /> إضافة قطعة
        </button>
      </div>

      <div className="mt-8 overflow-x-auto border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b text-muted-foreground">
            <tr>
              <th className="p-4 text-right font-normal">القطعة</th>
              <th className="p-4 text-right font-normal">التصنيف</th>
              <th className="p-4 text-right font-normal">السعر</th>
              <th className="p-4 text-right font-normal">المخزون</th>
              <th className="p-4 text-right font-normal">الحالة</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {list.data?.map(p => (
              <tr key={p.id} className="hover:bg-accent/40">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={p.images[0]} alt="" className="size-12 object-cover" />
                    <div>
                      <p>{p.name}</p>
                      <p className="font-latin text-xs text-muted-foreground">{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">{CATEGORY_META[p.category].label}</td>
                <td className="p-4">{formatPrice(p.price)}</td>
                <td className={`p-4 ${p.stock <= 3 ? "text-destructive" : ""}`}>{p.stock}</td>
                <td className="p-4">
                  <span className={`rounded-full px-3 py-1 text-xs ${p.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {p.active ? "معروضة" : "مخفية"}
                  </span>
                  {p.featured && <span className="mr-2 text-xs text-muted-foreground">· مختارة</span>}
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-1">
                    <button type="button" onClick={() => setEditing(p)} aria-label="تعديل" className="grid size-9 place-items-center hover:bg-accent hover:text-primary">
                      <Pencil className="size-4" />
                    </button>
                    <button type="button" onClick={() => setDeleting(p)} aria-label="حذف" className="grid size-9 place-items-center hover:bg-accent hover:text-destructive">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductForm
          product={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refresh();
          }}
        />
      )}

      <AlertDialog open={Boolean(deleting)} onOpenChange={o => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف «{deleting?.name}»؟</AlertDialogTitle>
            <AlertDialogDescription>
              ستُحذف القطعة من الكتالوج ومن حقائب العملاء ومفضلتهم. تبقى الطلبات السابقة محفوظة. يمكنكِ بدلاً من ذلك إخفاؤها مؤقتاً من نموذج التعديل.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>تراجع</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleting && remove.mutate({ id: deleting.id })}
            >
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
