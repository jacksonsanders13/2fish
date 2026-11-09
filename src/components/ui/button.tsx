import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Use <Button> for buttons. For links that look like buttons, use
// className={buttonVariants({ ... })} on <Link> or <a>.
export const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border font-extrabold no-underline transition-[transform,background-color,box-shadow,border-color] duration-200 ease-smooth active:scale-[.98] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // main brand action
        primary: "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-glow",
        // the giving action: I'll help, Count me in, Post my need, I got it
        help: "border-success bg-success text-success-foreground hover:bg-success/90 hover:shadow-glow-success",
        // the one big call to action on a page
        hero: "border-transparent bg-gradient-primary text-brand-surface-foreground shadow-card hover:scale-[1.03] hover:shadow-glow",
        // white button sitting on a primary/gradient surface
        inverse: "border-transparent bg-brand-surface-foreground text-brand-surface hover:bg-brand-surface-foreground/90 hover:shadow-lift",
        // quiet neutral: Cancel, Remove post
        // see-through button on a primary/gradient surface
        onPrimary: "border-brand-surface-foreground/40 bg-transparent text-brand-surface-foreground hover:bg-brand-surface-foreground/10",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-border",
        outline: "border-border bg-surface text-foreground hover:border-primary hover:text-primary-soft-foreground",
        ghost: "border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
        destructive: "border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // dev/testing-only controls, deliberately low-key
        dev: "border-dashed border-input bg-transparent font-bold text-muted-foreground hover:bg-muted",
      },
      size: {
        sm: "min-h-9 px-3 text-sm",
        md: "min-h-11 px-4 text-base",
        lg: "min-h-12 px-6 text-lg",
      },
      // stretch to share a row with other buttons
      grow: { true: "min-w-36 flex-1", false: "" },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "outline", size: "md", grow: false, block: false },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, grow, block, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size, grow, block }), className)} {...props} />;
}
