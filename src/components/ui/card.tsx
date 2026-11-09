import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { headingVariants } from "./typography";

export const cardVariants = cva("rounded-lg border", {
  variants: {
    variant: {
      default: "border-border bg-surface shadow-card",
      // need cards in a list: lift on hover, fade in on load
      interactive: "overflow-hidden border-border bg-surface shadow-card hover-lift animate-fade-in-up stagger",
      // the big welcome banner
      hero: "relative overflow-hidden rounded-xl border-transparent bg-gradient-primary text-brand-surface-foreground shadow-lift on-primary",
      // empty states, quiet info blocks
      muted: "border-dashed border-border bg-transparent",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-4 md:p-6",
      lg: "p-6 md:p-8",
    },
  },
  defaultVariants: { variant: "default", padding: "md" },
});

type CardProps = React.HTMLAttributes<HTMLElement> & { noValidate?: boolean } &
  VariantProps<typeof cardVariants> & { as?: "div" | "section" | "article" | "aside" | "form" };

export function Card({ as: Tag = "div", className, variant, padding, ...props }: CardProps) {
  return <Tag className={cn(cardVariants({ variant, padding }), className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn(headingVariants({ level: "card" }), className)} {...props} />;
}
