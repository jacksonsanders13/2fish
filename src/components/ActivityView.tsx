"use client";

import Link from "next/link";
import { useState } from "react";
import NeedList from "./NeedList";
import Loading from "./Loading";
import LoadError from "./LoadError";
import { useBoard } from "./BoardProvider";
import { Avatar } from "./ui/avatar";
import { buttonVariants } from "./ui/button";
import { Segmented } from "./ui/segmented";
import { Heading, Text } from "./ui/typography";
import { zipOk } from "@/lib/format";

type Tab = "posted" | "helping";

// Like a profile page: who you are, then your posts and the ones you're helping with.
export default function ActivityView() {
  const { ready, needs, me, loadError, reload, displayName, zip } = useBoard();
  const [tab, setTab] = useState<Tab>("posted");

  const posted = needs.filter((n) => n.posterId === me);
  const helping = needs.filter((n) => n.helper?.id === me);
  const received = posted.filter((n) => n.status === "done").length;

  return (
    <>
      <section className="grid gap-4 border-b border-border px-4 py-6" aria-labelledby="me-title">
        <div className="flex items-center gap-4">
          <Avatar name={displayName || "You"} tone="brand" size="lg" />
          <div className="grid gap-0.5">
            <Heading as="h1" level="page" id="me-title">
              {displayName || "You"}
            </Heading>
            <Text variant="meta">{zipOk(zip) ? `Neighbor in ${zip}` : "Add your ZIP on the feed to see needs nearby"}</Text>
          </div>
        </div>
        <dl className="m-0 flex gap-6">
          {[
            ["Posted", posted.length],
            ["Helping", helping.length],
            ["Received", received],
          ].map(([label, value]) => (
            <div key={label} className="flex items-baseline gap-1.5">
              <dd className="m-0 font-display text-lg font-extrabold tabular-nums">{ready ? value : "–"}</dd>
              <dt className="text-sm text-muted-foreground">{label}</dt>
            </div>
          ))}
        </dl>
        <Segmented
          label="Show"
          value={tab}
          onChange={setTab}
          options={[
            { value: "posted", label: "My posts" },
            { value: "helping", label: "I'm helping" },
          ]}
        />
      </section>

      {!ready ? (
        <Loading />
      ) : loadError ? (
        <div className="p-4">
          <LoadError message={loadError} onRetry={reload} />
        </div>
      ) : tab === "posted" ? (
        <NeedList
          needs={posted}
          empty="You haven't posted a need. Asking is brave, and neighbors want to help."
          emptyAction={
            <Link href="/post" className={buttonVariants({ variant: "primary" })}>
              Post a need
            </Link>
          }
        />
      ) : (
        <NeedList
          needs={helping}
          empty="You haven't offered to help yet."
          emptyAction={
            <Link href="/" className={buttonVariants({ variant: "outline" })}>
              Browse the feed
            </Link>
          }
        />
      )}
    </>
  );
}
