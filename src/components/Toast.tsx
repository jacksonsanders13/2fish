"use client";

import { useBoard } from "./BoardProvider";

export default function Toast() {
  const { toastMsg } = useBoard();
  return (
    <div role="status" className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center px-4">
      {toastMsg && (
        // keyed on the message so each new toast replays the entrance
        <div key={toastMsg} className="max-w-full rounded-md bg-foreground px-4 py-3 text-sm font-bold text-background shadow-pop animate-toast-in">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
