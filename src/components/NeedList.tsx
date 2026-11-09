import NeedCard from "./NeedCard";
import EmptyState from "./EmptyState";
import type { Need } from "@/lib/types";

type Props = { needs: Need[]; empty: string; emptyAction?: React.ReactNode };

export default function NeedList({ needs, empty, emptyAction }: Props) {
  if (!needs.length) return <EmptyState action={emptyAction}>{empty}</EmptyState>;
  return (
    <ul className="m-0 list-none p-0">
      {needs.map((n, i) => (
        // --i drives the staggered fade-in
        <li key={n.id} style={{ "--i": i } as React.CSSProperties}>
          <NeedCard need={n} />
        </li>
      ))}
    </ul>
  );
}
