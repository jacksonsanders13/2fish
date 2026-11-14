import { cn } from "@/lib/utils";
import { LOGO_PATH, LOGO_VIEWBOX } from "./logo-path";

// Jackson's mark: two fish whose bodies link into a 2. One color, so it takes
// whatever `color` is set on the parent (navy on white, white on navy).
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

export function Logo({ className, size = 22 }: { className?: string; size?: number }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <LogoMark size={size} />
      <span className="text-[1.05rem] leading-none">2fish</span>
      <span className="sr-only">home</span>
    </span>
  );
}
