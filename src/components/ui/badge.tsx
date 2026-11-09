import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva("inline-flex items-center gap-1 whitespace-nowrap rounded-full font-bold [&_svg]:size-3.5 [&_svg]:shrink-0", {
  variants: {
    variant: {
      open: "bg-primary-soft text-primary-soft-foreground",
      pledged: "bg-accent-soft text-accent-soft-foreground",
      done: "bg-success-soft text-success-soft-foreground",
      // marks the demo posts
      example: "rounded-sm border border-dashed border-input text-muted-foreground",
      // "By Fri, Nov 14" on a category band
      due: "bg-muted text-muted-foreground",
      // needed today / tomorrow: the one place we pulse
      urgent: "bg-accent text-accent-foreground attention-glow",
      // small facts: "Drop off: Library", "Wishlist"
      tag: "bg-transparent px-0 font-semibold text-muted-foreground",
    },
    size: {
      sm: "px-2 py-0.5 text-xs",
      md: "px-3 py-1 text-sm",
    },
  },
  // plain tags sit flush with the text around them at any size
  compoundVariants: [{ variant: "tag", className: "px-0" }],
  defaultVariants: { variant: "tag", size: "sm" },
});

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
