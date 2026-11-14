"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArchiveIcon, ArchiveRestoreIcon, CheckCircle2Icon, HandHeartIcon, MessageSquareIcon, PencilIcon, Trash2Icon, UserXIcon } from "lucide-react";
import { blockUser, cancelOffer, closeNeed, deleteNeed, markFulfilled, offerHelp, reopenNeed } from "@/lib/actions/needs";
import { idle, type ActionResult } from "@/lib/action-result";
import type { Status } from "@/lib/needs/constants";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SubmitButton } from "@/components/forms/submit-button";
import { ReportDialog } from "./report-dialog";

type Props = {
  needId: string;
  status: Status;
  viewer: "anon" | "poster" | "helper" | "other";
  posterId: string;
  threadId?: string | null;
  helperName?: string | null;
};

function useToastResult(state: ActionResult) {
  const router = useRouter();
  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message);
      router.refresh();
    } else if (!state.ok && state.error) toast.error(state.error);
  }, [state, router]);
}

export function NeedActions({ needId, status, viewer, posterId, threadId, helperName }: Props) {
  if (viewer === "anon") {
    return status === "open" ? (
      <div className="space-y-3">
        <Button size="lg" className="h-11 w-full text-[15px]" render={<Link href={`/login?next=/needs/${needId}`} />}>
          <HandHeartIcon data-icon="inline-start" /> I can help
        </Button>
        <p className="text-center text-xs text-muted-foreground">Sign in or create a free account to offer.</p>
      </div>
    ) : null;
  }

  if (viewer === "poster") return <PosterActions needId={needId} status={status} threadId={threadId} helperName={helperName} />;
  if (viewer === "helper") return <HelperActions needId={needId} status={status} threadId={threadId} />;
  return <OtherActions needId={needId} status={status} posterId={posterId} />;
}

function OtherActions({ needId, status, posterId }: { needId: string; status: Status; posterId: string }) {
  const [state, action] = useActionState(offerHelp, idle);
  useToastResult(state);
  return (
    <div className="space-y-3">
      {status === "open" ? (
        <form action={action}>
          <input type="hidden" name="id" value={needId} />
          <SubmitButton size="lg" className="h-11 w-full text-[15px]" pendingText="One sec…">
            <HandHeartIcon data-icon="inline-start" /> I can help
          </SubmitButton>
        </form>
      ) : (
        <p className="rounded-lg border bg-muted/40 px-3 py-2 text-center text-sm text-muted-foreground">
          {status === "pledged" ? "Another neighbor is already on it." : "This need is no longer open."}
        </p>
      )}
      <p className="text-center text-xs text-muted-foreground">
        Offering opens a private conversation. Read the{" "}
        <Link href="/safety" className="underline underline-offset-4">
          safety tips
        </Link>{" "}
        first.
      </p>
      <div className="flex justify-center gap-1">
        <ReportDialog targetType="need" targetId={needId} />
        <BlockButton userId={posterId} />
      </div>
    </div>
  );
}

function HelperActions({ needId, status, threadId }: { needId: string; status: Status; threadId?: string | null }) {
  const [state, action] = useActionState(cancelOffer, idle);
  useToastResult(state);
  if (status === "fulfilled") {
    return (
      <div className="rounded-xl border border-success/40 bg-success-soft p-4 text-center">
        <CheckCircle2Icon className="mx-auto size-6 text-success" />
        <p className="mt-2 font-medium">You made this happen.</p>
        <p className="mt-1 text-sm text-muted-foreground">Your neighbor marked it received. Thank you.</p>
      </div>
    );
  }
  if (status !== "pledged") return null;
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-brand/40 bg-brand-soft p-4 text-sm text-brand-text">
        You offered to help. Work out the details in messages, and meet somewhere public.
      </div>
      {threadId && (
        <Button size="lg" className="w-full" render={<Link href={`/messages/${threadId}`} />}>
          <MessageSquareIcon data-icon="inline-start" /> Open conversation
        </Button>
      )}
      <form action={action}>
        <input type="hidden" name="id" value={needId} />
        <SubmitButton variant="ghost" className="w-full text-muted-foreground" pendingText="Cancelling…">
          I can't follow through
        </SubmitButton>
      </form>
    </div>
  );
}

function PosterActions({ needId, status, threadId, helperName }: { needId: string; status: Status; threadId?: string | null; helperName?: string | null }) {
  const [fulfillState, fulfillAction] = useActionState(markFulfilled, idle);
  const [closeState, closeAction] = useActionState(closeNeed, idle);
  const [reopenState, reopenAction] = useActionState(reopenNeed, idle);
  useToastResult(fulfillState);
  useToastResult(closeState);
  useToastResult(reopenState);

  return (
    <div className="space-y-3">
      {status === "pledged" && (
        <>
          <div className="rounded-xl border border-brand/40 bg-brand-soft p-4 text-sm text-brand-text">
            {helperName ?? "A neighbor"} offered to help. Agree on a public spot in messages, then mark it received once it's in your hands.
          </div>
          {threadId && (
            <Button size="lg" variant="outline" className="w-full" render={<Link href={`/messages/${threadId}`} />}>
              <MessageSquareIcon data-icon="inline-start" /> Message {helperName ?? "your helper"}
            </Button>
          )}
          <form action={fulfillAction}>
            <input type="hidden" name="id" value={needId} />
            <SubmitButton size="lg" className="h-11 w-full text-[15px]" pendingText="Saving…">
              <CheckCircle2Icon data-icon="inline-start" /> I got it, thank you
            </SubmitButton>
          </form>
        </>
      )}
      {status === "open" && (
        <p className="rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          Your need is live. You'll get a notification when a neighbor offers to help.
        </p>
      )}
      {status === "fulfilled" && (
        <div className="rounded-xl border border-success/40 bg-success-soft p-4 text-center text-sm">
          <CheckCircle2Icon className="mx-auto size-6 text-success" />
          <p className="mt-2 font-medium">Fulfilled. Glad it came through.</p>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {(status === "open" || status === "pledged") && (
          <Button variant="outline" size="sm" render={<Link href={`/needs/${needId}/edit`} />}>
            <PencilIcon /> Edit
          </Button>
        )}
        {(status === "open" || status === "pledged") && (
          <form action={closeAction}>
            <input type="hidden" name="id" value={needId} />
            <SubmitButton variant="outline" size="sm" pendingText="Closing…">
              <ArchiveIcon /> Close
            </SubmitButton>
          </form>
        )}
        {status === "closed" && (
          <form action={reopenAction}>
            <input type="hidden" name="id" value={needId} />
            <SubmitButton variant="outline" size="sm" pendingText="Reopening…">
              <ArchiveRestoreIcon /> Reopen
            </SubmitButton>
          </form>
        )}
        <DeleteButton needId={needId} />
      </div>
    </div>
  );
}

function DeleteButton({ needId }: { needId: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" />}>
        <Trash2Icon /> Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this post?</AlertDialogTitle>
          <AlertDialogDescription>This removes the post and its photo for good. Any conversation about it goes too.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <form action={deleteNeed}>
            <input type="hidden" name="id" value={needId} />
            <AlertDialogAction render={<SubmitButton variant="destructive" pendingText="Deleting…" />}>Delete</AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function BlockButton({ userId, label = "Block" }: { userId: string; label?: string }) {
  const [state, action] = useActionState(blockUser, idle);
  useToastResult(state);
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="ghost" size="sm" className="text-muted-foreground" />}>
        <UserXIcon /> {label}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Block this person?</AlertDialogTitle>
          <AlertDialogDescription>
            They won't see your posts and can't message you, and you won't see theirs. Any active offer between you is cancelled. You can undo this in Settings.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={action}>
            <input type="hidden" name="userId" value={userId} />
            <AlertDialogAction render={<SubmitButton variant="destructive" pendingText="Blocking…" />}>Block</AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
