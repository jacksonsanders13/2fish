import { Button } from "./ui/button";
import { Notice } from "./ui/notice";

// Shown when the board can't be loaded (offline, Supabase down, bad keys).
export default function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Notice variant="danger" role="alert" className="grid justify-items-start gap-2">
      <span>Couldn&apos;t load the board. {message}</span>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </Notice>
  );
}
