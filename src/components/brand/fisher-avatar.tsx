import { cn } from "@/lib/utils";

// Fisher, the 2fish helper: a little white fish in a coral bucket hat.
// Drawn from plain shapes so it stays sharp at any size and uses the brand colors.
export function FisherAvatar({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" role="img" aria-label="Fisher" className={cn("shrink-0", className)}>
      <circle cx="20" cy="20" r="20" fill="var(--night)" />
      {/* tail */}
      <path d="M10.5 22 L4 16.5 Q5.5 22 4 27.5 Z" fill="var(--signal)" />
      {/* body */}
      <ellipse cx="20.5" cy="23" rx="11" ry="7.5" fill="#fff" />
      {/* gill */}
      <path d="M21.5 19 Q19.2 23 21.5 27" fill="none" stroke="var(--night)" strokeWidth="1.3" strokeLinecap="round" />
      {/* bucket hat */}
      <path d="M19.5 16 Q19.8 10.5 24 10.5 Q28.2 10.5 28.5 16 Z" fill="var(--signal)" />
      <ellipse cx="24" cy="16" rx="7" ry="1.7" fill="var(--signal-tint)" />
      {/* eye and smile */}
      <circle cx="26.5" cy="21.5" r="1.7" fill="var(--ink)" />
      <circle cx="27.1" cy="20.9" r="0.55" fill="#fff" />
      <path d="M27.6 25.2 Q29.2 26.4 30.6 25" fill="none" stroke="var(--ink)" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
