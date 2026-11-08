import { AVATAR_COLORS } from "@/lib/categories";
import { hash } from "@/lib/format";

export default function Avatar({ name, seed, color }: { name: string; seed?: string; color?: string }) {
  const bg = color ?? AVATAR_COLORS[hash(seed || name || "n") % AVATAR_COLORS.length];
  const letter = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="grid size-[42px] flex-none place-items-center rounded-full text-[17px] font-black text-white" style={{ background: bg }}>
      {letter}
    </div>
  );
}
