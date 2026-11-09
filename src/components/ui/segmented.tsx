import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// iOS-style segmented control. Each option is a toggle button; the chosen
// one is marked with aria-pressed and styled from that.
const optionVariants = cva(
  "min-h-8 flex-1 cursor-pointer whitespace-nowrap rounded-full px-3 text-sm font-semibold text-muted-foreground transition-[background-color,color,box-shadow] duration-200 ease-smooth hover:text-foreground aria-pressed:bg-surface aria-pressed:text-foreground aria-pressed:shadow-card",
);

type Props<T extends string> = {
  label: string;
  options: readonly { value: T; label: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
};

export function Segmented<T extends string>({ label, options, value, onChange, className }: Props<T>) {
  return (
    <div role="group" aria-label={label} className={cn("flex gap-1 rounded-full bg-muted p-1", className)}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} className={optionVariants()} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
