import { cva, type VariantProps } from "class-variance-authority";
import { hash } from "@/lib/format";
import { cn } from "@/lib/utils";

// Avatar colors are --avatar-1..8 tokens; one is picked from a hash of the
// person's id so the same neighbor always gets the same color.
const TONES = [
  "bg-avatar-1",
  "bg-avatar-2",
  "bg-avatar-3",
  "bg-avatar-4",
  "bg-avatar-5",
  "bg-avatar-6",
  "bg-avatar-7",
  "bg-avatar-8",
];

export const avatarVariants = cva("grid flex-none place-items-center rounded-full font-black text-on-color", {
  variants: {
    size: {
      sm: "size-8 text-sm",
      md: "size-11 text-lg",
      lg: "size-14 text-xl",
    },
  },
  defaultVariants: { size: "md" },
});

type AvatarProps = VariantProps<typeof avatarVariants> & {
  name: string;
  seed?: string;
  // "brand" = always primary (used for "you")
  tone?: "auto" | "brand";
};

export function Avatar({ name, seed, size, tone = "auto" }: AvatarProps) {
  const color = tone === "brand" ? "bg-primary text-primary-foreground" : TONES[hash(seed || name || "n") % TONES.length];
  const letter = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div className={cn(avatarVariants({ size }), color)} aria-hidden="true">
      {letter}
    </div>
  );
}
