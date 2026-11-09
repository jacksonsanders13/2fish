import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// The type scale. Mobile size first, larger from md up.
// Pick the level for how important it looks; pick `as` for the outline.
export const headingVariants = cva("m-0 font-black text-balance", {
  variants: {
    level: {
      hero: "text-4xl leading-none tracking-tight md:text-6xl",
      page: "text-3xl leading-tight tracking-tight md:text-4xl",
      section: "text-xl leading-tight md:text-2xl",
      card: "text-lg leading-tight md:text-xl",
    },
  },
  defaultVariants: { level: "section" },
});

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants> & { as?: "h1" | "h2" | "h3" | "p" };

export function Heading({ as: Tag = "h2", level, className, ...props }: HeadingProps) {
  return <Tag className={cn(headingVariants({ level }), className)} {...props} />;
}

export const textVariants = cva("m-0", {
  variants: {
    variant: {
      // intro paragraph under a page or hero heading
      lead: "text-base md:text-lg",
      body: "text-base",
      // secondary info: places, times, hints
      meta: "text-sm text-muted-foreground",
      // small all-caps label above a heading
      eyebrow: "text-sm font-extrabold uppercase tracking-widest",
      // tiny labels under numbers
      micro: "text-xs font-bold uppercase tracking-wide text-muted-foreground",
    },
    tone: {
      default: "",
      muted: "text-muted-foreground",
      // on the blue hero: slightly softer than the heading
      soft: "opacity-90",
    },
  },
  defaultVariants: { variant: "body", tone: "default" },
});

type TextProps = React.HTMLAttributes<HTMLElement> & VariantProps<typeof textVariants> & { as?: "p" | "span" | "div" };

export function Text({ as: Tag = "p", variant, tone, className, ...props }: TextProps) {
  return <Tag className={cn(textVariants({ variant, tone }), className)} {...props} />;
}
