import { useAuth } from "@/_core/hooks/useAuth";
import { Reveal } from "@/components/brand/Reveal";
import { PageIntro, SiteLayout } from "@/components/layout/SiteLayout";
import { trpc } from "@/lib/trpc";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

const SUBJECTS = ["استفسار عن قطعة", "طلب تصميم خاص", "متابعة طلب", "العناية والصيانة", "أخرى"];

type Form = { name: string; email: string; phone: string; subject: string; message: string };
const EMPTY: Form = { name: "", email: "", phone: "", subject: SUBJECTS[0], message: "" };

export default function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (user) setForm(f => ({ ...f, name: f.name || user.name || "", email: f.email || user.email || "" }));
  }, [user]);

  const send = trpc.contact.send.useMutation({
    onSuccess: () => {
      setSent(true);
      setForm({ ...EMPTY, name: user?.name ?? "", email: user?.email ?? "" });
    },
    onError: e => toast.error(e.message),
  });

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (form.name.trim().length < 2) next.name = "يرجى كتابة الاسم";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "البريد الإلكتروني غير صحيح";
    if (form.message.trim().length < 10) next.message = "الرسالة قصيرة جداً (10 أحرف على الأقل)";
    setErrors(next);
    if (Object.keys(next).length) return;
    send.mutate({ ...form, phone: form.phone.trim() || undefined });
  };

  const field = "h-12 w-full border-b border-border bg-transparent outline-none transition focus:border-primary";

  return (
    <SiteLayout>
      <PageIntro overline="Contact" title="يسعدنا أن نسمع منكِ">
        للاستفسار عن قطعة، أو طلب تصميم خاص، أو حجز موعد استشارة في صالة العرض.
      </PageIntro>

      <section className="container grid gap-16 lg:grid-cols-12">
        <Reveal className="space-y-10 lg:col-span-4">
          {[
            { icon: MapPin, title: "صالة العرض", text: "طريق الأمير محمد بن عبدالعزيز، حي السليمانية، الرياض" },
            { icon: Phone, title: "الهاتف", text: "+966 11 000 0000", ltr: true },
            { icon: Mail, title: "البريد", text: "care@durra.sa" },
            { icon: Clock, title: "ساعات العمل", text: "الأحد – الخميس، 10 صباحاً – 10 مساءً" },
          ].map(item => (
            <div key={item.title} className="flex gap-5">
              <item.icon className="mt-1 size-5 shrink-0 text-primary" strokeWidth={1.5} />
              <div>
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <p className="mt-1 text-lg" dir={item.ltr ? "ltr" : undefined} style={item.ltr ? { textAlign: "right" } : undefined}>{item.text}</p>
              </div>
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-7 lg:col-start-6">
          {sent ? (
            <div className="bg-card p-12 text-center">
              <span className="pearl mx-auto block size-12 rounded-full" />
              <h2 className="mt-8 text-3xl font-light">وصلتنا رسالتك</h2>
              <p className="mt-4 leading-loose text-muted-foreground">شكراً لتواصلك مع دُرّة. سيردّ عليكِ فريقنا خلال يوم عمل واحد.</p>
              <button type="button" onClick={() => setSent(false)} className="btn-ghost-sea mt-8">إرسال رسالة أخرى</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-8 bg-card p-8 md:grid-cols-2 md:p-12">
              <label className="block">
                <span className="text-sm text-muted-foreground">الاسم</span>
                <input value={form.name} onChange={set("name")} className={field} autoComplete="name" />
                {errors.name && <span className="mt-1 block text-sm text-destructive">{errors.name}</span>}
              </label>
              <label className="block">
                <span className="text-sm text-muted-foreground">البريد الإلكتروني</span>
                <input value={form.email} onChange={set("email")} className={field} dir="ltr" type="email" autoComplete="email" />
                {errors.email && <span className="mt-1 block text-sm text-destructive">{errors.email}</span>}
              </label>
              <label className="block">
                <span className="text-sm text-muted-foreground">الجوال (اختياري)</span>
                <input value={form.phone} onChange={set("phone")} className={field} dir="ltr" inputMode="tel" />
              </label>
              <label className="block">
                <span className="text-sm text-muted-foreground">الموضوع</span>
                <select value={form.subject} onChange={set("subject")} className={`${field} bg-card`}>
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm text-muted-foreground">رسالتك</span>
                <textarea value={form.message} onChange={set("message")} rows={5} className={`${field} h-auto py-3`} />
                {errors.message && <span className="mt-1 block text-sm text-destructive">{errors.message}</span>}
              </label>
              <div className="md:col-span-2">
                <button type="submit" disabled={send.isPending} className="btn-sea">
                  {send.isPending ? "جارٍ الإرسال…" : "إرسال الرسالة"}
                </button>
              </div>
            </form>
          )}
        </Reveal>
      </section>
    </SiteLayout>
  );
}
