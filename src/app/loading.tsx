import { LogoMark } from "@/components/brand/logo";

export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center py-32" role="status" aria-label="Loading">
      <LogoMark size={36} className="animate-pulse text-brand" />
    </div>
  );
}
