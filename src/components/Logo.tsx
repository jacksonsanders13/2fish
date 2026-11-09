import { cva, type VariantProps } from "class-variance-authority";

// Two koi. Same drawing as assets/logo.svg; colors come from tokens.
const logoVariants = cva("", {
  variants: {
    tone: {
      brand: "fill-primary stroke-foreground",
      muted: "fill-muted stroke-muted-foreground",
    },
    motion: { still: "", float: "animate-float" },
  },
  defaultVariants: { tone: "brand", motion: "still" },
});

function Fish({ transform }: { transform: string }) {
  return (
    <g transform={transform} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round">
      <path d="M46 20 L45 7 L68 17 Z" />
      <path d="M48 41 L45 53 L66 43 Z" />
      <path d="M30 30 L11 16 L18 30 L11 44 Z" />
      <path d="M30 30 C42 13 72 10 94 30 C72 50 42 47 30 30 Z" />
      <path d="M74 16 Q67 30 74 44" fill="none" />
      <circle cx="83" cy="28" r="1.6" strokeWidth={3.6} />
    </g>
  );
}

export default function Logo({ size = 32, tone, motion }: { size?: number } & VariantProps<typeof logoVariants>) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={logoVariants({ tone, motion })} aria-hidden="true">
      <Fish transform="translate(9,8) scale(.88)" />
      <Fish transform="translate(111,60) scale(-.88,.88)" />
    </svg>
  );
}

// Logo + "2fish" wordmark.
export function Wordmark({ size = 32 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Logo size={size} />
      <b className="font-display text-2xl font-extrabold tracking-tight">2fish</b>
    </span>
  );
}
