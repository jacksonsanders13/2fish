import { cva, type VariantProps } from "class-variance-authority";
import NeedCard from "./NeedCard";
import EmptyState from "./EmptyState";
import type { Need } from "@/lib/types";

// How many columns of cards, per page layout. See "Responsive strategy"
// in docs/design-system.md.
const listVariants = cva("m-0 grid list-none items-start gap-4 p-0", {
  variants: {
    layout: {
      // feed sits next to a sidebar from lg up, so it drops back to 1 column there
      feed: "md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2",
      // full-width pages
      wide: "md:grid-cols-2 xl:grid-cols-3",
    },
  },
  defaultVariants: { layout: "feed" },
});

type Props = VariantProps<typeof listVariants> & { needs: Need[]; empty: string; emptyAction?: React.ReactNode };

export default function NeedList({ needs, empty, emptyAction, layout }: Props) {
  if (!needs.length) return <EmptyState action={emptyAction}>{empty}</EmptyState>;
  return (
    <ul className={listVariants({ layout })}>
      {needs.map((n, i) => (
        // --i drives the staggered fade-in
        <li key={n.id} className="grid" style={{ "--i": i } as React.CSSProperties}>
          <NeedCard need={n} />
        </li>
      ))}
    </ul>
  );
}
