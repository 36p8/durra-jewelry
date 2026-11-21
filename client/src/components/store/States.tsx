import { DurraMark } from "@/components/brand/Logo";
import { startLogin } from "@/const";

export function LoginGate({ title, message }: { title: string; message: string }) {
  return (
    <section className="container grid min-h-[60vh] place-items-center py-20">
      <div className="max-w-md text-center">
        <DurraMark className="mx-auto size-16 text-primary" />
        <h1 className="mt-8 text-3xl font-light">{title}</h1>
        <p className="mt-4 leading-loose text-muted-foreground">{message}</p>
        <button type="button" onClick={() => startLogin()} className="btn-sea mt-10">
          تسجيل الدخول أو إنشاء حساب
        </button>
      </div>
    </section>
  );
}

export function PageLoader() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <span className="pearl size-6 animate-bounce rounded-full" />
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="container grid min-h-[50vh] place-items-center text-center">
      <div>
        <p className="text-xl">تعذّر تحميل المحتوى.</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn-ghost-sea mt-6">
            إعادة المحاولة
          </button>
        )}
      </div>
    </div>
  );
}
