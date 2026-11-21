import { DurraMark } from "@/components/brand/Logo";
import { useEffect } from "react";
import { useLocation } from "wouter";

// Hosting answers this path with HTTP 404 while still serving the app.
const NOT_FOUND_PATH = "/404";

// Render for unknown routes and for items the server confirmed missing (e.g. `/page/:id`).
// The redirect is irreversible: never render while loading, on other errors, or before auth resolves.
export default function NotFound() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex";
    document.head.appendChild(robots);

    // Full-page navigation: a client-side route change sends no request, so no 404 status.
    if (window.location.pathname.replace(/\/$/, "") !== NOT_FOUND_PATH) {
      window.location.replace(NOT_FOUND_PATH);
    }

    return () => robots.remove();
  }, []);

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="grid min-h-screen w-full place-items-center bg-background px-6 text-center">
      <div className="max-w-md">
        <DurraMark className="mx-auto size-16 text-primary" />
        <p className="font-latin mt-8 text-7xl text-primary/70">404</p>
        <h1 className="mt-4 text-3xl font-light">ضاعت هذه الصفحة في البحر</h1>
        <p className="mt-4 leading-loose text-muted-foreground">
          ربما نُقلت أو لم تعد موجودة. عودي إلى الرئيسية لمتابعة التصفّح.
        </p>
        <button type="button" onClick={handleGoHome} className="btn-sea mt-10">
          العودة إلى الرئيسية
        </button>
      </div>
    </div>
  );
}
