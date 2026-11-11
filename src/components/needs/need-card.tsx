import Link from "next/link";
import { ClockIcon, GiftIcon, MapPinIcon, ZapIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_META, FULFILLMENT_META, STATUS_META, type Category, type Fulfillment, type Status, type Urgency } from "@/lib/needs/constants";
import { formatDistance, initials, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export type NeedCardData = {
  id: string;
  title: string;
  description: string;
  category: Category;
  urgency: Urgency;
  status: Status;
  fulfillment: Fulfillment;
  createdAt: string;
  distanceMiles?: number | null;
  photoUrl?: string | null;
  poster: { displayName: string; avatarUrl?: string | null; area?: string | null };
};

export function NeedCard({
  need,
  href,
  className,
  interactive = true,
}: {
  need: NeedCardData;
  href?: string;
  className?: string;
  interactive?: boolean;
}) {
  const cat = CATEGORY_META[need.category];
  const CatIcon = cat.icon;
  const dist = formatDistance(need.distanceMiles);
  const classes = cn(
    "group relative flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-soft transition-all",
    interactive && "hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-2",
    className,
  );

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex size-6 items-center justify-center rounded-md bg-muted text-foreground">
            <CatIcon className="size-3.5" />
          </span>
          <span className="font-medium text-foreground">{cat.label}</span>
          {need.urgency === "high" && need.status === "open" && (
            <Badge className="bg-brand-soft text-brand-text">
              <ZapIcon /> Urgent
            </Badge>
          )}
        </div>
        <StatusPill status={need.status} />
      </div>

      <div>
        <h3 className="text-title text-[15px] font-semibold leading-snug">{need.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{need.description}</p>
      </div>

      {need.photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={need.photoUrl}
          alt=""
          className="aspect-[16/9] w-full rounded-lg border object-cover"
          loading="lazy"
        />
      )}

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Avatar size="sm">
            {need.poster.avatarUrl && <AvatarImage src={need.poster.avatarUrl} alt="" />}
            <AvatarFallback className="text-[10px]">{initials(need.poster.displayName)}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">{need.poster.displayName}</span>
        </span>
        {(dist || need.poster.area) && (
          <span className="inline-flex items-center gap-1">
            <MapPinIcon className="size-3.5" />
            {dist ?? need.poster.area}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <GiftIcon className="size-3.5" />
          {FULFILLMENT_META[need.fulfillment].label}
        </span>
        <span className="inline-flex items-center gap-1">
          <ClockIcon className="size-3.5" />
          {timeAgo(need.createdAt)}
        </span>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {body}
      </Link>
    );
  }
  return <div className={classes}>{body}</div>;
}

export function StatusPill({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1.5 rounded-full border px-2 text-[11px] font-medium",
        status === "open" && "border-border bg-background text-foreground",
        status === "pledged" && "border-brand/40 bg-brand-soft text-brand-text",
        status === "fulfilled" && "border-success/40 bg-success-soft text-success",
        status === "closed" && "border-border bg-muted text-muted-foreground",
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "open" && "bg-foreground/60",
          status === "pledged" && "bg-brand",
          status === "fulfilled" && "bg-success",
          status === "closed" && "bg-muted-foreground/60",
        )}
      />
      {STATUS_META[status].label}
    </span>
  );
}
