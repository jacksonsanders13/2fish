import { cva } from "class-variance-authority";
import type { Status } from "@/lib/types";

// Posted -> Helper found -> Received. The fill grows with scaleX so the
// animation stays on the GPU.
const fill = cva("block h-full origin-left rounded-full bg-success transition-transform duration-700 ease-out-soft", {
  variants: {
    status: { open: "scale-x-[.12]", pledged: "scale-x-[.6]", done: "scale-x-100" },
  },
});

const STEPS = ["Posted", "Helper found", "Received"];
const STEP: Record<Status, number> = { open: 0, pledged: 1, done: 2 };

export function StatusProgress({ status }: { status: Status }) {
  return (
    <div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="Progress"
        aria-valuemin={1}
        aria-valuemax={3}
        aria-valuenow={STEP[status] + 1}
        aria-valuetext={STEPS[STEP[status]]}
      >
        <i className={fill({ status })} />
      </div>
      <ol className="m-0 mt-2 flex list-none justify-between p-0 text-xs font-bold">
        {STEPS.map((label, i) => (
          <li key={label} className={i <= STEP[status] ? "text-foreground" : "text-muted-foreground"}>
            {label}
          </li>
        ))}
      </ol>
    </div>
  );
}
