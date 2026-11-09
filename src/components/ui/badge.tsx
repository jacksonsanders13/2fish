import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva("inline-flex items-center gap-1 whitespace-nowrap rounded-full font-extrabold", {
  variants: {
    variant: {
      open: "bg-primary-soft text-primary-soft-foreground",
      pledged: "bg-accent-soft text-accent-soft-foreground",
      done: "bg-success-soft text-success-soft-foreground",
      // marks the demo posts
      example: "rounded-sm border border-dashed border-input text-muted-foreground",
      // "By Fri, Nov 14" on a category band
      due: "bg-overlay/25 text-on-color",
      // needed today / tomorrow: the one place we pulse
      urgent: "bg-accent text-accent-foreground attention-glow",
      // small facts: "Drop off: Library", "Wishlist"
      tag: "rounded-sm bg-muted font-semibold text-muted-foreground",
    },
    size: {
      sm: "px-2 py-0.5 text-xs",
      md: "px-3 py-1 text-sm",
    },
  },
  defaultVariants: { variant: "tag", size: "sm" },
});

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
