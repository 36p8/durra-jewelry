import { Reveal } from "@/components/brand/Reveal";
import { PageIntro, SiteLayout } from "@/components/layout/SiteLayout";
import { IMAGES } from "@/lib/store";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const VALUES = [
  { n: "01", title: "الصبر", text: "تحتاج اللؤلؤة سنوات لتتكوّن، ونحن نمنح كل قطعة ما تحتاجه من وقت؛ لا إنتاج بالجملة ولا استعجال." },
  { n: "02", title: "الصدق", text: "نذكر المعدن والعيار ومواصفات الأحجار بوضوح، ونرفق مع كل قطعة شهادة أصالة موقّعة." },
  { n: "03", title: "الهدوء", text: "نؤمن بأن الفخامة الحقيقية لا تصرخ. تصاميمنا بسيطة الخطوط، غنية بالتفاصيل لمن يقترب." },
];

export default function About() {
  return (
    <SiteLayout>
      <PageIntro overline="Our Story" title="دار وُلدت من حكايات الغوص على اللؤلؤ">
        في ذاكرة الخليج، كانت الدُّرّة أثمن ما يعود به الغوّاص بعد موسم طويل. من هذا المعنى اخترنا اسمنا، ومنه نصوغ مجوهراتنا اليوم.
      </PageIntro>

      <section className="container grid items-start gap-14 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <img src={IMAGES.model} alt="امرأة ترتدي أقراط وعقد لؤلؤ" className="aspect-[4/5] w-full object-cover lg:aspect-[5/6]" />
        </Reveal>
        <Reveal delay={0.1} className="space-y-8 text-lg leading-loose text-muted-foreground lg:col-span-4 lg:col-start-9 lg:pt-24">
          <p>
            <span className="text-foreground">دُرّة</span> دار مجوهرات سعودية تأسست على فكرة بسيطة: أن تحمل المرأة العربية قطعة تشبهها، أنيقة دون تكلّف، ومتجذّرة في المكان دون أن تكون تقليدية.
          </p>
          <p>
            نعمل مع غوّاصين وتجّار لؤلؤ نعرفهم بالاسم، ونصوغ الذهب عيار 18 في ورشتنا بأيدي حرفيين يرون في كل قطعة توقيعاً شخصياً.
          </p>
          <p>
            نصمّم للمرأة التي تختار بعناية، وتفضّل قطعة واحدة صادقة على عشر قطع عابرة.
          </p>
        </Reveal>
      </section>

      <section className="container mt-32">
        <Reveal>
          <span className="eyebrow">ما نؤمن به</span>
        </Reveal>
        <div className="mt-12 grid gap-12 md:grid-cols-3">
          {VALUES.map((v, i) => (
            <Reveal key={v.n} delay={i * 0.1} className="border-t pt-8">
              <span className="font-latin text-5xl text-primary/70">{v.n}</span>
              <h3 className="mt-6 text-2xl">{v.title}</h3>
              <p className="mt-4 leading-loose text-muted-foreground">{v.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container mt-32 grid items-center gap-14 lg:grid-cols-12">
        <Reveal className="order-2 lg:order-1 lg:col-span-5">
          <span className="eyebrow">الورشة</span>
          <h2 className="mt-6 text-4xl leading-tight font-light">أكثر من أربعين ساعة في كل قطعة</h2>
          <p className="mt-6 text-lg leading-loose text-muted-foreground">
            من الرسم الأول بالقلم، إلى صبّ الذهب، إلى تثبيت اللؤلؤة الأخيرة. كل مرحلة تمرّ بيد حرفي واحد يتابع القطعة حتى تصل إليكِ.
          </p>
          <Link href="/collections" className="btn-sea mt-10">
            اكتشفي المجموعات <ArrowLeft className="size-4" />
          </Link>
        </Reveal>
        <Reveal delay={0.1} className="order-1 lg:order-2 lg:col-span-6 lg:col-start-7">
          <img src={IMAGES.atelier} alt="الورشة" className="aspect-[4/5] w-full object-cover" />
        </Reveal>
      </section>

      <section className="container mt-32">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-3xl leading-relaxed font-light md:text-4xl">
            «القطعة الجميلة لا تُشترى لمناسبة، بل تصنع مناسبتها بنفسها.»
          </p>
          <p className="mt-8 text-sm text-muted-foreground">— مؤسِّسة دار دُرّة</p>
          <Link href="/contact" className="btn-ghost-sea mt-12">تواصلي معنا</Link>
        </Reveal>
      </section>
    </SiteLayout>
  );
}
