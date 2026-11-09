import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Toggle pill used for filters. Selected state comes from aria-pressed,
// so screen readers and styling always agree.
export const chipVariants = cva(
  "inline-flex min-h-9 cursor-pointer items-center whitespace-nowrap rounded-full border px-4 text-sm font-bold transition-colors duration-200 ease-smooth aria-pressed:border-primary aria-pressed:bg-primary-soft aria-pressed:text-primary-soft-foreground",
  {
    variants: {
      variant: {
        default: "border-border bg-surface text-muted-foreground hover:border-primary/50 hover:text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

type ChipProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-pressed"> &
  VariantProps<typeof chipVariants> & { selected: boolean };

export function Chip({ className, variant, selected, ...props }: ChipProps) {
  return <button type="button" aria-pressed={selected} className={cn(chipVariants({ variant }), className)} {...props} />;
}
