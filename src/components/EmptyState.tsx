import Logo from "./Logo";
import { Card } from "./ui/card";

export default function EmptyState({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Card variant="muted" padding="lg" className="grid justify-items-center gap-4 text-center">
      <Logo size={56} motion="float" />
      <p className="m-0 max-w-sm text-muted-foreground">{children}</p>
      {action}
    </Card>
  );
}
