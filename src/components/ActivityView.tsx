"use client";

import NeedList from "./NeedList";
import Tabs from "./Tabs";
import Loading from "./Loading";
import { useBoard } from "./BoardProvider";

export default function ActivityView() {
  const { ready, needs, me } = useBoard();

  return (
    <>
      <Tabs active="/activity" />
      {!ready ? (
        <Loading />
      ) : (
        <>
          <h2 className="mt-1.5 mb-0 text-[17px] font-black">Needs I posted</h2>
          <NeedList needs={needs.filter((n) => n.posterId === me)} empty="You haven't posted a need." />
          <h2 className="mt-1.5 mb-0 text-[17px] font-black">Needs I&apos;m helping with</h2>
          <NeedList needs={needs.filter((n) => n.helper?.id === me)} empty="You haven't offered to help yet." />
        </>
      )}
    </>
  );
}
