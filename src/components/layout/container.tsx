import { cn } from "@/lib/utils";

export function Container({
  className,
  size = "lg",
  ...props
}: React.ComponentProps<"div"> & { size?: "sm" | "md" | "lg" }) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6",
        size === "sm" && "max-w-2xl",
        size === "md" && "max-w-4xl",
        size === "lg" && "max-w-6xl",
        className,
      )}
      {...props}
    />
  );
}
