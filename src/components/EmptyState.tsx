import Logo from "./Logo";
import { Text } from "./ui/typography";

export default function EmptyState({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="grid justify-items-center gap-4 px-6 py-16 text-center">
      <Logo size={64} motion="float" />
      <Text tone="muted" className="max-w-xs">
        {children}
      </Text>
      {action}
    </div>
  );
}
