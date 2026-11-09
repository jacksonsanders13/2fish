import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const inputVariants = cva(
  "w-full rounded-md border border-input bg-surface text-foreground placeholder:text-muted-foreground transition-[border-color,box-shadow] duration-200 ease-smooth focus-visible:border-primary aria-invalid:border-destructive",
  {
    variants: {
      size: {
        sm: "min-h-9 px-3 text-sm",
        md: "min-h-11 px-3 py-2 text-base",
      },
      // short fixed-width fields like ZIP
      width: { full: "", zip: "w-24 tabular-nums" },
      tone: {
        default: "",
        // soft rounded "fake input" that opens the post form
        pill: "flex items-center rounded-full border-transparent bg-muted text-muted-foreground no-underline hover:bg-border",
        // search field inside the primary top bar
        onPrimary:
          "rounded-full border-transparent bg-brand-surface-foreground/15 text-brand-surface-foreground placeholder:text-brand-surface-foreground/80 focus-visible:border-brand-surface-foreground",
      },
      // leaves room for a leading icon
      withIcon: { true: "pl-9", false: "" },
    },
    defaultVariants: { size: "md", width: "full", tone: "default", withIcon: false },
  },
);

type InputVariantProps = VariantProps<typeof inputVariants>;

export function Input({ className, size, width, tone, withIcon, ...props }: Omit<React.ComponentProps<"input">, "size" | "width"> & InputVariantProps) {
  return <input className={cn(inputVariants({ size, width, tone, withIcon }), className)} {...props} />;
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(inputVariants({ size: "md" }), "resize-y", className)} {...props} />;
}

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  return <select className={cn(inputVariants({ size: "md" }), "cursor-pointer", className)} {...props} />;
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-extrabold", className)} {...props} />;
}

// Label + control + optional hint, stacked.
export function Field({ label, id, hint, children }: { label: string; id: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <span className="text-sm text-muted-foreground">{hint}</span>}
    </div>
  );
}

// Checkbox / radio row with a big tap target.
export const choiceVariants = cva("flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors duration-200 ease-smooth", {
  variants: {
    variant: {
      // bordered option card (radio groups)
      card: "border-border hover:border-primary/50 has-[:checked]:border-success has-[:checked]:bg-success-soft",
      // plain row (checkbox list)
      plain: "border-transparent px-0 py-1 font-semibold",
    },
  },
  defaultVariants: { variant: "card" },
});
