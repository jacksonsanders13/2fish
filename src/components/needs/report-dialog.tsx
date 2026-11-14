"use client";

import { useState } from "react";
import { FlagIcon } from "lucide-react";
import { toast } from "sonner";
import { submitReport } from "@/lib/actions/needs";
import { idle, type ActionResult } from "@/lib/action-result";
import { REPORT_REASONS } from "@/lib/validation/need";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormAlert, fieldError } from "@/components/forms/form-alert";

export function ReportDialog({
  targetType,
  targetId,
  label = "Report",
  trigger,
}: {
  targetType: "need" | "profile" | "message";
  targetId: string;
  label?: string;
  trigger?: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ActionResult>(idle);
  const [reason, setReason] = useState<string>("");

  async function action(fd: FormData) {
    const result = await submitReport(idle, fd);
    setState(result);
    if (result.ok) {
      toast.success(result.message ?? "Report sent.");
      setOpen(false);
      setReason("");
    }
  }

  const what = targetType === "need" ? "post" : targetType === "profile" ? "person" : "message";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <FlagIcon /> {label}
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report this {what}</DialogTitle>
          <DialogDescription>A real person reviews every report. The other party won't be told who reported them.</DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <input type="hidden" name="targetType" value={targetType} />
          <input type="hidden" name="targetId" value={targetId} />
          <input type="hidden" name="reason" value={reason} />
          <FormAlert state={state} />
          <RadioGroup value={reason} onValueChange={(v) => setReason(String(v))} className="gap-2">
            {Object.entries(REPORT_REASONS).map(([value, text]) => (
              <label key={value} className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm hover:bg-muted has-data-checked:border-foreground">
                <RadioGroupItem value={value} />
                {text}
              </label>
            ))}
          </RadioGroup>
          <FieldError errors={fieldError(state, "reason")} />
          <Field>
            <FieldLabel htmlFor="details">Anything else? (optional)</FieldLabel>
            <Textarea id="details" name="details" rows={3} maxLength={1000} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton pendingText="Sending…">Send report</SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
