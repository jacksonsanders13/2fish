"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MapPinIcon, SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";
import { CATEGORIES, CATEGORY_META, RADIUS_OPTIONS, URGENCY_META } from "@/lib/needs/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type FeedState = {
  q: string;
  category: string;
  urgency: string;
  radius: number;
  zip: string;
};

export function FeedFilters({ state, hasLocation, signedIn }: { state: FeedState; hasLocation: boolean; signedIn: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(state.q);
  const [zip, setZip] = useState(state.zip);

  const update = useCallback(
    (patch: Partial<Record<keyof FeedState | "page", string | number | null>>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === "" || v === undefined) next.delete(k);
        else next.set(k, String(v));
      }
      if (!("page" in patch)) next.delete("page");
      startTransition(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }));
    },
    [params, pathname, router],
  );

  // debounce the search box
  useEffect(() => {
    if (q === state.q) return;
    const t = setTimeout(() => update({ q }), 350);
    return () => clearTimeout(t);
  }, [q, state.q, update]);

  const activeCount = (state.category ? 1 : 0) + (state.urgency ? 1 : 0);

  const filterBody = (
    <div className="space-y-6">
      <section>
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Distance</h3>
        {!signedIn && (
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              update({ zip: zip.replace(/\D/g, "").slice(0, 5) });
            }}
          >
            <Input value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))} inputMode="numeric" placeholder="Your ZIP" aria-label="Your ZIP code" className="w-28" />
            <Button type="submit" variant="outline">
              <MapPinIcon /> Set
            </Button>
          </form>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {RADIUS_OPTIONS.map((r) => (
            <Chip key={r} on={state.radius === r} disabled={!hasLocation} onClick={() => update({ radius: r })}>
              {r} mi
            </Chip>
          ))}
          <Chip on={state.radius === 0} onClick={() => update({ radius: 0 })}>
            Anywhere
          </Chip>
        </div>
        {!hasLocation && (
          <p className="mt-2 text-xs text-muted-foreground">
            {signedIn ? "Add your ZIP in settings to sort by distance." : "Enter a ZIP to sort by distance."}
          </p>
        )}
      </section>

      <section>
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Category</h3>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Chip on={!state.category} onClick={() => update({ category: null })}>
            All
          </Chip>
          {CATEGORIES.map((c) => {
            const Icon = CATEGORY_META[c].icon;
            return (
              <Chip key={c} on={state.category === c} onClick={() => update({ category: state.category === c ? null : c })}>
                <Icon className="size-3.5" /> {CATEGORY_META[c].label}
              </Chip>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Urgency</h3>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Chip on={!state.urgency} onClick={() => update({ urgency: null })}>
            Any
          </Chip>
          <Chip on={state.urgency === "high"} onClick={() => update({ urgency: state.urgency === "high" ? null : "high" })}>
            {URGENCY_META.high.label} only
          </Chip>
        </div>
      </section>

      {activeCount > 0 && (
        <Button variant="ghost" size="sm" onClick={() => update({ category: null, urgency: null })}>
          <XIcon /> Clear filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      <div className="flex gap-2">
        <label className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search needs" aria-label="Search needs" className="h-10 pl-9" />
        </label>
        <Sheet>
          <SheetTrigger render={<Button variant="outline" className="h-10 lg:hidden" />}>
            <SlidersHorizontalIcon />
            Filters
            {activeCount > 0 && <span className="rounded-full bg-foreground px-1.5 text-[10px] text-background">{activeCount}</span>}
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-2xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
            <SheetTitle className="mb-4">Filters</SheetTitle>
            {filterBody}
          </SheetContent>
        </Sheet>
      </div>
      <aside className={cn("hidden lg:block", pending && "opacity-70")}>{filterBody}</aside>
    </>
  );
}

function Chip({ on, disabled, onClick, children }: { on: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border bg-card px-3 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40",
        on && "border-foreground bg-foreground text-background hover:bg-foreground",
      )}
    >
      {children}
    </button>
  );
}
