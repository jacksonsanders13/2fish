"use client";

import { useBoard } from "./BoardProvider";

export default function Toast() {
  const { toastMsg } = useBoard();
  return (
    <div role="status" className="pointer-events-none fixed inset-x-0 bottom-5 z-20 flex justify-center px-4">
      {toastMsg && (
        <div className="max-w-full rounded-[10px] bg-ink px-4 py-2.5 text-sm font-bold text-surface shadow-lg">{toastMsg}</div>
      )}
    </div>
  );
}
