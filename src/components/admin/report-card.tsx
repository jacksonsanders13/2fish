"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BanIcon, CheckIcon, MessageSquareOffIcon, Trash2Icon, XIcon } from "lucide-react";
import { adminBanUser, adminDeleteMessage, adminRemoveNeed, resolveReport } from "@/lib/actions/admin";
import { idle, type ActionResult } from "@/lib/action-result";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/forms/submit-button";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export type ReportView = {
  id: string;
  status: "open" | "resolved" | "dismissed";
  reason: string;
  details: string | null;
  createdAt: string;
  resolutionNote: string | null;
  reporter: { id: string; displayName: string } | null;
  subjectUser: { id: string; displayName: string; isBanned: boolean } | null;
  subject:
    | { kind: "need"; id: string; title: string; description: string; status: string }
    | { kind: "profile"; id: string; displayName: string; area: string | null }
    | { kind: "message"; id: string; body: string; threadId: string }
    | { kind: "missing" };
};

function useToast(state: ActionResult) {
  const router = useRouter();
  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message);
      router.refresh();
    } else if (!state.ok && state.error) toast.error(state.error);
  }, [state, router]);
}

export function ReportCard({ report: r }: { report: ReportView }) {
  const [resolveState, resolveAction] = useActionState(resolveReport, idle);
  const [removeState, removeAction] = useActionState(adminRemoveNeed, idle);
  const [banState, banAction] = useActionState(adminBanUser, idle);
  const [msgState, msgAction] = useActionState(adminDeleteMessage, idle);
  useToast(resolveState);
  useToast(removeState);
  useToast(banState);
  useToast(msgState);

  return (
    <article className={cn("rounded-2xl border bg-card p-5", r.status !== "open" && "opacity-75")}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant={r.status === "open" ? "default" : "secondary"}>{r.status}</Badge>
        <span className="font-medium text-foreground">{r.reason}</span>
        <span>· {timeAgo(r.createdAt)}</span>
        {r.reporter && (
          <span>
            · reported by{" "}
            <Link href={`/u/${r.reporter.id}`} className="underline">
              {r.reporter.displayName}
            </Link>
          </span>
        )}
      </div>
      {r.details && <p className="mt-2 text-sm">“{r.details}”</p>}

      <div className="mt-4 rounded-xl border bg-background p-4 text-sm">
        {r.subject.kind === "need" && (
          <>
            <p className="text-xs text-muted-foreground">Post · {r.subject.status}</p>
            <Link href={`/needs/${r.subject.id}`} className="mt-1 block font-medium underline-offset-4 hover:underline">
              {r.subject.title}
            </Link>
            <p className="mt-1 line-clamp-3 text-muted-foreground">{r.subject.description}</p>
          </>
        )}
        {r.subject.kind === "profile" && (
          <>
            <p className="text-xs text-muted-foreground">Profile</p>
            <Link href={`/u/${r.subject.id}`} className="mt-1 block font-medium underline-offset-4 hover:underline">
              {r.subject.displayName}
            </Link>
            {r.subject.area && <p className="text-muted-foreground">{r.subject.area}</p>}
          </>
        )}
        {r.subject.kind === "message" && (
          <>
            <p className="text-xs text-muted-foreground">Message</p>
            <p className="mt-1 whitespace-pre-wrap">{r.subject.body}</p>
          </>
        )}
        {r.subject.kind === "missing" && <p className="text-muted-foreground">The reported content was already removed.</p>}
        {r.subjectUser && (
          <p className="mt-2 text-xs text-muted-foreground">
            By{" "}
            <Link href={`/u/${r.subjectUser.id}`} className="underline">
              {r.subjectUser.displayName}
            </Link>
            {r.subjectUser.isBanned && <Badge variant="destructive" className="ml-2">banned</Badge>}
          </p>
        )}
      </div>

      {r.status === "open" ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {r.subject.kind === "need" && (
            <form action={removeAction}>
              <input type="hidden" name="needId" value={r.subject.id} />
              <SubmitButton variant="outline" size="sm" pendingText="Removing…">
                <Trash2Icon /> Remove post
              </SubmitButton>
            </form>
          )}
          {r.subject.kind === "message" && (
            <form action={msgAction}>
              <input type="hidden" name="messageId" value={r.subject.id} />
              <SubmitButton variant="outline" size="sm" pendingText="Removing…">
                <MessageSquareOffIcon /> Remove message
              </SubmitButton>
            </form>
          )}
          {r.subjectUser && (
            <form action={banAction}>
              <input type="hidden" name="userId" value={r.subjectUser.id} />
              <input type="hidden" name="ban" value={r.subjectUser.isBanned ? "false" : "true"} />
              <SubmitButton variant="outline" size="sm" className={cn(!r.subjectUser.isBanned && "text-destructive")} pendingText="…">
                <BanIcon /> {r.subjectUser.isBanned ? "Lift ban" : "Ban user"}
              </SubmitButton>
            </form>
          )}
          <form action={resolveAction} className="ml-auto flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={r.id} />
            <Input name="note" placeholder="Note (optional)" className="h-7 w-44 text-xs" />
            <SubmitButton name="status" value="dismissed" variant="ghost" size="sm" pendingText="…">
              <XIcon /> Dismiss
            </SubmitButton>
            <SubmitButton name="status" value="resolved" size="sm" pendingText="…">
              <CheckIcon /> Resolve
            </SubmitButton>
          </form>
        </div>
      ) : (
        r.resolutionNote && <p className="mt-3 text-xs text-muted-foreground">Note: {r.resolutionNote}</p>
      )}
    </article>
  );
}
