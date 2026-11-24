import { cn } from "@/lib/utils";

// Fisher, the marketing helper: a plain line-drawn fish.
// The picture lives in public/brand/fisher.png.
export function FisherAvatar({ size = 32, className }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny static file, no need for the image optimizer
    <img
      src="/brand/fisher.png"
      alt="Fisher"
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full border border-line bg-white object-contain", className)}
    />
  );
}
