import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Use <Button> for buttons. For links that look like buttons, use
// className={buttonVariants({ ... })} on <Link> or <a> (combine with cn()).
export const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border font-bold no-underline transition-[transform,background-color,box-shadow,border-color,color] duration-200 ease-smooth active:scale-[.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // the one brand action: I'll help, Post, Count me in, I got it
        primary: "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-glow",
        // quiet filled: Cancel, Remove
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-border",
        outline: "border-border bg-surface text-foreground hover:bg-muted",
        // text-only, for icon rows and low-priority actions
        ghost: "border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
        destructive: "border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // preview-only testing controls, deliberately low-key
        dev: "border-dashed border-input bg-transparent font-semibold text-muted-foreground hover:bg-muted",
      },
      size: {
        sm: "min-h-9 px-4 text-sm [&_svg]:size-4",
        md: "min-h-11 px-5 text-base",
        lg: "min-h-12 px-6 text-lg",
        // round icon-only button; always pass an aria-label
        icon: "size-10 p-0",
      },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "outline", size: "md", block: false },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, block, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size, block }), className)} {...props} />;
}
