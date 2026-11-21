import { useAuth } from "@/_core/hooks/useAuth";
import { PageIntro, SiteLayout } from "@/components/layout/SiteLayout";
import { LoginGate, PageLoader } from "@/components/store/States";
import { CITIES, formatPrice } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import { Banknote } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { useCartTotals } from "./Cart";

type Form = { fullName: string; phone: string; city: string; address: string; notes: string };

export default function Checkout() {
  const { user, isAuthenticated, loading } = useAuth();
  const { cart, items, subtotal, total } = useCartTotals();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [form, setForm] = useState<Form>({ fullName: "", phone: "", city: CITIES[0], address: "", notes: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});

  useEffect(() => {
    if (user?.name) setForm(f => (f.fullName ? f : { ...f, fullName: user.name ?? "" }));
  }, [user?.name]);

  const checkout = trpc.orders.checkout.useMutation({
    onSuccess: res => {
      utils.cart.list.invalidate();
      utils.cart.count.invalidate();
      utils.orders.mine.invalidate();
      navigate(`/order/${res.orderNumber}`);
    },
    onError: e => toast.error(e.message),
  });

  if (loading) return <SiteLayout><PageLoader /></SiteLayout>;
  if (!isAuthenticated)
    return <SiteLayout><LoginGate title="إتمام الطلب" message="سجّلي الدخول لإتمام طلبك ومتابعة حالته من صفحة حسابك." /></SiteLayout>;
  if (cart.isLoading) return <SiteLayout><PageLoader /></SiteLayout>;

  if (items.length === 0)
    return (
      <SiteLayout>
        <section className="container py-32 text-center">
          <p className="text-2xl font-light">لا توجد قطع في حقيبتك لإتمام الطلب.</p>
          <Link href="/collections" className="btn-sea mt-10">تصفّحي المجموعات</Link>
        </section>
      </SiteLayout>
    );

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const next: typeof errors = {};
    if (form.fullName.trim().length < 3) next.fullName = "يرجى كتابة الاسم الكامل";
    if (!/^\+?[0-9\s-]{8,20}$/.test(form.phone.trim())) next.phone = "رقم الجوال غير صحيح، مثال: 0500000000";
    if (form.address.trim().length < 8) next.address = "يرجى كتابة العنوان بالتفصيل (الحي، الشارع، رقم المبنى)";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    checkout.mutate({ ...form, notes: form.notes.trim() || undefined });
  };

  const field = "h-12 w-full border bg-card px-4 outline-none transition focus:border-primary";

  return (
    <SiteLayout>
      <PageIntro overline="Checkout" title="إتمام الطلب" />
      <form onSubmit={submit} className="container grid gap-14 lg:grid-cols-12" noValidate>
        <div className="space-y-10 lg:col-span-7">
          <fieldset>
            <legend className="mb-6 text-xl">عنوان الشحن</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm text-muted-foreground">الاسم الكامل</span>
                <input value={form.fullName} onChange={set("fullName")} className={field} autoComplete="name" />
                {errors.fullName && <span className="mt-1 block text-sm text-destructive">{errors.fullName}</span>}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-muted-foreground">رقم الجوال</span>
                <input value={form.phone} onChange={set("phone")} className={field} dir="ltr" inputMode="tel" placeholder="05xxxxxxxx" autoComplete="tel" />
                {errors.phone && <span className="mt-1 block text-sm text-destructive">{errors.phone}</span>}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-muted-foreground">المدينة</span>
                <select value={form.city} onChange={set("city")} className={field}>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm text-muted-foreground">العنوان التفصيلي</span>
                <textarea value={form.address} onChange={set("address")} rows={3} className={`${field} h-auto py-3`} placeholder="الحي، الشارع، رقم المبنى، الرمز البريدي" />
                {errors.address && <span className="mt-1 block text-sm text-destructive">{errors.address}</span>}
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm text-muted-foreground">ملاحظات (اختياري)</span>
                <textarea value={form.notes} onChange={set("notes")} rows={2} className={`${field} h-auto py-3`} placeholder="مثلاً: تغليف كهدية مع بطاقة باسم…" />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-6 text-xl">طريقة الدفع</legend>
            <label className="flex items-start gap-4 border border-primary bg-card p-6">
              <input type="radio" checked readOnly className="mt-1.5 accent-[var(--primary)]" />
              <span>
                <span className="flex items-center gap-2 text-lg"><Banknote className="size-5 text-primary" /> الدفع عند الاستلام</span>
                <span className="mt-1 block text-sm text-muted-foreground">ادفعي نقداً أو بالبطاقة لمندوب التوصيل بعد معاينة القطعة.</span>
              </span>
            </label>
          </fieldset>
        </div>

        <aside className="lg:col-span-5">
          <div className="bg-card p-8 lg:sticky lg:top-40">
            <h2 className="text-xl">طلبك</h2>
            <ul className="mt-6 space-y-5">
              {items.map(i => (
                <li key={i.id} className="flex items-center gap-4">
                  <div className="relative">
                    <img src={i.product.images[0]} alt="" className="size-16 object-cover" />
                    <span className="absolute -top-2 -left-2 grid size-5 place-items-center rounded-full bg-primary text-[0.65rem] text-primary-foreground">{i.quantity}</span>
                  </div>
                  <div className="flex-1">
                    <p>{i.product.name}</p>
                    {i.color && <p className="text-xs text-muted-foreground">{i.color}</p>}
                  </div>
                  <span className="text-sm">{formatPrice(i.product.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="hairline my-6" />
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">المجموع الفرعي</dt><dd>{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">الشحن</dt><dd className="text-primary">مجاني</dd></div>
              <div className="flex justify-between pt-2 text-lg"><dt>الإجمالي</dt><dd className="text-primary">{formatPrice(total)}</dd></div>
            </dl>
            <button type="submit" disabled={checkout.isPending} className="btn-sea mt-8 w-full">
              {checkout.isPending ? "جارٍ تأكيد الطلب…" : "تأكيد الطلب"}
            </button>
          </div>
        </aside>
      </form>
    </SiteLayout>
  );
}
