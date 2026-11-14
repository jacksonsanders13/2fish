import { cn } from "@/lib/utils";
import { LOGO_PATH, LOGO_VIEWBOX } from "./logo-path";

// The 2fish mark: two fish whose bodies link into a "2". Single color, so it
// takes whatever `color` is set on it (amber in the header, black in print).
export function LogoMark({ className, size = 28 }: { className?: string; size?: number }) {
  const [, , w, h] = LOGO_VIEWBOX.split(" ").map(Number);
  return (
    <svg
      width={Math.round((size * w) / h)}
      height={size}
      viewBox={LOGO_VIEWBOX}
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <path fill="currentColor" fillRule="evenodd" d={LOGO_PATH} />
    </svg>
  );
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <LogoMark size={24} className={cn("text-brand", markClassName)} />
      <span className="text-[1.05rem] leading-none">2fish</span>
    </span>
  );
}
