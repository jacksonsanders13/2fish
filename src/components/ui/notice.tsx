import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const noticeVariants = cva("rounded-md border px-4 py-3 text-sm", {
  variants: {
    variant: {
      info: "border-primary/20 bg-primary-soft text-foreground",
      warning: "border-accent/60 bg-accent-soft text-foreground",
      success: "border-success/30 bg-success-soft text-foreground",
      danger: "border-destructive/30 bg-destructive-soft font-bold text-destructive-soft-foreground animate-fade-in",
    },
  },
  defaultVariants: { variant: "info" },
});

type NoticeProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof noticeVariants>;

export function Notice({ className, variant, ...props }: NoticeProps) {
  return <div className={cn(noticeVariants({ variant }), className)} {...props} />;
}
