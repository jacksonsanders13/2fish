import { CircleCheck, Clock, PhoneMissed, Star, Video } from "lucide-react";
import { activity, type Activity } from "@/lib/data";
import { cn } from "@/lib/utils";

const icons: Record<Activity["kind"], typeof Clock> = {
  call: PhoneMissed,
  video: Video,
  review: Star,
  job: CircleCheck,
  reminder: Clock,
};

export function ActivityFeed({ className }: { className?: string }) {
  return (
    <ul className={cn("divide-y divide-line", className)}>
      {activity.map((a) => {
        const Icon = icons[a.kind];
        return (
          <li key={a.text} className="flex gap-3 py-3 first:pt-0 last:pb-0">
            <Icon size={16} className="mt-1 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p>{a.text}</p>
              <p className="num mt-0.5 text-sm text-muted-foreground">{a.when}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
