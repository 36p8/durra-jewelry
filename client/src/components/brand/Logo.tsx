import { cn } from "@/lib/utils";

/** The DURRA mark: a pearl cradled by the stroke of the letter «د». */
export function DurraMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("size-9", className)} aria-hidden="true">
      <defs>
        <radialGradient id="durra-pearl" cx="0.36" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#efe8dc" />
          <stop offset="1" stopColor="#c4b69e" />
        </radialGradient>
      </defs>
      <path
        d="M46 20c3.4 4.4 4.6 9.4 3.4 14.4C47.4 43 39.8 48.6 31.4 48.6c-6.8 0-12.6-3.4-15.8-8.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="33" cy="28.5" r="9" fill="url(#durra-pearl)" stroke="currentColor" strokeOpacity="0.25" />
    </svg>
  );
}

export function DurraLogo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-3 text-primary", className)}>
      <DurraMark />
      <span className="flex flex-col leading-none">
        <span className="text-2xl font-extrabold tracking-tight text-foreground">دُرّة</span>
        {!compact && (
          <span className="font-latin mt-1 text-[0.7rem] tracking-[0.45em] text-muted-foreground">DURRA</span>
        )}
      </span>
    </span>
  );
}
