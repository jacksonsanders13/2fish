"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { unblockUser } from "@/lib/actions/needs";
import { idle } from "@/lib/action-result";
import { SubmitButton } from "@/components/forms/submit-button";

export function UnblockButton({ userId }: { userId: string }) {
  const [state, action] = useActionState(unblockUser, idle);
  const router = useRouter();
  useEffect(() => {
    if (state.ok) {
      toast.success(state.message ?? "Unblocked.");
      router.refresh();
    } else if (state.error) toast.error(state.error);
  }, [state, router]);
  return (
    <form action={action}>
      <input type="hidden" name="userId" value={userId} />
      <SubmitButton variant="outline" size="sm" pendingText="…">
        Unblock
      </SubmitButton>
    </form>
  );
}
