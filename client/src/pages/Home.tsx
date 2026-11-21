import { Reveal } from "@/components/brand/Reveal";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ProductCard, ProductCardSkeleton } from "@/components/store/ProductCard";
import { CATEGORY_META, CATEGORY_ORDER, IMAGES, toArabicIndex } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { ArrowLeft, Gem, ShieldCheck, Truck } from "lucide-react";
import { Link } from "wouter";

const PROMISES = ["ذهب عيار 18", "لؤلؤ طبيعي منتقى", "صياغة يدوية", "شهادة أصالة لكل قطعة", "تغليف هدايا فاخر"];

export default function Home() {
  const featured = trpc.products.list.useQuery({ featuredOnly: true, limit: 6 });

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container grid items-end gap-10 pt-10 pb-16 lg:grid-cols-12 lg:pt-16 lg:pb-24">
          <div className="relative z-10 lg:col-span-5 lg:pb-16">
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="eyebrow">
              مجموعة الهيرات · ٢٠٢٦
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}
              className="mt-8 text-5xl leading-[1.15] font-light md:text-7xl"
            >
              حرفيةٌ إيطالية الروح
              <br />
              <span className="font-extrabold text-primary">بلمسةٍ عربية</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.2 }}
              className="mt-8 max-w-md text-lg leading-loose text-muted-foreground"
            >
              كل لؤلؤة تحمل صبر البحر وحكاية غوّاص. نصوغها على ذهب عيار 18 بتصاميم هادئة تليق بأنوثتكِ في كل يوم.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.45 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link href="/collections" className="btn-sea">
                اكتشفي المجموعة <ArrowLeft className="size-4" />
              </Link>
              <Link href="/about" className="btn-ghost-sea">
                حكاية الدار
              </Link>
            </motion.div>
          </div>

          <div className="relative lg:col-span-7">
            <motion.div
              initial={{ clipPath: "inset(0 0 100% 0)" }}
              animate={{ clipPath: "inset(0 0 0% 0)" }}
              transition={{ duration: 1.6, ease: [0.7, 0, 0.2, 1] }}
              className="relative aspect-[4/3] overflow-hidden lg:aspect-[16/12] lg:-ml-[6vw]"
            >
              <img src={IMAGES.hero} alt="عقد لؤلؤ طبيعي على رمال الشاطئ" className="size-full object-cover" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 1 }}
              className="pearl absolute -bottom-6 right-8 size-16 rounded-full md:size-24"
            />
            <span className="vertical-latin absolute top-0 -right-8 hidden xl:block">Pearls of the Gulf</span>
          </div>
        </div>

        {/* Promise strip */}
        <div className="overflow-hidden border-y bg-card py-5">
          <motion.div
            className="flex w-max gap-14 whitespace-nowrap text-sm text-muted-foreground"
            animate={{ x: ["0%", "50%"] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            {[...PROMISES, ...PROMISES, ...PROMISES, ...PROMISES].map((p, i) => (
              <span key={i} className="flex items-center gap-14">
                {p}
                <span className="pearl inline-block size-2 rounded-full" />
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories — staggered editorial grid */}
      <section className="container py-24 lg:py-32">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <span className="eyebrow">التصنيفات</span>
            <h2 className="mt-6 text-4xl font-light md:text-5xl">أربع طرق لارتداء البحر</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Link href="/collections" className="link-underline inline-flex items-center gap-2 text-primary">
              عرض كل القطع <ArrowLeft className="size-4" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4 lg:gap-x-8">
          {CATEGORY_ORDER.map((cat, i) => (
            <Reveal key={cat} delay={i * 0.08} className={i % 2 === 1 ? "lg:mt-24" : ""}>
              <Link href={`/collections?category=${cat}`} className="group block">
                <div className="img-zoom relative aspect-[4/5] overflow-hidden">
                  <img src={CATEGORY_META[cat].image} alt={CATEGORY_META[cat].label} loading="lazy" className="size-full object-cover" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                  <span className="font-latin absolute bottom-4 left-4 text-4xl text-white/90">{toArabicIndex(i + 1)}</span>
                </div>
                <div className="mt-5 flex items-baseline justify-between">
                  <h3 className="text-2xl">{CATEGORY_META[cat].label}</h3>
                  <span className="font-latin text-sm tracking-[0.3em] text-muted-foreground uppercase">{CATEGORY_META[cat].latin}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="bg-card py-24 lg:py-32">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <span className="eyebrow">مختارات الدار</span>
              <h2 className="mt-6 text-4xl leading-tight font-light md:text-5xl">قطع تتحدّث بهدوء</h2>
              <p className="mt-6 max-w-sm leading-loose text-muted-foreground">
                اختارتها مصمّمتنا من بين مجموعات الموسم: قطع يومية بروح احتفالية، وأخرى تُحفظ لأجمل اللحظات.
              </p>
              <Link href="/collections" className="btn-ghost-sea mt-10">
                تسوّقي المختارات
              </Link>
            </Reveal>
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:col-span-8">
              {featured.isLoading
                ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : featured.data?.map((p, i) => (
                    <Reveal key={p.id} delay={(i % 3) * 0.08}>
                      <ProductCard product={p} />
                    </Reveal>
                  ))}
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="container py-24 lg:py-36">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          <Reveal className="relative lg:col-span-6">
            <div className="aspect-[4/5] overflow-hidden lg:w-4/5">
              <img src={IMAGES.atelier} alt="يدا صائغ تثبّت لؤلؤة في خاتم" loading="lazy" className="size-full object-cover" />
            </div>
            <div className="absolute -bottom-10 left-0 hidden w-2/5 border-8 border-background lg:block">
              <img src={IMAGES.model} alt="" loading="lazy" className="aspect-[3/4] w-full object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.15} className="lg:col-span-5 lg:col-start-8">
            <span className="eyebrow">حكاية الدار</span>
            <h2 className="mt-6 text-4xl leading-tight font-light md:text-5xl">
              اسمنا <span className="font-extrabold text-primary">دُرّة</span>،
              <br />
              أي اللؤلؤة الكبيرة الصافية
            </h2>
            <p className="mt-8 text-lg leading-loose text-muted-foreground">
              بدأت دُرّة من ورشة صغيرة تؤمن بأن القطعة الثمينة لا تحتاج إلى صخب. نختار اللؤلؤ حبّة حبّة، ونصوغ الذهب بأيدٍ تعلّمت الصبر، لنقدّم مجوهرات تُرتدى اليوم وتُورَّث غداً.
            </p>
            <dl className="mt-12 grid grid-cols-3 gap-6 border-t pt-8">
              <div>
                <dt className="text-sm text-muted-foreground">سنوات من الحِرفة</dt>
                <dd className="font-latin mt-2 text-4xl text-primary">12</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">ساعة لكل قطعة</dt>
                <dd className="font-latin mt-2 text-4xl text-primary">40+</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">عيار الذهب</dt>
                <dd className="font-latin mt-2 text-4xl text-primary">18K</dd>
              </div>
            </dl>
            <Link href="/about" className="link-underline mt-10 inline-flex items-center gap-2 text-primary">
              اقرئي القصة كاملة <ArrowLeft className="size-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Promises */}
      <section className="container">
        <div className="grid gap-px overflow-hidden border bg-border md:grid-cols-3">
          {[
            { icon: Gem, title: "أصالة موثّقة", text: "شهادة لكل قطعة توضح المعدن والعيار ومواصفات الأحجار." },
            { icon: Truck, title: "توصيل مؤمَّن ومجاني", text: "نوصل طلبك إلى باب منزلك في جميع مدن المملكة خلال 3–5 أيام." },
            { icon: ShieldCheck, title: "عناية مدى الحياة", text: "تنظيف وتلميع مجاني وإعادة شدّ لعقود اللؤلؤ في أي وقت." },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08} className="bg-background p-10">
              <item.icon className="size-6 text-primary" strokeWidth={1.4} />
              <h3 className="mt-6 text-xl">{item.title}</h3>
              <p className="mt-3 leading-loose text-muted-foreground">{item.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Sea banner */}
      <section className="container mt-24 lg:mt-32">
        <div className="relative overflow-hidden">
          <img src={IMAGES.sea} alt="" loading="lazy" className="h-[420px] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-black/55 via-black/20 to-transparent" />
          <Reveal className="absolute inset-y-0 right-0 flex max-w-xl flex-col justify-center p-10 text-white md:p-16">
            <h2 className="text-4xl leading-tight font-light md:text-5xl">هديةٌ تُحفظ في الذاكرة</h2>
            <p className="mt-5 leading-loose text-white/85">نغلّف كل طلب في صندوق من الصدف مع بطاقة بخط اليد، ونساعدكِ في اختيار القطعة المناسبة.</p>
            <Link href="/contact" className="mt-8 inline-flex w-fit items-center gap-2 border border-white/60 px-7 py-3.5 text-sm transition hover:bg-white hover:text-[#0f4c4a]">
              استشارة خاصة <ArrowLeft className="size-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
