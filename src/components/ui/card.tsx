import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { headingVariants } from "./typography";

// Posts themselves are not cards (they're rows in the feed). Cards are for
// side widgets, forms and empty states.
export const cardVariants = cva("rounded-lg", {
  variants: {
    variant: {
      default: "border border-border bg-surface",
      // soft grey panel with no border: sidebar widgets
      flat: "bg-muted",
      // empty states, quiet info blocks
      muted: "border border-dashed border-border bg-transparent",
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
