"use client";

import Link from "next/link";
import NeedList from "./NeedList";
import { Heading } from "./ui/typography";
import Loading from "./Loading";
import LoadError from "./LoadError";
import { useBoard } from "./BoardProvider";
import { buttonVariants } from "./ui/button";

export default function ActivityView() {
  const { ready, needs, me, loadError, reload } = useBoard();

  return (
    <div className="grid gap-6">
      <Heading as="h1" level="page">
        My activity
      </Heading>
      {!ready ? (
        <Loading />
      ) : loadError ? (
        <LoadError message={loadError} onRetry={reload} />
      ) : (
        <>
          <section className="grid gap-4" aria-labelledby="mine-title">
            <Heading id="mine-title">Needs I posted</Heading>
            <NeedList
              layout="wide"
              needs={needs.filter((n) => n.posterId === me)}
              empty="You haven't posted a need. Asking is brave, and neighbors want to help."
              emptyAction={
                <Link href="/post" className={buttonVariants({ variant: "help" })}>
                  Post a need
                </Link>
              }
            />
          </section>
          <section className="grid gap-4" aria-labelledby="helping-title">
            <Heading id="helping-title">Needs I&apos;m helping with</Heading>
            <NeedList
              layout="wide"
              needs={needs.filter((n) => n.helper?.id === me)}
              empty="You haven't offered to help yet."
              emptyAction={
                <Link href="/" className={buttonVariants({ variant: "outline" })}>
                  Browse the feed
                </Link>
              }
            />
          </section>
        </>
      )}
    </div>
  );
}
