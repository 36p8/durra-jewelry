import { useAuth } from "@/_core/hooks/useAuth";
import { DurraLogo } from "@/components/brand/Logo";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { startLogin } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Heart, LayoutDashboard, Menu, Moon, ShoppingBag, Sun, User } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";

const NAV = [
  { href: "/", label: "الرئيسية" },
  { href: "/collections", label: "المجموعات" },
  { href: "/gallery", label: "المعرض" },
  { href: "/about", label: "قصة الدار" },
  { href: "/contact", label: "تواصل معنا" },
];

function isActive(location: string, href: string) {
  return href === "/" ? location === "/" : location.startsWith(href);
}

function IconButton({ children, label, ...rest }: { children: ReactNode; label: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      className="relative grid size-10 place-items-center rounded-full text-foreground/80 transition hover:bg-accent hover:text-primary"
      {...rest}
    >
      {children}
    </button>
  );
}

export function SiteHeader() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const cartCount = trpc.cart.count.useQuery(undefined, { enabled: isAuthenticated });
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  const count = cartCount.data ?? 0;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        scrolled ? "border-b bg-background/85 backdrop-blur-md" : "bg-background",
      )}
    >
      <div className="bg-primary py-2 text-center text-xs tracking-wide text-primary-foreground">
        شحن مجاني ومؤمَّن لجميع مدن المملكة · الدفع عند الاستلام
      </div>
      <div className="container flex h-20 items-center justify-between gap-6">
        <div className="flex items-center gap-2 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button type="button" aria-label="القائمة" className="grid size-10 place-items-center">
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background p-8">
              <SheetTitle className="sr-only">القائمة</SheetTitle>
              <DurraLogo />
              <nav className="mt-12 flex flex-col gap-6">
                {NAV.map(item => (
                  <Link key={item.href} href={item.href} className={cn("text-xl", isActive(location, item.href) && "text-primary")}>
                    {item.label}
                  </Link>
                ))}
                <div className="hairline my-2" />
                <Link href="/favorites" className="text-lg">المفضلة</Link>
                <Link href="/account" className="text-lg">حسابي</Link>
                {user?.role === "admin" && <Link href="/admin" className="text-lg text-primary">لوحة التحكم</Link>}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <Link href="/" aria-label="دُرّة — الرئيسية">
          <DurraLogo />
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              data-active={isActive(location, item.href)}
              className={cn("link-underline pb-1 text-[0.95rem]", isActive(location, item.href) ? "text-primary" : "text-foreground/80")}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {toggleTheme && (
            <IconButton label="تبديل الوضع" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="size-[1.15rem]" /> : <Moon className="size-[1.15rem]" />}
            </IconButton>
          )}
          {user?.role === "admin" && (
            <Link href="/admin" aria-label="لوحة التحكم" className="hidden size-10 place-items-center rounded-full text-foreground/80 transition hover:bg-accent hover:text-primary sm:grid">
              <LayoutDashboard className="size-[1.15rem]" />
            </Link>
          )}
          <Link href="/favorites" aria-label="المفضلة" className="hidden size-10 place-items-center rounded-full text-foreground/80 transition hover:bg-accent hover:text-primary sm:grid">
            <Heart className="size-[1.15rem]" />
          </Link>
          {isAuthenticated ? (
            <Link href="/account" aria-label="حسابي" className="grid size-10 place-items-center rounded-full text-foreground/80 transition hover:bg-accent hover:text-primary">
              <User className="size-[1.15rem]" />
            </Link>
          ) : (
            <IconButton label="تسجيل الدخول" onClick={() => startLogin()}>
              <User className="size-[1.15rem]" />
            </IconButton>
          )}
          <Link href="/cart" aria-label="حقيبة التسوق" className="relative grid size-10 place-items-center rounded-full text-foreground/80 transition hover:bg-accent hover:text-primary">
            <ShoppingBag className="size-[1.15rem]" />
            {count > 0 && (
              <span className="absolute -top-0.5 -left-0.5 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[0.65rem] leading-5 text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-32 bg-primary text-primary-foreground dark:bg-card dark:text-foreground">
      <div className="container grid gap-14 py-20 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <DurraLogo className="text-primary-foreground dark:text-primary [&_span]:text-inherit" />
          <p className="mt-8 max-w-md text-lg leading-loose opacity-80">
            دار مجوهرات عربية وُلدت من حكايات الغوص على اللؤلؤ. نصوغ كل قطعة يدوياً لتبقى معكِ وتنتقل من جيل إلى جيل.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 lg:col-span-7 lg:grid-cols-3">
          <div>
            <h4 className="mb-5 text-sm opacity-60">المتجر</h4>
            <ul className="space-y-3">
              <li><Link href="/collections?category=ring" className="link-underline">الخواتم</Link></li>
              <li><Link href="/collections?category=necklace" className="link-underline">العقود</Link></li>
              <li><Link href="/collections?category=bracelet" className="link-underline">الأساور</Link></li>
              <li><Link href="/collections?category=earrings" className="link-underline">الأقراط</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-5 text-sm opacity-60">الدار</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="link-underline">قصة الدار</Link></li>
              <li><Link href="/gallery" className="link-underline">المعرض</Link></li>
              <li><Link href="/contact" className="link-underline">تواصل معنا</Link></li>
              <li><Link href="/account" className="link-underline">حسابي</Link></li>
            </ul>
          </div>
          <div className="col-span-2 lg:col-span-1">
            <h4 className="mb-5 text-sm opacity-60">خدمة العملاء</h4>
            <ul className="space-y-3 opacity-90">
              <li dir="ltr" className="text-right">+966 11 000 0000</li>
              <li>care@durra.sa</li>
              <li>الأحد – الخميس، 10ص – 10م</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-current/15">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-xs opacity-70 sm:flex-row">
          <p>© {new Date().getFullYear()} دُرّة للمجوهرات. جميع الحقوق محفوظة.</p>
          <p className="font-latin tracking-[0.4em]">DURRA · MAISON DE JOAILLERIE</p>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location]);
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageIntro({ overline, title, children, className }: { overline: string; title: string; children?: ReactNode; className?: string }) {
  return (
    <section className={cn("container pt-16 pb-12 lg:pt-24", className)}>
      <span className="eyebrow">{overline}</span>
      <h1 className="mt-6 max-w-3xl text-4xl font-light leading-tight md:text-6xl">{title}</h1>
      {children && <div className="mt-6 max-w-2xl text-lg leading-loose text-muted-foreground">{children}</div>}
    </section>
  );
}
