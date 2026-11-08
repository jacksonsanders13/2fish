import NeedCard from "./NeedCard";
import type { Need } from "@/lib/types";

export default function NeedList({ needs, empty }: { needs: Need[]; empty: string }) {
  if (!needs.length) return <div className="box px-3 py-8 text-center text-muted">{empty}</div>;
  return (
    <div className="grid gap-3">
      {needs.map((n) => (
        <NeedCard key={n.id} need={n} />
      ))}
    </div>
  );
}
