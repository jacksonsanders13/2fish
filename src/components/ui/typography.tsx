import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// The type scale. Headings use the display face (Bricolage Grotesque),
// everything else the body face (Figtree). Mobile size first.
export const headingVariants = cva("m-0 font-display font-extrabold text-balance tracking-tight", {
  variants: {
    level: {
      hero: "text-4xl leading-none md:text-5xl",
      page: "text-2xl leading-tight md:text-3xl",
      section: "text-lg leading-tight md:text-xl",
      // a post's title in the feed
      card: "text-lg leading-snug",
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
      lead: "text-base md:text-lg",
      body: "text-base",
      // places, times, hints
      meta: "text-sm text-muted-foreground",
      eyebrow: "text-xs font-bold uppercase tracking-widest",
      // labels under numbers
      micro: "text-xs font-semibold text-muted-foreground",
    },
    tone: {
      default: "",
      muted: "text-muted-foreground",
    },
  },
  defaultVariants: { variant: "body", tone: "default" },
});

type TextProps = React.HTMLAttributes<HTMLElement> & VariantProps<typeof textVariants> & { as?: "p" | "span" | "div" };

export function Text({ as: Tag = "p", variant, tone, className, ...props }: TextProps) {
  return <Tag className={cn(textVariants({ variant, tone }), className)} {...props} />;
}
