import { cva, type VariantProps } from "class-variance-authority";
import { LOGO_PATHS, LOGO_TRANSFORM, LOGO_VIEWBOX } from "./logo-paths";

// The 2fish mark. It's one color, taken from the text color the tone sets.
const logoVariants = cva("fill-current", {
  variants: {
    tone: {
      brand: "text-primary",
      ink: "text-foreground",
      muted: "text-muted-foreground/40",
    },
    motion: { still: "", float: "animate-float" },
  },
  defaultVariants: { tone: "brand", motion: "still" },
});

// `size` is the height in px; the mark is a little wider than tall.
export default function Logo({ size = 32, tone, motion }: { size?: number } & VariantProps<typeof logoVariants>) {
  return (
    <svg height={size} width={Math.round(size * 1.27)} viewBox={LOGO_VIEWBOX} className={logoVariants({ tone, motion })} aria-hidden="true">
      <g transform={LOGO_TRANSFORM}>
        {LOGO_PATHS.map((d) => (
          <path key={d.slice(0, 24)} d={d} />
        ))}
      </g>
    </svg>
  );
}

// Mark + "2fish" wordmark.
export function Wordmark({ size = 32 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Logo size={size} />
      <b className="font-display text-2xl font-extrabold tracking-tight">2fish</b>
    </span>
  );
}
