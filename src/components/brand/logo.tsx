import { cn } from "@/lib/utils";

/*
  The mark: two fish swimming in a loop, one chasing the other.
  Each fish is a thick arc for the body, a small fin at the tail
  and a dot for the eye. The second fish is the first rotated 180°.
*/
export function LogoMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <Fish />
      <Fish rotate />
    </svg>
  );
}

function Fish({ rotate = false }: { rotate?: boolean }) {
  return (
    <g transform={rotate ? "rotate(180 16 16)" : undefined}>
      {/* body */}
      <path d="M7 17.5 A10 10 0 0 1 25.5 11.5" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      {/* tail fin */}
      <path d="M7.6 17.6 L2.4 13.2 L4.6 18.6 L3.4 23.6 Z" fill="currentColor" />
      {/* eye */}
      <circle cx="22.4" cy="11.9" r="1.25" fill="var(--background)" />
    </g>
  );
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <LogoMark className={cn("text-brand", markClassName)} />
      <span className="text-[1.05rem] leading-none">2fish</span>
    </span>
  );
}
