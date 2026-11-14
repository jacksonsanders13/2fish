import { DatabaseIcon } from "lucide-react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

// Shown on data pages until .env.local has the Supabase keys.
export function SetupNotice() {
  return (
    <Empty className="border bg-card py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <DatabaseIcon />
        </EmptyMedia>
        <EmptyTitle>Database not connected yet</EmptyTitle>
        <EmptyDescription>
          Copy <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.env.example</code> to{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.env.local</code>, add your Supabase keys, run the
          migrations, and restart the dev server. The README has the steps.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
