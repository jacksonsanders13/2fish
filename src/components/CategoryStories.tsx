"use client";

import { cva } from "class-variance-authority";
import { CATEGORY_META } from "./category";
import { useBoard } from "./BoardProvider";
import { CATEGORIES } from "@/lib/categories";

// Round category filters, like a stories row. The selected one gets a
// coral ring; selection is carried by aria-pressed.
const bubble = cva(
  "group flex w-16 flex-none cursor-pointer flex-col items-center gap-1.5 border-0 bg-transparent p-0 text-xs font-semibold text-muted-foreground aria-pressed:text-foreground",
);
const circle = cva(
  "grid size-14 place-items-center rounded-full bg-muted ring-2 ring-transparent ring-offset-2 ring-offset-background transition-[box-shadow,transform] duration-200 ease-smooth group-hover:scale-105 group-aria-pressed:bg-primary-soft group-aria-pressed:ring-primary [&_svg]:size-6",
);

export default function CategoryStories() {
  const { cat, setCat } = useBoard();
  return (
    <div role="group" aria-label="Category" className="flex gap-3 overflow-x-auto px-4 py-3 [scrollbar-width:none]">
      {(["All", ...CATEGORIES] as const).map((c) => {
        const { icon: Icon, text } = CATEGORY_META[c];
        return (
          <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className={bubble()}>
            <span className={`${circle()} ${text}`}>
              <Icon aria-hidden="true" />
            </span>
            {c}
          </button>
        );
      })}
    </div>
  );
}
