import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { CATEGORY_META, CATEGORY_ORDER, COLOR_SWATCHES } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import type { Category, Product } from "../../../../drizzle/schema";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

const COLOR_OPTIONS = Object.keys(COLOR_SWATCHES);

type FormState = {
  name: string;
  slug: string;
  collection: string;
  category: Category;
  price: string;
  compareAtPrice: string;
  shortDescription: string;
  description: string;
  metal: string;
  karat: string;
  stones: string;
  weight: string;
  colors: string[];
  images: string[];
  featured: boolean;
  stock: string;
  active: boolean;
};

function fromProduct(p: Product | null): FormState {
  return {
    name: p?.name ?? "",
    slug: p?.slug ?? "",
    collection: p?.collection ?? "",
    category: p?.category ?? "ring",
    price: p ? String(p.price) : "",
    compareAtPrice: p?.compareAtPrice ? String(p.compareAtPrice) : "",
    shortDescription: p?.shortDescription ?? "",
    description: p?.description ?? "",
    metal: p?.metal ?? "ذهب أصفر",
    karat: p?.karat ?? "18 قيراط",
    stones: p?.stones ?? "",
    weight: p?.weight ?? "",
    colors: p?.colors ?? ["ذهبي"],
    images: p?.images ?? [],
    featured: p?.featured ?? false,
    stock: p ? String(p.stock) : "10",
    active: p?.active ?? true,
  };
}

const readAsBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export function ProductForm({ product, onClose, onSaved }: { product: Product | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<FormState>(() => fromProduct(product));
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = trpc.admin.uploadImage.useMutation();
  const create = trpc.admin.createProduct.useMutation();
  const update = trpc.admin.updateProduct.useMutation();
  const saving = create.isPending || update.isPending;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm(f => ({ ...f, [k]: v }));

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files).slice(0, 8 - form.images.length)) {
        if (file.size > 8 * 1024 * 1024) {
          toast.error(`${file.name}: الحجم يتجاوز 8 ميغابايت`);
          continue;
        }
        const base64 = await readAsBase64(file);
        const { url } = await upload.mutateAsync({ fileName: file.name, contentType: file.type, base64 });
        setForm(f => ({ ...f, images: [...f.images, url] }));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "تعذّر رفع الصورة");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const price = Number(form.price);
    if (!form.name.trim() || !form.slug.trim() || !price) return toast.error("يرجى تعبئة الاسم والمعرّف والسعر");
    if (!/^[a-z0-9-]+$/.test(form.slug)) return toast.error("المعرّف يقبل أحرفاً إنجليزية صغيرة وأرقاماً وشرطات فقط");
    if (form.images.length === 0) return toast.error("أضيفي صورة واحدة على الأقل");
    if (!form.shortDescription.trim() || !form.description.trim() || !form.stones.trim()) return toast.error("يرجى تعبئة الوصف والأحجار");

    const payload = {
      name: form.name,
      slug: form.slug,
      collection: form.collection || null,
      category: form.category,
      price: Math.round(price),
      compareAtPrice: form.compareAtPrice ? Math.round(Number(form.compareAtPrice)) : null,
      shortDescription: form.shortDescription,
      description: form.description,
      metal: form.metal,
      karat: form.karat,
      stones: form.stones,
      weight: form.weight || null,
      colors: form.colors,
      images: form.images,
      featured: form.featured,
      stock: Math.max(0, Math.round(Number(form.stock) || 0)),
      active: form.active,
    };
    try {
      if (product) await update.mutateAsync({ id: product.id, ...payload });
      else await create.mutateAsync(payload);
      toast.success(product ? "حُفظت التعديلات" : "أُضيفت القطعة إلى الكتالوج");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذّر الحفظ");
    }
  };

  const input = "h-11 w-full border bg-background px-3 outline-none focus:border-primary";
  const label = "mb-1.5 block text-sm text-muted-foreground";

  return (
    <Dialog open onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto rounded-none sm:max-w-3xl">
        <DialogTitle className="text-2xl font-normal">{product ? `تعديل «${product.name}»` : "قطعة جديدة"}</DialogTitle>
        <form onSubmit={submit} className="mt-4 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <span className={label}>الصور (الأولى هي الرئيسية)</span>
            <div className="flex flex-wrap gap-3">
              {form.images.map((img, i) => (
                <div key={img + i} className={cn("relative size-24 border", i === 0 && "ring-2 ring-primary")}>
                  <img src={img} alt="" className="size-full object-cover" />
                  <button type="button" aria-label="إزالة الصورة" onClick={() => set("images", form.images.filter((_, j) => j !== i))} className="absolute -top-2 -left-2 grid size-6 place-items-center rounded-full bg-foreground text-background">
                    <X className="size-3" />
                  </button>
                  {i !== 0 && (
                    <button type="button" onClick={() => set("images", [img, ...form.images.filter((_, j) => j !== i)])} className="absolute inset-x-0 bottom-0 bg-background/85 py-0.5 text-[0.65rem]">
                      اجعليها رئيسية
                    </button>
                  )}
                </div>
              ))}
              {form.images.length < 8 && (
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="grid size-24 place-items-center border border-dashed text-muted-foreground hover:border-primary hover:text-primary">
                  {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={e => onFiles(e.target.files)} />
            </div>
          </div>

          <label className="block">
            <span className={label}>اسم القطعة</span>
            <input value={form.name} onChange={e => set("name", e.target.value)} className={input} />
          </label>
          <label className="block">
            <span className={label}>المعرّف في الرابط (إنجليزي)</span>
            <input value={form.slug} onChange={e => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))} className={input} dir="ltr" placeholder="pearl-ring" />
          </label>
          <label className="block">
            <span className={label}>التصنيف</span>
            <select value={form.category} onChange={e => set("category", e.target.value as Category)} className={input}>
              {CATEGORY_ORDER.map(c => <option key={c} value={c}>{CATEGORY_META[c].label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className={label}>المجموعة (اختياري)</span>
            <input value={form.collection} onChange={e => set("collection", e.target.value)} className={input} />
          </label>
          <label className="block">
            <span className={label}>السعر (ر.س)</span>
            <input value={form.price} onChange={e => set("price", e.target.value.replace(/[^0-9]/g, ""))} className={input} dir="ltr" inputMode="numeric" />
          </label>
          <label className="block">
            <span className={label}>السعر قبل الخصم (اختياري)</span>
            <input value={form.compareAtPrice} onChange={e => set("compareAtPrice", e.target.value.replace(/[^0-9]/g, ""))} className={input} dir="ltr" inputMode="numeric" />
          </label>
          <label className="block">
            <span className={label}>المعدن</span>
            <input value={form.metal} onChange={e => set("metal", e.target.value)} className={input} />
          </label>
          <label className="block">
            <span className={label}>العيار</span>
            <input value={form.karat} onChange={e => set("karat", e.target.value)} className={input} />
          </label>
          <label className="block">
            <span className={label}>الأحجار</span>
            <input value={form.stones} onChange={e => set("stones", e.target.value)} className={input} />
          </label>
          <label className="block">
            <span className={label}>الوزن (اختياري)</span>
            <input value={form.weight} onChange={e => set("weight", e.target.value)} className={input} />
          </label>
          <label className="block sm:col-span-2">
            <span className={label}>وصف مختصر</span>
            <input value={form.shortDescription} onChange={e => set("shortDescription", e.target.value)} className={input} maxLength={300} />
          </label>
          <label className="block sm:col-span-2">
            <span className={label}>الوصف الكامل</span>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={4} className={`${input} h-auto py-2`} />
          </label>

          <div className="sm:col-span-2">
            <span className={label}>الألوان المتاحة</span>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(c => {
                const on = form.colors.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set("colors", on ? form.colors.filter(x => x !== c) : [...form.colors, c])}
                    className={cn("flex items-center gap-2 border px-3 py-1.5 text-sm", on ? "border-primary text-primary" : "text-muted-foreground")}
                  >
                    <span className="size-4 rounded-full" style={{ background: COLOR_SWATCHES[c] }} />
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className={label}>الكمية في المخزون</span>
            <input value={form.stock} onChange={e => set("stock", e.target.value.replace(/[^0-9]/g, ""))} className={input} dir="ltr" inputMode="numeric" />
          </label>
          <div className="flex items-end gap-8 pb-2">
            <label className="flex items-center gap-3 text-sm">
              <Switch checked={form.active} onCheckedChange={v => set("active", v)} /> معروضة في المتجر
            </label>
            <label className="flex items-center gap-3 text-sm">
              <Switch checked={form.featured} onCheckedChange={v => set("featured", v)} /> ضمن المختارات
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t pt-5 sm:col-span-2">
            <button type="button" onClick={onClose} className="btn-ghost-sea py-3">إلغاء</button>
            <button type="submit" disabled={saving || uploading} className="btn-sea py-3">
              {saving ? "جارٍ الحفظ…" : product ? "حفظ التعديلات" : "إضافة القطعة"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
