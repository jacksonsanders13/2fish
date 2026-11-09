"use client";

import Link from "next/link";
import NeedList from "./NeedList";
import Tabs from "./Tabs";
import Loading from "./Loading";
import LoadError from "./LoadError";
import { useBoard } from "./BoardProvider";
import { buttonVariants } from "./ui/button";

export default function ActivityView() {
  const { ready, needs, me, loadError, reload } = useBoard();

  return (
    <div className="grid gap-6">
      <Tabs active="/activity" />
      <h1 className="m-0 text-3xl font-black tracking-tight md:text-4xl">My activity</h1>
      {!ready ? (
        <Loading />
      ) : loadError ? (
        <LoadError message={loadError} onRetry={reload} />
      ) : (
        <>
          <section className="grid gap-4" aria-labelledby="mine-title">
            <h2 id="mine-title" className="m-0 text-xl font-black md:text-2xl">
              Needs I posted
            </h2>
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
            <h2 id="helping-title" className="m-0 text-xl font-black md:text-2xl">
              Needs I&apos;m helping with
            </h2>
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
